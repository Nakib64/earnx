import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsService } from '../../sms/sms.service';
import { EmailService } from '../../email/email.service';
import { RequestStatus, TransactionType, Prisma } from '@prisma/client';

@Injectable()
export class WithdrawalAdminSubService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
    private readonly emailService: EmailService,
  ) { }

  /**
   * Admin: Get all withdrawals with search by name, user code, phone, email, or OTP
   */
  async getAllWithdrawals(page = 1, limit = 20, search?: string, status?: RequestStatus) {
    const skip = (page - 1) * limit;
    const where: Prisma.WithdrawalRequestWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      const searchConditions: Prisma.WithdrawalRequestWhereInput[] = [
        { otp: { contains: q, mode: 'insensitive' } },
        { user: { full_name: { contains: q, mode: 'insensitive' } } },
        { user: { referral_code: { contains: q, mode: 'insensitive' } } },
        { user: { phone: { contains: q, mode: 'insensitive' } } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { paid_to_user: { full_name: { contains: q, mode: 'insensitive' } } },
        { paid_to_user: { referral_code: { contains: q, mode: 'insensitive' } } },
      ];

      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.withdrawalRequest.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              phone: true,
              email: true,
              referral_code: true,
              wallet_balance: true,
            },
          },
          paid_to_user: {
            select: {
              id: true,
              full_name: true,
              phone: true,
              email: true,
              referral_code: true,
            },
          },
        },
      }),
      this.prisma.withdrawalRequest.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: Resend OTP to the user who requested the withdrawal
   */
  async resendOtp(withdrawalId: string) {
    const withdrawal = await this.prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
      include: { user: true },
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal request not found');
    }

    if (withdrawal.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Cannot resend OTP for a completed or non-pending withdrawal');
    }

    const now = new Date();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    await this.prisma.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: {
        otp,
        otp_expires_at: otpExpiresAt,
      },
    });

    const isEmailAccount = !withdrawal.user.phone && !!withdrawal.user.email;
    if (isEmailAccount) {
      await this.emailService.sendWithdrawalOtp(
        withdrawal.user.email!,
        otp,
        Number(withdrawal.amount),
      );
    } else if (withdrawal.user.phone) {
      await this.smsService.sendWithdrawalOtp(
        withdrawal.user.phone,
        otp,
        Number(withdrawal.amount),
      );
    } else if (withdrawal.user.email) {
      await this.emailService.sendWithdrawalOtp(
        withdrawal.user.email,
        otp,
        Number(withdrawal.amount),
      );
    }

    const targetDesc = isEmailAccount
      ? withdrawal.user.email
      : withdrawal.user.phone || withdrawal.user.email;
    return {
      success: true,
      message: `OTP resent successfully to ${targetDesc}.`,
      otp: process.env.NODE_ENV !== 'production' && !process.env.SMS_API_KEY ? otp : undefined,
    };
  }

  /**
   * Admin: Payment confirmation
   * Adds the withdrawal amount to the selected target user's wallet balance.
   */
  async processPayment(withdrawalId: string, targetUserId: string, adminPhone: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const withdrawal = await tx.withdrawalRequest.findUnique({
          where: { id: withdrawalId },
          include: { user: true },
        });

        if (!withdrawal) {
          throw new NotFoundException('Withdrawal request not found');
        }

        if (withdrawal.status !== RequestStatus.PENDING) {
          throw new BadRequestException(
            'This withdrawal has already been processed or is not pending',
          );
        }

        const targetUser = await tx.user.findUnique({
          where: { id: targetUserId },
        });

        if (!targetUser) {
          throw new NotFoundException('Target recipient user not found');
        }

        const numAmount = Number(withdrawal.amount);

        // 1. Mark withdrawal request as APPROVED / Paid atomically
        const updateResult = await tx.withdrawalRequest.updateMany({
          where: { id: withdrawalId, status: RequestStatus.PENDING },
          data: {
            status: RequestStatus.APPROVED,
            paid_to_user_id: targetUserId,
            paid_at: new Date(),
            approved_by: adminPhone,
          },
        });

        if (updateResult.count === 0) {
          throw new BadRequestException(
            'This withdrawal has already been processed or is not pending',
          );
        }

        // 2. Credit target user balance atomically
        const updatedTargetUser = await tx.user.update({
          where: { id: targetUserId },
          data: { wallet_balance: { increment: new Prisma.Decimal(numAmount) } },
          select: { wallet_balance: true },
        });

        const recipientBalanceAfter = Number(updatedTargetUser.wallet_balance);
        const recipientBalanceBefore = recipientBalanceAfter - numAmount;

        // 3. Record  transaction for target user
        await tx.walletTransaction.create({
          data: {
            user_id: targetUserId,
            type: TransactionType.DEPOSIT,
            amount: new Prisma.Decimal(numAmount),
            balance_before: new Prisma.Decimal(recipientBalanceBefore),
            balance_after: new Prisma.Decimal(recipientBalanceAfter),
            description: `Withdrawal payment received from ${withdrawal.user.full_name || withdrawal.user.phone || withdrawal.user.email
              } (${withdrawal.user.referral_code})`,
          },
        });

        const updatedWithdrawal = await tx.withdrawalRequest.findUnique({
          where: { id: withdrawalId },
          include: {
            user: true,
            paid_to_user: true,
          },
        });

        return {
          success: true,
          message: `Successfully paid ৳${numAmount.toFixed(2)} to ${targetUser.full_name || targetUser.phone || targetUser.email
            } (${targetUser.referral_code}).`,
          withdrawal: updatedWithdrawal,
        };
      },
      { maxWait: 10000, timeout: 30000 },
    );
  }
}
