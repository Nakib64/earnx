import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from '../sms/sms.service';
import { RequestStatus, TransactionType, Prisma } from '@prisma/client';

@Injectable()
export class WithdrawalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
  ) {}

  /**
   * User requests withdrawal:
   * 1. Balance deducted from user immediately.
   * 2. 6-digit OTP generated and saved.
   * 3. SMS sent to user's phone number.
   * 4. Logged as PENDING (NOT sent to referrer).
   */
  async requestWithdrawal(userId: string, amount: number) {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new BadRequestException('Withdrawal amount must be greater than zero');
    }

    const now = new Date();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const currentBalance = Number(user.wallet_balance);
      if (currentBalance < numAmount) {
        throw new BadRequestException('Insufficient wallet balance for withdrawal');
      }

      const balanceAfter = currentBalance - numAmount;

      // 1. Deduct balance from user
      await tx.user.update({
        where: { id: userId },
        data: { wallet_balance: new Prisma.Decimal(balanceAfter) },
      });

      // 2. Record ledger transaction
      await tx.walletTransaction.create({
        data: {
          user_id: userId,
          type: TransactionType.WITHDRAW,
          amount: new Prisma.Decimal(-numAmount),
          balance_before: new Prisma.Decimal(currentBalance),
          balance_after: new Prisma.Decimal(balanceAfter),
          description: `Withdrawal request submitted (Pending confirmation)`,
        },
      });

      // 3. Create WithdrawalRequest record with 6-digit OTP
      const withdrawal = await tx.withdrawalRequest.create({
        data: {
          user_id: userId,
          amount: new Prisma.Decimal(numAmount),
          status: RequestStatus.PENDING,
          otp,
          otp_expires_at: otpExpiresAt,
        },
      });

      // 4. Send SMS to user
      await this.smsService.sendWithdrawalOtp(user.phone, otp, numAmount);

      return {
        success: true,
        message: `Withdrawal request of ৳${numAmount.toFixed(2)} submitted. A 6-digit OTP has been sent to ${user.phone}.`,
        withdrawal,
        newBalance: balanceAfter,
        ...(process.env.NODE_ENV !== 'production' && !process.env.SMS_API_KEY ? { devOtp: otp } : {}),
      };
    }, { maxWait: 10000, timeout: 30000 });
  }

  /**
   * User's own withdrawal history
   */
  async getUserWithdrawals(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.withdrawalRequest.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          paid_to_user: {
            select: {
              id: true,
              full_name: true,
              phone: true,
              referral_code: true,
            },
          },
        },
      }),
      this.prisma.withdrawalRequest.count({ where: { user_id: userId } }),
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
   * Admin: Get all withdrawals with search by name, user code, phone, or OTP
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
        orderBy: { created_at: 'desc' }, // Latest on the top
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              phone: true,
              referral_code: true,
              wallet_balance: true,
            },
          },
          paid_to_user: {
            select: {
              id: true,
              full_name: true,
              phone: true,
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

    // Generate fresh OTP or renew expiration
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

    await this.smsService.sendWithdrawalOtp(
      withdrawal.user.phone,
      otp,
      Number(withdrawal.amount),
    );

    return {
      success: true,
      message: `OTP resent successfully to ${withdrawal.user.phone}.`,
      otp: process.env.NODE_ENV !== 'production' && !process.env.SMS_API_KEY ? otp : undefined,
    };
  }

  /**
   * Admin: Payment confirmation
   * Adds the withdrawal amount to the selected target user's wallet balance.
   */
  async processPayment(withdrawalId: string, targetUserId: string, adminPhone: string) {
    return this.prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawalRequest.findUnique({
        where: { id: withdrawalId },
        include: { user: true },
      });

      if (!withdrawal) {
        throw new NotFoundException('Withdrawal request not found');
      }

      if (withdrawal.status !== RequestStatus.PENDING) {
        throw new BadRequestException('This withdrawal has already been processed or is not pending');
      }

      const targetUser = await tx.user.findUnique({
        where: { id: targetUserId },
      });

      if (!targetUser) {
        throw new NotFoundException('Target recipient user not found');
      }

      const numAmount = Number(withdrawal.amount);
      const recipientBalanceBefore = Number(targetUser.wallet_balance);
      const recipientBalanceAfter = recipientBalanceBefore + numAmount;

      // 1. Credit target user balance
      await tx.user.update({
        where: { id: targetUserId },
        data: { wallet_balance: new Prisma.Decimal(recipientBalanceAfter) },
      });

      // 2. Record ledger transaction for target user
      await tx.walletTransaction.create({
        data: {
          user_id: targetUserId,
          type: TransactionType.DEPOSIT,
          amount: new Prisma.Decimal(numAmount),
          balance_before: new Prisma.Decimal(recipientBalanceBefore),
          balance_after: new Prisma.Decimal(recipientBalanceAfter),
          description: `Withdrawal payment received from ${withdrawal.user.full_name || withdrawal.user.phone} (${withdrawal.user.referral_code})`,
        },
      });

      // 3. Mark withdrawal request as APPROVED / Paid
      const updatedWithdrawal = await tx.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status: RequestStatus.APPROVED,
          paid_to_user_id: targetUserId,
          paid_at: new Date(),
          approved_by: adminPhone,
        },
        include: {
          user: true,
          paid_to_user: true,
        },
      });

      return {
        success: true,
        message: `Successfully paid ৳${numAmount.toFixed(2)} to ${targetUser.full_name || targetUser.phone} (${targetUser.referral_code}).`,
        withdrawal: updatedWithdrawal,
      };
    }, { maxWait: 10000, timeout: 30000 });
  }
}
