import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsService } from '../../sms/sms.service';
import { EmailService } from '../../email/email.service';
import { RequestStatus, TransactionType, Prisma } from '@prisma/client';

@Injectable()
export class WithdrawalRequestSubService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
    private readonly emailService: EmailService,
  ) { }

  /**
   * User requests withdrawal:
   * 1. Balance deducted from user immediately.
   * 2. 6-digit OTP generated and saved.
   * 3. Dispatched to Phone via SMS or Email via Mailer.
   * 4. Logged as PENDING.
   */
  async requestWithdrawal(userId: string, amount: number) {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new BadRequestException('Withdrawal amount must be greater than zero');
    }

    const now = new Date();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    return this.prisma.$transaction(
      async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        // 1. Deduct balance from user atomically
        const deductResult = await tx.user.updateMany({
          where: {
            id: userId,
            wallet_balance: { gte: new Prisma.Decimal(numAmount) },
          },
          data: {
            wallet_balance: { decrement: new Prisma.Decimal(numAmount) },
          },
        });

        if (deductResult.count === 0) {
          throw new BadRequestException('Insufficient wallet balance for withdrawal');
        }

        const currentBalance = Number(user.wallet_balance);
        const balanceAfter = currentBalance - numAmount;

        // 2. Record  transaction
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

        // 4. Send OTP via SMS or Email based on user's registration
        const isEmailAccount = !user.phone && !!user.email;
        if (isEmailAccount) {
          await this.emailService.sendWithdrawalOtp(user.email!, otp, numAmount);
        } else if (user.phone) {
          await this.smsService.sendWithdrawalOtp(user.phone, otp, numAmount);
        } else if (user.email) {
          await this.emailService.sendWithdrawalOtp(user.email, otp, numAmount);
        }

        const channelDesc = isEmailAccount
          ? `email (${user.email})`
          : `phone (${user.phone || user.email})`;

        return {
          success: true,
          message: `Withdrawal request of ৳${numAmount.toFixed(
            2,
          )} submitted. A 6-digit OTP has been sent to your ${channelDesc}.`,
          withdrawal,
          newBalance: balanceAfter,
          ...(process.env.NODE_ENV !== 'production' && !process.env.SMS_API_KEY
            ? { devOtp: otp }
            : {}),
        };
      },
      { maxWait: 10000, timeout: 30000 },
    );
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
              email: true,
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
}
