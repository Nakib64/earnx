import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SystemConfigService } from '../../system-config/system-config.service';
import { CoinTransactionType, UserStatus, Prisma } from '@prisma/client';

@Injectable()
export class CoinRewardSubService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: SystemConfigService,
  ) {}

  // ==========================================
  // USER COIN INFO & ELIGIBILITY
  // ==========================================
  async getCoinInfo(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        coin_balance: true,
        locked_coin_balance: true,
        wallet_balance: true,
        is_premium: true,
        premium_coins_granted: true,
        is_premium_coins_unlocked: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    // Count active direct premium referrals
    const activeReferralCount = await this.prisma.user.count({
      where: {
        referred_by_id: userId,
        is_premium: true,
      },
    });

    const configs = await this.configService.getAll();
    const coinPrice = parseFloat(configs.COIN_PRICE || '10');
    const premiumFreeCoins = parseFloat(configs.PREMIUM_FREE_COINS || '100');
    const requiredReferralCount = parseInt(
      configs.PREMIUM_FREE_COINS_REQUIRED_REFERRALS || '10',
      10,
    );

    const lockedCoins = Number(user.locked_coin_balance);
    const canUnlock =
      user.is_premium &&
      lockedCoins > 0 &&
      !user.is_premium_coins_unlocked &&
      activeReferralCount >= requiredReferralCount;

    return {
      coin_balance: Number(user.coin_balance),
      locked_coin_balance: lockedCoins,
      wallet_balance: Number(user.wallet_balance),
      is_premium: user.is_premium,
      premium_coins_granted: user.premium_coins_granted,
      is_premium_coins_unlocked: user.is_premium_coins_unlocked,
      active_referral_count: activeReferralCount,
      required_referral_count: requiredReferralCount,
      coin_price: coinPrice,
      premium_free_coins: premiumFreeCoins,
      can_unlock: canUnlock,
    };
  }

  // ==========================================
  // GRANT LOCKED COINS (WHEN PREMIUM APPROVED)
  // ==========================================
  async grantLockedCoinsOnPremium(userId: string, txClient?: Prisma.TransactionClient) {
    const db = txClient || this.prisma;
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return;

    if (user.premium_coins_granted) {
      return; // Already granted premium bonus coins
    }

    const configs = await this.configService.getAll();
    const premiumFreeCoins = parseFloat(configs.PREMIUM_FREE_COINS || '100');
    const requiredReferrals = parseInt(
      configs.PREMIUM_FREE_COINS_REQUIRED_REFERRALS || '10',
      10,
    );

    const lockedBefore = Number(user.locked_coin_balance);
    const lockedAfter = lockedBefore + premiumFreeCoins;

    // Grant locked coins
    await db.user.update({
      where: { id: userId },
      data: {
        locked_coin_balance: new Prisma.Decimal(lockedAfter),
        premium_coins_granted: true,
      },
    });

    await db.coinTransaction.create({
      data: {
        user_id: userId,
        type: CoinTransactionType.PREMIUM_LOCKED_REWARD,
        amount: new Prisma.Decimal(premiumFreeCoins),
        coins_before: new Prisma.Decimal(lockedBefore),
        coins_after: new Prisma.Decimal(lockedAfter),
        description: `Received ${premiumFreeCoins} locked coins for Premium subscription (unlock by referring ${requiredReferrals} active users)`,
      },
    });

    // Check if user ALREADY satisfies active referral count
    const activeReferralsCount = await db.user.count({
      where: {
        referred_by_id: userId,
        status: UserStatus.ACTIVE,
      },
    });

    if (activeReferralsCount >= requiredReferrals) {
      // Immediately unlock!
      const currentCoinBalance = Number(user.coin_balance);
      const newCoinBalance = currentCoinBalance + lockedAfter;

      await db.user.update({
        where: { id: userId },
        data: {
          coin_balance: new Prisma.Decimal(newCoinBalance),
          locked_coin_balance: new Prisma.Decimal(0),
          is_premium_coins_unlocked: true,
        },
      });

      await db.coinTransaction.create({
        data: {
          user_id: userId,
          type: CoinTransactionType.PREMIUM_UNLOCKED,
          amount: new Prisma.Decimal(lockedAfter),
          coins_before: new Prisma.Decimal(currentCoinBalance),
          coins_after: new Prisma.Decimal(newCoinBalance),
          description: `Unlocked ${lockedAfter} premium bonus coins after achieving ${activeReferralsCount}/${requiredReferrals} active referrals!`,
        },
      });
    }
  }

  // ==========================================
  // UNLOCK COINS (MANUAL/EXPLICIT CLAIM)
  // ==========================================
  async unlockPremiumCoins(userId: string) {
    const configs = await this.configService.getAll();
    const requiredReferrals = parseInt(
      configs.PREMIUM_FREE_COINS_REQUIRED_REFERRALS || '10',
      10,
    );

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      if (!user.is_premium) {
        throw new BadRequestException('Only Premium users are eligible for premium coin unlocks.');
      }

      const lockedAmount = Number(user.locked_coin_balance);
      if (lockedAmount <= 0 || user.is_premium_coins_unlocked) {
        throw new BadRequestException('You do not have any locked premium coins to unlock.');
      }

      const activeReferralCount = await tx.user.count({
        where: {
          referred_by_id: userId,
          status: UserStatus.ACTIVE,
        },
      });

      if (activeReferralCount < requiredReferrals) {
        throw new BadRequestException(
          `Unlock requirement not met. You need ${requiredReferrals} active referrals, but currently have ${activeReferralCount}.`,
        );
      }

      // Atomically unlock coins
      const unlockResult = await tx.user.updateMany({
        where: {
          id: userId,
          is_premium_coins_unlocked: false,
          locked_coin_balance: { gt: 0 },
        },
        data: {
          coin_balance: { increment: new Prisma.Decimal(lockedAmount) },
          locked_coin_balance: new Prisma.Decimal(0),
          is_premium_coins_unlocked: true,
        },
      });

      if (unlockResult.count === 0) {
        throw new BadRequestException('You do not have any locked premium coins to unlock.');
      }

      const freshUser = await tx.user.findUnique({
        where: { id: userId },
        select: { coin_balance: true },
      });

      const coinsAfter = Number(freshUser?.coin_balance || 0);
      const coinsBefore = coinsAfter - lockedAmount;

      const txRecord = await tx.coinTransaction.create({
        data: {
          user_id: userId,
          type: CoinTransactionType.PREMIUM_UNLOCKED,
          amount: new Prisma.Decimal(lockedAmount),
          coins_before: new Prisma.Decimal(coinsBefore),
          coins_after: new Prisma.Decimal(coinsAfter),
          description: `Unlocked ${lockedAmount} premium bonus coins after reaching ${activeReferralCount}/${requiredReferrals} active referrals!`,
        },
      });

      return {
        unlocked_amount: lockedAmount,
        new_coin_balance: coinsAfter,
        transaction: txRecord,
      };
    }, { maxWait: 10000, timeout: 30000 });
  }

  // ==========================================
  // AUTO UNLOCK FOR REFERRER (UPON USER ACTIVATION)
  // ==========================================
  async checkAndUnlockForReferrer(referrerId: string, txClient?: Prisma.TransactionClient) {
    if (!referrerId) return;
    const db = txClient || this.prisma;

    const referrer = await db.user.findUnique({ where: { id: referrerId } });
    if (!referrer) return;

    const lockedAmount = Number(referrer.locked_coin_balance);
    if (!referrer.is_premium || lockedAmount <= 0 || referrer.is_premium_coins_unlocked) {
      return; // No locked coins to unlock
    }

    const configs = await this.configService.getAll();
    const requiredReferrals = parseInt(
      configs.PREMIUM_FREE_COINS_REQUIRED_REFERRALS || '10',
      10,
    );

    const activeReferralCount = await db.user.count({
      where: {
        referred_by_id: referrerId,
        status: UserStatus.ACTIVE,
      },
    });

    if (activeReferralCount >= requiredReferrals) {
      const coinsBefore = Number(referrer.coin_balance);
      const coinsAfter = coinsBefore + lockedAmount;

      await db.user.update({
        where: { id: referrerId },
        data: {
          coin_balance: new Prisma.Decimal(coinsAfter),
          locked_coin_balance: new Prisma.Decimal(0),
          is_premium_coins_unlocked: true,
        },
      });

      await db.coinTransaction.create({
        data: {
          user_id: referrerId,
          type: CoinTransactionType.PREMIUM_UNLOCKED,
          amount: new Prisma.Decimal(lockedAmount),
          coins_before: new Prisma.Decimal(coinsBefore),
          coins_after: new Prisma.Decimal(coinsAfter),
          description: `Unlocked ${lockedAmount} premium bonus coins after reaching ${activeReferralCount}/${requiredReferrals} active referrals!`,
        },
      });
    }
  }

  // ==========================================
  // USER COIN TRANSACTION HISTORY
  // ==========================================
  async getUserTransactions(userId: string) {
    return this.prisma.coinTransaction.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }
}
