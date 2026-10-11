import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CommissionService } from '../../commissions/commission.service';
import { CoinsService } from '../../coins/coins.service';
import { TransactionType, CommissionType, UserStatus, Prisma } from '@prisma/client';

@Injectable()
export class PremiumPackageSubService implements OnModuleInit {
  private readonly logger = new Logger(PremiumPackageSubService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly commissionService: CommissionService,
    @Optional() private readonly coinsService?: CoinsService,
  ) {}

  async onModuleInit() {
    await this.seedDefaultPackagesIfEmpty();
  }

  /**
   * Seed 3 initial default packages if none exist
   */
  async seedDefaultPackagesIfEmpty() {
    try {
      const count = await this.prisma.premiumPackage.count();
      if (count === 0) {
        this.logger.log('Seeding 3 initial Premium Membership Packages...');
        await this.prisma.premiumPackage.createMany({
          data: [
            {
              title: 'Bronze VIP Package',
              description: 'Entry-level VIP membership. Watch 30 ads daily to earn ৳30 guaranteed cash.',
              original_price: new Prisma.Decimal(10000),
              discount_percent: 65,
              price: new Prisma.Decimal(3500),
              daily_ads_count: 30,
              daily_reward_amount: new Prisma.Decimal(30),
              duration_days: 365,
              is_active: true,
              direct_referral_commission: new Prisma.Decimal(500),
            },
            {
              title: 'Silver VIP Package',
              description: 'Mid-tier VIP membership. Watch 30 ads daily to earn ৳60 guaranteed cash.',
              original_price: new Prisma.Decimal(20000),
              discount_percent: 65,
              price: new Prisma.Decimal(7000),
              daily_ads_count: 30,
              daily_reward_amount: new Prisma.Decimal(60),
              duration_days: 365,
              is_active: true,
              direct_referral_commission: new Prisma.Decimal(800),
            },
            {
              title: 'Gold VIP Package',
              description: 'High-yield VIP membership. Watch 40 ads daily to earn ৳120 guaranteed cash.',
              original_price: new Prisma.Decimal(30000),
              discount_percent: 50,
              price: new Prisma.Decimal(15000),
              daily_ads_count: 40,
              daily_reward_amount: new Prisma.Decimal(120),
              duration_days: 365,
              is_active: true,
              direct_referral_commission: new Prisma.Decimal(1500),
            },
          ],
        });
        this.logger.log('Initial Premium Packages seeded successfully!');
      }
    } catch (err: any) {
      this.logger.warn(`Notice while checking packages: ${err.message}`);
    }
  }

  // ==========================================
  // PACKAGE MANAGEMENT (Admin & Public)
  // ==========================================

  async getActivePackages() {
    try {
      const rows = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT id, title, description, original_price, discount_percent, price, daily_ads_count, daily_reward_amount, duration_days, is_active, direct_referral_commission, created_at, updated_at
        FROM "PremiumPackage"
        WHERE is_active = true
        ORDER BY price ASC
      `);
      return rows;
    } catch {
      return this.prisma.premiumPackage.findMany({
        where: { is_active: true },
        orderBy: { price: 'asc' },
      });
    }
  }

  async getAllPackages() {
    try {
      const rows = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT id, title, description, original_price, discount_percent, price, daily_ads_count, daily_reward_amount, duration_days, is_active, direct_referral_commission, created_at, updated_at
        FROM "PremiumPackage"
        ORDER BY price ASC
      `);
      return rows;
    } catch {
      return this.prisma.premiumPackage.findMany({
        orderBy: { price: 'asc' },
      });
    }
  }

  async createPackage(data: {
    title: string;
    description?: string;
    original_price?: number;
    discount_percent?: number;
    price: number;
    daily_ads_count: number;
    daily_reward_amount: number;
    duration_days?: number;
    direct_referral_commission?: number;
  }) {
    if (data.price <= 0) throw new BadRequestException('Package price must be greater than zero');
    if (data.daily_ads_count <= 0) throw new BadRequestException('Daily ads count must be at least 1');
    if (data.daily_reward_amount <= 0) throw new BadRequestException('Daily reward amount must be greater than zero');

    const created = await this.prisma.premiumPackage.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        original_price: data.original_price ? new Prisma.Decimal(data.original_price) : null,
        discount_percent: data.discount_percent ?? (data.original_price && data.original_price > data.price ? Math.round(((data.original_price - data.price) / data.original_price) * 100) : 0),
        price: new Prisma.Decimal(data.price),
        daily_ads_count: data.daily_ads_count,
        daily_reward_amount: new Prisma.Decimal(data.daily_reward_amount),
        duration_days: data.duration_days || 365,
        is_active: true,
        direct_referral_commission: new Prisma.Decimal(data.direct_referral_commission || 0),
      },
    });

    if (data.direct_referral_commission !== undefined) {
      try {
        await this.prisma.$executeRawUnsafe(
          `UPDATE "PremiumPackage" SET direct_referral_commission = $1 WHERE id = $2`,
          Number(data.direct_referral_commission),
          created.id,
        );
      } catch {}
    }

    return created;
  }

  async updatePackage(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      original_price: number;
      discount_percent: number;
      price: number;
      daily_ads_count: number;
      daily_reward_amount: number;
      duration_days: number;
      is_active: boolean;
      direct_referral_commission: number;
    }>,
  ) {
    const pkg = await this.prisma.premiumPackage.findUnique({ where: { id } });
    if (!pkg) throw new NotFoundException('Package not found');

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.original_price !== undefined)
      updateData.original_price = data.original_price ? new Prisma.Decimal(data.original_price) : null;
    if (data.discount_percent !== undefined)
      updateData.discount_percent = data.discount_percent;
    if (data.price !== undefined) updateData.price = new Prisma.Decimal(data.price);
    if (data.daily_ads_count !== undefined) updateData.daily_ads_count = data.daily_ads_count;
    if (data.daily_reward_amount !== undefined)
      updateData.daily_reward_amount = new Prisma.Decimal(data.daily_reward_amount);
    if (data.duration_days !== undefined) updateData.duration_days = data.duration_days;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.direct_referral_commission !== undefined)
      updateData.direct_referral_commission = new Prisma.Decimal(data.direct_referral_commission);

    const updated = await this.prisma.premiumPackage.update({
      where: { id },
      data: updateData,
    });

    if (data.direct_referral_commission !== undefined) {
      try {
        await this.prisma.$executeRawUnsafe(
          `UPDATE "PremiumPackage" SET direct_referral_commission = $1, updated_at = NOW() WHERE id = $2`,
          Number(data.direct_referral_commission),
          id,
        );
      } catch {}
    }

    try {
      const freshRows = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT id, title, description, original_price, discount_percent, price, daily_ads_count, daily_reward_amount, duration_days, is_active, direct_referral_commission, created_at, updated_at FROM "PremiumPackage" WHERE id = $1`,
        id,
      );
      if (freshRows && freshRows[0]) {
        return freshRows[0];
      }
    } catch {}

    return updated;
  }

  async deletePackage(id: string) {
    return this.prisma.premiumPackage.delete({ where: { id } });
  }

  // ==========================================
  // PACKAGE SUBSCRIPTION (User)
  // ==========================================

  async subscribePackage(userId: string, packageId: string, referrerCode?: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const pkg = await tx.premiumPackage.findUnique({ where: { id: packageId } });
        if (!pkg || !pkg.is_active) {
          throw new BadRequestException('Selected premium package is invalid or inactive');
        }

        const cost = Number(pkg.price);
        const userBal = Number(user.wallet_balance);

        const now = new Date();
        const expiresAt = new Date(
          now.getTime() + (pkg.duration_days || 365) * 24 * 60 * 60 * 1000,
        );

        // Mandatory Sponsor Referral Code: A valid code from an existing active user is required
        const cleanRefCode = referrerCode?.trim();
        if (!cleanRefCode) {
          throw new BadRequestException('A valid sponsor referral code is mandatory to purchase a premium package.');
        }

        const sponsorToSet = await tx.user.findFirst({
          where: {
            referral_code: { equals: cleanRefCode, mode: 'insensitive' },
          },
        });

        if (!sponsorToSet) {
          throw new BadRequestException(`Sponsor referral code "${cleanRefCode}" is invalid or does not exist.`);
        }

        if (sponsorToSet.id === userId) {
          throw new BadRequestException('You cannot use your own referral code to purchase a package.');
        }

        // Link user to this sponsor
        if (!user.referred_by_id || user.referred_by_id !== sponsorToSet.id) {
          await tx.user.update({
            where: { id: userId },
            data: { referred_by_id: sponsorToSet.id },
          });
        }

        // Deduct balance atomically
        const deductResult = await tx.user.updateMany({
          where: {
            id: userId,
            wallet_balance: { gte: new Prisma.Decimal(cost) },
          },
          data: {
            wallet_balance: { decrement: new Prisma.Decimal(cost) },
            is_premium: true,
            premium_package_id: pkg.id,
            premium_started_at: now,
            premium_expires_at: expiresAt,
          },
        });

        if (deductResult.count === 0) {
          throw new BadRequestException(
            `Insufficient account balance. Required: ৳${cost.toFixed(2)}, Available: ৳${userBal.toFixed(2)}.`,
          );
        }

        const freshUser = await tx.user.findUnique({
          where: { id: userId },
          select: { wallet_balance: true },
        });

        const balanceAfter = Number(freshUser?.wallet_balance || 0);
        const balanceBefore = balanceAfter + cost;

        // Record transaction
        await tx.walletTransaction.create({
          data: {
            user_id: userId,
            type: TransactionType.WITHDRAW,
            amount: new Prisma.Decimal(-cost),
            balance_before: new Prisma.Decimal(balanceBefore),
            balance_after: new Prisma.Decimal(balanceAfter),
            description: `Subscribed to ${pkg.title} package`,
          },
        });

        // Distribute multi-level Premium referral commissions (direct sponsor gets package direct referral commission)
        try {
          await this.commissionService.distributeCommissions(
            userId,
            CommissionType.PREMIUM,
            tx,
            pkg,
          );
        } catch (commErr) {
          this.logger.error(`Commission distribution error for user ${userId}:`, commErr);
        }

        // Grant locked premium bonus coins if enabled
        if (this.coinsService) {
          try {
            await this.coinsService.grantLockedCoinsOnPremium(userId, tx);
          } catch (coinErr) {
            this.logger.error(`Coins grant error for user ${userId}:`, coinErr);
          }
        }

        return {
          success: true,
          message: `Successfully upgraded to ${pkg.title}! You can now watch daily ads to claim your daily rewards.`,
          package: pkg,
          newBalance: balanceAfter,
        };
      },
      { maxWait: 10000, timeout: 30000 },
    );
  }

  // ==========================================
  // ADMIN: PREMIUM USERS LIST
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
        { email: { contains: q, mode: 'insensitive' } },
        { referral_code: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        full_name: true,
        phone: true,
        email: true,
        referral_code: true,
        wallet_balance: true,
        is_premium: true,
        premium_package: true,
        premium_started_at: true,
        premium_expires_at: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
