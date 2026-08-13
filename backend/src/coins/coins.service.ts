import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SystemConfigService } from '../system-config/system-config.service';
import { WalletService } from '../wallets/wallet.service';
import { TransactionType, CoinTransactionType, UserStatus, Prisma } from '@prisma/client';

@Injectable()
export class CoinsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: SystemConfigService,
    private readonly walletService: WalletService,
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

    // Count active direct referrals
    const activeReferralCount = await this.prisma.user.count({
      where: {
        referred_by_id: userId,
        status: UserStatus.ACTIVE,
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
  // BUY COINS WITH WALLET BALANCE
  // ==========================================
  async buyCoins(userId: string, amount: number) {
    if (!amount || amount <= 0) {
      throw new BadRequestException('Amount of coins must be greater than zero');
    }

    const configs = await this.configService.getAll();
    const coinPrice = parseFloat(configs.COIN_PRICE || '10');
    const totalCost = amount * coinPrice;

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) throw new NotFoundException('User not found');

      if (Number(user.wallet_balance) < totalCost) {
        throw new BadRequestException(
          `Insufficient wallet balance. Total cost is ৳${totalCost.toFixed(
            2,
          )}, but your balance is ৳${Number(user.wallet_balance).toFixed(2)}.`,
        );
      }

      // 1. Deduct wallet balance
      await this.walletService.processTransaction(
        userId,
        TransactionType.COIN_PURCHASE,
        -totalCost,
        `Purchased ${amount} coins at ৳${coinPrice}/coin`,
        tx,
      );

      // 2. Add to coin balance
      const coinsBefore = Number(user.coin_balance);
      const coinsAfter = coinsBefore + amount;

      await tx.user.update({
        where: { id: userId },
        data: {
          coin_balance: new Prisma.Decimal(coinsAfter),
        },
      });

      // 3. Record CoinTransaction
      const coinTx = await tx.coinTransaction.create({
        data: {
          user_id: userId,
          type: CoinTransactionType.PURCHASE,
          amount: new Prisma.Decimal(amount),
          coins_before: new Prisma.Decimal(coinsBefore),
          coins_after: new Prisma.Decimal(coinsAfter),
          cost_bdt: new Prisma.Decimal(totalCost),
          description: `Purchased ${amount} coins using wallet balance`,
        },
      });

      return {
        amount,
        cost: totalCost,
        new_coin_balance: coinsAfter,
        transaction: coinTx,
      };
    }, { maxWait: 10000, timeout: 30000 });
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

      const coinsBefore = Number(user.coin_balance);
      const coinsAfter = coinsBefore + lockedAmount;

      await tx.user.update({
        where: { id: userId },
        data: {
          coin_balance: new Prisma.Decimal(coinsAfter),
          locked_coin_balance: new Prisma.Decimal(0),
          is_premium_coins_unlocked: true,
        },
      });

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

  // ==========================================
  // ADMIN COIN STATS (Aggregate only)
  // ==========================================
  async getAdminCoinStats() {
    const [totals, userCount, configs] = await Promise.all([
      this.prisma.user.aggregate({
        _sum: {
          coin_balance: true,
          locked_coin_balance: true,
        },
      }),
      this.prisma.user.count(),
      this.configService.getAll(),
    ]);

    const coinPrice = parseFloat(configs.COIN_PRICE || '10');
    const premiumFreeCoins = parseFloat(configs.PREMIUM_FREE_COINS || '100');
    const requiredReferralCount = parseInt(
      configs.PREMIUM_FREE_COINS_REQUIRED_REFERRALS || '10',
      10,
    );

    return {
      configs: {
        COIN_PRICE: coinPrice,
        PREMIUM_FREE_COINS: premiumFreeCoins,
        PREMIUM_FREE_COINS_REQUIRED_REFERRALS: requiredReferralCount,
      },
      stats: {
        total_available_coins: Number(totals._sum.coin_balance || 0),
        total_locked_coins: Number(totals._sum.locked_coin_balance || 0),
        user_count: userCount,
      },
    };
  }

  // ==========================================
  // ADMIN COIN USERS (Paginated + Search)
  // ==========================================
  async getAdminCoinUsers(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { full_name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { referral_code: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          phone: true,
          full_name: true,
          referral_code: true,
          coin_balance: true,
          locked_coin_balance: true,
          is_premium: true,
          premium_coins_granted: true,
          is_premium_coins_unlocked: true,
        },
        orderBy: { coin_balance: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + users.length < total,
      },
    };
  }

  // ==========================================
  // ADMIN MANUAL COIN ADJUSTMENT
  // ==========================================
  async adminAdjustCoins(
    userId: string,
    amount: number,
    isLocked: boolean = false,
    description?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      if (isLocked) {
        const currentLocked = Number(user.locked_coin_balance);
        const newLocked = currentLocked + amount;
        if (newLocked < 0) {
          throw new BadRequestException('Locked coin balance cannot be negative');
        }

        await tx.user.update({
          where: { id: userId },
          data: { locked_coin_balance: new Prisma.Decimal(newLocked) },
        });

        const coinTx = await tx.coinTransaction.create({
          data: {
            user_id: userId,
            type: CoinTransactionType.ADMIN_ADJUSTMENT,
            amount: new Prisma.Decimal(amount),
            coins_before: new Prisma.Decimal(currentLocked),
            coins_after: new Prisma.Decimal(newLocked),
            description: description || `Admin adjusted locked coin balance by ${amount > 0 ? '+' : ''}${amount}`,
          },
        });

        return { user_id: userId, new_locked_coins: newLocked, transaction: coinTx };
      } else {
        const currentBalance = Number(user.coin_balance);
        const newBalance = currentBalance + amount;
        if (newBalance < 0) {
          throw new BadRequestException('Available coin balance cannot be negative');
        }

        await tx.user.update({
          where: { id: userId },
          data: { coin_balance: new Prisma.Decimal(newBalance) },
        });

        const coinTx = await tx.coinTransaction.create({
          data: {
            user_id: userId,
            type: CoinTransactionType.ADMIN_ADJUSTMENT,
            amount: new Prisma.Decimal(amount),
            coins_before: new Prisma.Decimal(currentBalance),
            coins_after: new Prisma.Decimal(newBalance),
            description: description || `Admin adjusted available coin balance by ${amount > 0 ? '+' : ''}${amount}`,
          },
        });

        return { user_id: userId, new_coin_balance: newBalance, transaction: coinTx };
      }
    });
  }
}
