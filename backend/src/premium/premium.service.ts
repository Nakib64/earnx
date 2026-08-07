import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SystemConfigService } from '../system-config/system-config.service';
import { TransactionType, Prisma } from '@prisma/client';

@Injectable()
export class PremiumService {
  private readonly logger = new Logger(PremiumService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: SystemConfigService,
  ) {}

  // Run automatically every day at midnight to process weekly payouts
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Executing automated weekly premium payout check...');
    await this.processWeeklyPayouts();
  }

  async processWeeklyPayouts(force = false) {
    const weeklyAmountStr = await this.configService.getValue(
      'PREMIUM_WEEKLY_PAYOUT_AMOUNT',
      '100',
    );
    const weeklyAmount = parseFloat(weeklyAmountStr) || 100;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const whereClause: Prisma.UserWhereInput = {
      is_premium: true,
      premium_payout_count: { lt: 52 },
    };

    if (!force) {
      whereClause.OR = [
        { last_premium_payout_at: null },
        { last_premium_payout_at: { lte: sevenDaysAgo } },
      ];
    }

    // Find active premium users who need payout
    const users = await this.prisma.user.findMany({
      where: whereClause,
    });

    let processedCount = 0;

    for (const user of users) {
      // Check if expired
      if (user.premium_expires_at && now > user.premium_expires_at) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { is_premium: false },
        });
        continue;
      }

      await this.prisma.$transaction(async (tx) => {
        const balanceBefore = Number(user.wallet_balance);
        const balanceAfter = balanceBefore + weeklyAmount;
        const newPayoutCount = user.premium_payout_count + 1;
        const isFinished = newPayoutCount >= 52;

        // 1. Update wallet balance & premium stats
        await tx.user.update({
          where: { id: user.id },
          data: {
            wallet_balance: new Prisma.Decimal(balanceAfter),
            premium_payout_count: newPayoutCount,
            last_premium_payout_at: now,
            is_premium: !isFinished,
          },
        });

        // 2. Create transaction log
        await tx.walletTransaction.create({
          data: {
            user_id: user.id,
            type: TransactionType.PREMIUM_WEEKLY_PAYOUT,
            amount: new Prisma.Decimal(weeklyAmount),
            balance_before: new Prisma.Decimal(balanceBefore),
            balance_after: new Prisma.Decimal(balanceAfter),
            description: `Weekly Premium Payout (${newPayoutCount}/52 weeks)`,
          },
      });
      }, { maxWait: 10000, timeout: 30000 });

      processedCount++;
    }

    this.logger.log(
      `Weekly premium payout complete. Processed payouts for ${processedCount} users.`,
    );
    return { success: true, processedCount, weeklyAmount };
  }

  // ==========================================
  // SPECIFIC USER PAYOUTS & MANAGEMENT
  // ==========================================

  async getPremiumUsers(search?: string) {
    const where: Prisma.UserWhereInput = {
      is_premium: true,
    };

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { full_name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { referral_code: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        full_name: true,
        phone: true,
        referral_code: true,
        wallet_balance: true,
        is_premium: true,
        premium_payout_count: true,
        last_premium_payout_at: true,
        premium_expires_at: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async payoutSpecificUsers(userIds: string[]) {
    if (!userIds || userIds.length === 0) {
      return { success: true, processedCount: 0, weeklyAmount: 0 };
    }

    const weeklyAmountStr = await this.configService.getValue(
      'PREMIUM_WEEKLY_PAYOUT_AMOUNT',
      '100',
    );
    const weeklyAmount = parseFloat(weeklyAmountStr) || 100;
    const now = new Date();

    const users = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
        is_premium: true,
      },
    });

    let processedCount = 0;

    for (const user of users) {
      if (user.premium_payout_count >= 52) continue;

      await this.prisma.$transaction(async (tx) => {
        const balanceBefore = Number(user.wallet_balance);
        const balanceAfter = balanceBefore + weeklyAmount;
        const newPayoutCount = user.premium_payout_count + 1;
        const isFinished = newPayoutCount >= 52;

        await tx.user.update({
          where: { id: user.id },
          data: {
            wallet_balance: new Prisma.Decimal(balanceAfter),
            premium_payout_count: newPayoutCount,
            last_premium_payout_at: now, // Resets 7-day timer from current execution
            is_premium: !isFinished,
          },
        });

        await tx.walletTransaction.create({
          data: {
            user_id: user.id,
            type: TransactionType.PREMIUM_WEEKLY_PAYOUT,
            amount: new Prisma.Decimal(weeklyAmount),
            balance_before: new Prisma.Decimal(balanceBefore),
            balance_after: new Prisma.Decimal(balanceAfter),
            description: `Weekly Premium Payout (${newPayoutCount}/52 weeks)`,
          },
        });
      }, { maxWait: 10000, timeout: 30000 });

      processedCount++;
    }

    return { success: true, processedCount, weeklyAmount };
  }
}
