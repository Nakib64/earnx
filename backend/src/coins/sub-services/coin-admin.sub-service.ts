import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SystemConfigService } from '../../system-config/system-config.service';
import { CoinTransactionType, Prisma } from '@prisma/client';

@Injectable()
export class CoinAdminSubService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: SystemConfigService,
  ) {}

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

  // ==========================================
  // ADMIN UPDATE COIN CONFIGS
  // ==========================================
  async updateAdminCoinConfigs(configs: {
    COIN_PRICE?: number;
    PREMIUM_FREE_COINS?: number;
    PREMIUM_FREE_COINS_REQUIRED_REFERRALS?: number;
  }) {
    if (configs.COIN_PRICE !== undefined) {
      await this.configService.setValue('COIN_PRICE', String(configs.COIN_PRICE));
    }
    if (configs.PREMIUM_FREE_COINS !== undefined) {
      await this.configService.setValue('PREMIUM_FREE_COINS', String(configs.PREMIUM_FREE_COINS));
    }
    if (configs.PREMIUM_FREE_COINS_REQUIRED_REFERRALS !== undefined) {
      await this.configService.setValue(
        'PREMIUM_FREE_COINS_REQUIRED_REFERRALS',
        String(configs.PREMIUM_FREE_COINS_REQUIRED_REFERRALS),
      );
    }
    return { success: true, message: 'Coin configurations updated successfully' };
  }
}
