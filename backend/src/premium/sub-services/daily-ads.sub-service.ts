import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionType, Prisma } from '@prisma/client';

@Injectable()
export class DailyAdsSubService {
  constructor(private readonly prisma: PrismaService) {}

  private getTodayDateKey(): string {
    const d = new Date();
    // Return YYYY-MM-DD
    return d.toISOString().split('T')[0];
  }

  async getDailyTask(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { premium_package: true },
    });

    if (!user) throw new NotFoundException('User not found');

    if (!user.is_premium || !user.premium_package) {
      return {
        is_premium: false,
        message: 'Upgrade to a Premium Package to unlock daily watch-to-earn ads.',
      };
    }

    const pkg = user.premium_package;
    const today = this.getTodayDateKey();

    let claim = await this.prisma.dailyAdClaim.findUnique({
      where: {
        user_id_claim_date: {
          user_id: userId,
          claim_date: today,
        },
      },
    });

    if (!claim) {
      claim = await this.prisma.dailyAdClaim.create({
        data: {
          user_id: userId,
          package_id: pkg.id,
          claim_date: today,
          ads_watched: 0,
          is_claimed: false,
          reward_amount: pkg.daily_reward_amount,
        },
      });
    }

    const adsRequired = pkg.daily_ads_count;
    const adsWatched = claim.ads_watched;
    const canClaim = adsWatched >= adsRequired && !claim.is_claimed;

    return {
      is_premium: true,
      package_title: pkg.title,
      daily_reward_amount: Number(pkg.daily_reward_amount),
      daily_ads_required: adsRequired,
      ads_watched: adsWatched,
      is_claimed: claim.is_claimed,
      can_claim: canClaim,
      claim_date: today,
    };
  }

  async recordAdWatched(userId: string) {
    const task = await this.getDailyTask(userId);
    if (!task.is_premium) {
      throw new BadRequestException('Premium membership required to watch earning ads');
    }

    const today = this.getTodayDateKey();
    const pkg = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { premium_package: true },
    });

    if (!pkg?.premium_package) {
      throw new BadRequestException('No active package found');
    }

    const maxAds = pkg.premium_package.daily_ads_count;

    const claim = await this.prisma.dailyAdClaim.findUnique({
      where: {
        user_id_claim_date: {
          user_id: userId,
          claim_date: today,
        },
      },
    });

    if (!claim) throw new NotFoundException('Daily task not initialized');

    if (claim.is_claimed) {
      throw new BadRequestException("You have already claimed today's reward!");
    }

    const newCount = Math.min(maxAds, claim.ads_watched + 1);

    const updated = await this.prisma.dailyAdClaim.update({
      where: { id: claim.id },
      data: { ads_watched: newCount },
    });

    return {
      success: true,
      ads_watched: updated.ads_watched,
      daily_ads_required: maxAds,
      can_claim: updated.ads_watched >= maxAds && !updated.is_claimed,
    };
  }

  async claimDailyReward(userId: string) {
    const today = this.getTodayDateKey();

    return this.prisma.$transaction(
      async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: userId },
          include: { premium_package: true },
        });

        if (!user) throw new NotFoundException('User not found');
        if (!user.is_premium || !user.premium_package) {
          throw new BadRequestException('Premium membership required');
        }

        const pkg = user.premium_package;

        const claim = await tx.dailyAdClaim.findUnique({
          where: {
            user_id_claim_date: {
              user_id: userId,
              claim_date: today,
            },
          },
        });

        if (!claim) {
          throw new NotFoundException('Daily task not found');
        }

        if (claim.is_claimed) {
          throw new BadRequestException("You have already claimed today's earnings!");
        }

        if (claim.ads_watched < pkg.daily_ads_count) {
          throw new BadRequestException(
            `Please finish watching all ${pkg.daily_ads_count} ads before claiming. (Watched: ${claim.ads_watched}/${pkg.daily_ads_count})`,
          );
        }

        const rewardAmount = Number(pkg.daily_reward_amount);
        const balanceBefore = Number(user.wallet_balance);
        const balanceAfter = balanceBefore + rewardAmount;
        const now = new Date();

        // 1. Mark claimed
        await tx.dailyAdClaim.update({
          where: { id: claim.id },
          data: {
            is_claimed: true,
            claimed_at: now,
          },
        });

        // 2. Credit wallet
        await tx.user.update({
          where: { id: userId },
          data: {
            wallet_balance: new Prisma.Decimal(balanceAfter),
          },
        });

        // 3. Record transaction
        await tx.walletTransaction.create({
          data: {
            user_id: userId,
            type: TransactionType.PREMIUM_DAILY_REWARD,
            amount: new Prisma.Decimal(rewardAmount),
            balance_before: new Prisma.Decimal(balanceBefore),
            balance_after: new Prisma.Decimal(balanceAfter),
            description: `Daily Watch-to-Earn reward (${pkg.title})`,
          },
        });

        return {
          success: true,
          message: `Congratulations! ৳${rewardAmount.toFixed(2)} credited to your wallet!`,
          rewardAmount,
          newBalance: balanceAfter,
        };
      },
      { maxWait: 10000, timeout: 30000 },
    );
  }
}
