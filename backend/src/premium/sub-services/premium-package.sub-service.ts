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
    return this.prisma.premiumPackage.findMany({
      where: { is_active: true },
      orderBy: { price: 'asc' },
    });
  }

  async getAllPackages() {
    return this.prisma.premiumPackage.findMany({
      orderBy: { price: 'asc' },
    });
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
  }) {
    if (data.price <= 0) throw new BadRequestException('Package price must be greater than zero');
    if (data.daily_ads_count <= 0) throw new BadRequestException('Daily ads count must be at least 1');
    if (data.daily_reward_amount <= 0) throw new BadRequestException('Daily reward amount must be greater than zero');

    return this.prisma.premiumPackage.create({
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
      },
    });
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

    return this.prisma.premiumPackage.update({
      where: { id },
      data: updateData,
    });
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

        // Handle Referrer Assignment (Optional Referrer ID or fallback to company earnx-123)
        const COMPANY_CODE = 'earnx-123';
        const cleanRefCode = referrerCode?.trim();

        let sponsorToSet: any = null;
        if (cleanRefCode) {
          sponsorToSet = await tx.user.findFirst({
            where: {
              referral_code: { equals: cleanRefCode, mode: 'insensitive' },
              NOT: { id: userId },
            },
          });
        }

        // If no user found for provided code, or no code was provided: fallback to company ID earnx-123
        if (!sponsorToSet) {
          sponsorToSet = await tx.user.findFirst({
            where: {
              referral_code: { equals: COMPANY_CODE, mode: 'insensitive' },
              NOT: { id: userId },
            },
          });

          if (!sponsorToSet) {
            sponsorToSet = await tx.user.create({
              data: {
                phone: '01700000000',
                email: 'company@earnx.com',
                password_hash: '$2b$10$earnxcompanyhashfallbackplaceholder',
                full_name: 'EarnX Official',
                referral_code: COMPANY_CODE,
                status: UserStatus.ACTIVE,
                is_premium: true,
                country: 'Bangladesh',
              },
            });
          }
        }

        // Set user sponsor so user goes under this referrer/company
        if (sponsorToSet && sponsorToSet.id !== userId) {
          if (!user.referred_by_id || user.referred_by_id !== sponsorToSet.id) {
            await tx.user.update({
              where: { id: userId },
              data: { referred_by_id: sponsorToSet.id },
            });
          }
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

        // Distribute multi-level Premium referral commissions (uplines must be Premium)
        try {
          await this.commissionService.distributeCommissions(
            userId,
            CommissionType.PREMIUM,
            tx,
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
