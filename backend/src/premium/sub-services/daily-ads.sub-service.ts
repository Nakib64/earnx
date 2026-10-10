import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionType, Prisma } from '@prisma/client';

@Injectable()
export class DailyAdsSubService {
  constructor(private readonly prisma: PrismaService) { }

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

    const claim = await this.prisma.dailyAdClaim.upsert({
      where: {
        user_id_claim_date: {
          user_id: userId,
          claim_date: today,
        },
      },
      update: {},
      create: {
        user_id: userId,
        package_id: pkg.id,
        claim_date: today,
        ads_watched: 0,
        is_claimed: false,
        reward_amount: pkg.daily_reward_amount,
      },
    });

    const adsRequired = pkg.daily_ads_count;
    const adsWatched = claim.ads_watched;
    const rewardPerAd = Number(
      (Number(pkg.daily_reward_amount) / (adsRequired || 1)).toFixed(2),
    );
    const earnedToday = Number((adsWatched * rewardPerAd).toFixed(2));
    const remainingAds = Math.max(0, adsRequired - adsWatched);
    const remainingReward = Number((remainingAds * rewardPerAd).toFixed(2));
    const quotaReached = adsWatched >= adsRequired;

    return {
      is_premium: true,
      package_title: pkg.title,
      daily_reward_amount: Number(pkg.daily_reward_amount),
      daily_ads_required: adsRequired,
      ads_watched: adsWatched,
      reward_per_ad: rewardPerAd,
      earned_today: earnedToday,
      remaining_ads: remainingAds,
      remaining_reward: remainingReward,
      is_claimed: quotaReached,
      can_claim: false, // Rewards are credited immediately on each ad watched
      quota_reached: quotaReached,
      claim_date: today,
    };
  }

  /**
   * Record an ad watched:
   * Instantly credits the proportional fractional reward (daily_reward_amount / daily_ads_count)
   * directly into the user's wallet without requiring full quota completion.
   */
  async recordAdWatched(userId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: userId },
          include: { premium_package: true },
        });

        if (!user) throw new NotFoundException('User not found');
        if (!user.is_premium || !user.premium_package) {
          throw new BadRequestException('Premium membership required to watch earning ads');
        }

        const pkg = user.premium_package;
        const today = this.getTodayDateKey();

        const claim = await tx.dailyAdClaim.upsert({
          where: {
            user_id_claim_date: {
              user_id: userId,
              claim_date: today,
            },
          },
          update: {},
          create: {
            user_id: userId,
            package_id: pkg.id,
            claim_date: today,
            ads_watched: 0,
            is_claimed: false,
            reward_amount: pkg.daily_reward_amount,
          },
        });

        if (claim.ads_watched >= pkg.daily_ads_count) {
          throw new BadRequestException(
            `You have completed your daily quota of ${pkg.daily_ads_count} ads for today! Come back tomorrow.`,
          );
        }

        const newAdsWatched = claim.ads_watched + 1;
        const rewardPerAd = Number(
          (Number(pkg.daily_reward_amount) / (pkg.daily_ads_count || 1)).toFixed(2),
        );
        const quotaReached = newAdsWatched >= pkg.daily_ads_count;
        const now = new Date();

        // 1. Update daily ad claim progress
        await tx.dailyAdClaim.update({
          where: { id: claim.id },
          data: {
            ads_watched: newAdsWatched,
            is_claimed: quotaReached,
            claimed_at: quotaReached ? now : claim.claimed_at,
          },
        });

        // 2. Atomically credit fractional reward into user's wallet balance
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            wallet_balance: { increment: new Prisma.Decimal(rewardPerAd) },
          },
          select: { wallet_balance: true },
        });

        const balanceAfter = Number(updatedUser.wallet_balance);
        const balanceBefore = balanceAfter - rewardPerAd;

        // 3. Record transaction in  for user visibility and analytics tracking
        await tx.walletTransaction.create({
          data: {
            user_id: userId,
            type: TransactionType.PREMIUM_DAILY_REWARD,
            amount: new Prisma.Decimal(rewardPerAd),
            balance_before: new Prisma.Decimal(balanceBefore),
            balance_after: new Prisma.Decimal(balanceAfter),
            description: `Ad Reward #${newAdsWatched}/${pkg.daily_ads_count} (${pkg.title})`,
          },
        });

        const earnedToday = Number((newAdsWatched * rewardPerAd).toFixed(2));
        const remainingAds = Math.max(0, pkg.daily_ads_count - newAdsWatched);

        return {
          success: true,
          ads_watched: newAdsWatched,
          daily_ads_required: pkg.daily_ads_count,
          reward_per_ad: rewardPerAd,
          earned_now: rewardPerAd,
          earned_today: earnedToday,
          remaining_ads: remainingAds,
          wallet_balance: balanceAfter,
          quota_reached: quotaReached,
          message: `৳${rewardPerAd.toFixed(2)} added to your wallet! (Watched: ${newAdsWatched}/${pkg.daily_ads_count} ads)`,
        };
      },
      { maxWait: 10000, timeout: 30000 },
    );
  }

  /**
   * Backwards-compatible claim endpoint.
   * Rewards are already credited directly upon watching each ad.
   */
  async claimDailyReward(userId: string) {
    const task = await this.getDailyTask(userId);
    return {
      success: true,
      message: `Rewards are credited instantly to your wallet per ad watched! Total earned today: ৳${task.earned_today}`,
      rewardAmount: task.earned_today,
      ads_watched: task.ads_watched,
    };
  }

  /**
   * Admin Analytics:
   * Aggregates total number of ads run, total earnings paid to users,
   * active viewers, and generates smooth time-series chart data for:
   * '1d', '3d', '7d', '1m', '3m'.
   */
  async getAdsAnalytics(timeframe: string = '7d', targetUserId?: string) {
    const validTimeframes = ['1d', '3d', '7d', '1m', '3m'];
    const tf = validTimeframes.includes(timeframe.toLowerCase())
      ? timeframe.toLowerCase()
      : '7d';

    const now = new Date();
    let startDate: Date;
    interface SliceBucket {
      label: string;
      start: Date;
      end: Date;
      ads_count: number;
      total_earned: number;
      unique_users: Set<string>;
    }
    const slices: SliceBucket[] = [];

    if (tf === '1d') {
      // Last 24 hours in 24 1-hour buckets
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      for (let i = 23; i >= 0; i--) {
        const bucketStart = new Date(now.getTime() - (i + 1) * 60 * 60 * 1000);
        const bucketEnd = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hours = bucketEnd.getHours().toString().padStart(2, '0') + ':00';
        slices.push({
          label: hours,
          start: bucketStart,
          end: bucketEnd,
          ads_count: 0,
          total_earned: 0,
          unique_users: new Set<string>(),
        });
      }
    } else if (tf === '3d') {
      // Last 3 days in 12 6-hour buckets
      startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      for (let i = 11; i >= 0; i--) {
        const bucketStart = new Date(now.getTime() - (i + 1) * 6 * 60 * 60 * 1000);
        const bucketEnd = new Date(now.getTime() - i * 6 * 60 * 60 * 1000);
        const dayStr = bucketEnd.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        const hourStr = bucketEnd.getHours().toString().padStart(2, '0') + ':00';
        slices.push({
          label: `${dayStr} ${hourStr}`,
          start: bucketStart,
          end: bucketEnd,
          ads_count: 0,
          total_earned: 0,
          unique_users: new Set<string>(),
        });
      }
    } else if (tf === '7d') {
      // Last 7 days in 7 daily buckets
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const bucketStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
        const bucketEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
        const label = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        slices.push({
          label,
          start: bucketStart,
          end: bucketEnd,
          ads_count: 0,
          total_earned: 0,
          unique_users: new Set<string>(),
        });
      }
    } else if (tf === '1m') {
      // Last 30 days in 30 daily buckets
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const bucketStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
        const bucketEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
        const label = d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        slices.push({
          label,
          start: bucketStart,
          end: bucketEnd,
          ads_count: 0,
          total_earned: 0,
          unique_users: new Set<string>(),
        });
      }
    } else {
      // '3m' -> 90 days in 15 6-day buckets
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const stepDays = 6;
      for (let i = 14; i >= 0; i--) {
        const bucketStart = new Date(now.getTime() - (i + 1) * stepDays * 24 * 60 * 60 * 1000);
        const bucketEnd = new Date(now.getTime() - i * stepDays * 24 * 60 * 60 * 1000);
        const label = bucketEnd.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        slices.push({
          label,
          start: bucketStart,
          end: bucketEnd,
          ads_count: 0,
          total_earned: 0,
          unique_users: new Set<string>(),
        });
      }
    }

    // Query transactions for the period
    const txs = await this.prisma.walletTransaction.findMany({
      where: {
        type: TransactionType.PREMIUM_DAILY_REWARD,
        created_at: { gte: startDate },
        ...(targetUserId ? { user_id: targetUserId } : {}),
      },
      orderBy: { created_at: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            phone: true,
            email: true,
            premium_package: {
              select: {
                id: true,
                title: true,
                price: true,
              },
            },
          },
        },
      },
    });

    const uniqueUsersInPeriod = new Set<string>();
    let totalAdsInPeriod = 0;
    let totalEarnedInPeriod = 0;

    const packageMap = new Map<
      string,
      { title: string; ads_count: number; total_earned: number; user_count: Set<string> }
    >();

    for (const tx of txs) {
      const txTime = tx.created_at.getTime();
      const amount = Number(tx.amount);
      totalAdsInPeriod += 1;
      totalEarnedInPeriod += amount;
      uniqueUsersInPeriod.add(tx.user_id);

      // Group into appropriate slice
      for (const bucket of slices) {
        if (txTime >= bucket.start.getTime() && txTime <= bucket.end.getTime()) {
          bucket.ads_count += 1;
          bucket.total_earned += amount;
          bucket.unique_users.add(tx.user_id);
          break;
        }
      }

      // Package breakdown
      const pkgTitle = tx.user.premium_package?.title || 'Standard VIP';
      const existing = packageMap.get(pkgTitle) || {
        title: pkgTitle,
        ads_count: 0,
        total_earned: 0,
        user_count: new Set<string>(),
      };
      existing.ads_count += 1;
      existing.total_earned += amount;
      existing.user_count.add(tx.user_id);
      packageMap.set(pkgTitle, existing);
    }

    // All-time aggregated stats
    const allTimeStats = await this.prisma.walletTransaction.aggregate({
      where: {
        type: TransactionType.PREMIUM_DAILY_REWARD,
        ...(targetUserId ? { user_id: targetUserId } : {}),
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    // Recent 12 ad views for live audit feed
    const recentActivity = txs.slice(-12).reverse().map((t) => ({
      id: t.id,
      user_id: t.user_id,
      user_name: t.user.full_name || t.user.phone || 'User',
      user_phone: t.user.phone,
      package_title: t.user.premium_package?.title || 'VIP Package',
      amount: Number(t.amount),
      created_at: t.created_at,
      description: t.description,
    }));

    const chartData = slices.map((s) => ({
      label: s.label,
      ads_count: s.ads_count,
      total_earned: Number(s.total_earned.toFixed(2)),
      active_users: s.unique_users.size,
    }));

    const packageBreakdown = Array.from(packageMap.values()).map((p) => ({
      title: p.title,
      ads_count: p.ads_count,
      total_earned: Number(p.total_earned.toFixed(2)),
      user_count: p.user_count.size,
    }));

    return {
      timeframe: tf,
      summary: {
        total_ads_watched: totalAdsInPeriod,
        total_earned_bdt: Number(totalEarnedInPeriod.toFixed(2)),
        active_users: uniqueUsersInPeriod.size,
        avg_ads_per_user:
          uniqueUsersInPeriod.size > 0
            ? Number((totalAdsInPeriod / uniqueUsersInPeriod.size).toFixed(1))
            : 0,
        all_time_ads_watched: allTimeStats._count.id,
        all_time_earned_bdt: Number((Number(allTimeStats._sum.amount || 0)).toFixed(2)),
      },
      chart_data: chartData,
      package_breakdown: packageBreakdown,
      recent_activity: recentActivity,
    };
  }
}

