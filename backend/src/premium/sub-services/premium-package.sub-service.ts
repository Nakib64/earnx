import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionType, Prisma } from '@prisma/client';

@Injectable()
export class PremiumPackageSubService implements OnModuleInit {
  private readonly logger = new Logger(PremiumPackageSubService.name);

  constructor(private readonly prisma: PrismaService) {}

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
              title: 'Bronze Member',
              price: new Prisma.Decimal(500),
              daily_ads_count: 4,
              daily_reward_amount: new Prisma.Decimal(15),
              duration_days: 365,
              is_active: true,
            },
            {
              title: 'Silver Member',
              price: new Prisma.Decimal(1000),
              daily_ads_count: 6,
              daily_reward_amount: new Prisma.Decimal(35),
              duration_days: 365,
              is_active: true,
            },
            {
              title: 'Gold VIP Member',
              price: new Prisma.Decimal(2000),
              daily_ads_count: 8,
              daily_reward_amount: new Prisma.Decimal(80),
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

  async subscribePackage(userId: string, packageId: string) {
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

        if (userBal < cost) {
          throw new BadRequestException(
            `Insufficient account balance. Required: ৳${cost.toFixed(2)}, Available: ৳${userBal.toFixed(2)}.`,
          );
        }

        const balanceAfter = userBal - cost;
        const now = new Date();
        const expiresAt = new Date(
          now.getTime() + (pkg.duration_days || 365) * 24 * 60 * 60 * 1000,
        );

        // Deduct balance
        await tx.user.update({
          where: { id: userId },
          data: {
            wallet_balance: new Prisma.Decimal(balanceAfter),
            is_premium: true,
            premium_package_id: pkg.id,
            premium_started_at: now,
            premium_expires_at: expiresAt,
          },
        });

        // Record transaction
        await tx.walletTransaction.create({
          data: {
            user_id: userId,
            type: TransactionType.WITHDRAW,
            amount: new Prisma.Decimal(-cost),
            balance_before: new Prisma.Decimal(userBal),
            balance_after: new Prisma.Decimal(balanceAfter),
            description: `Subscribed to ${pkg.title} package`,
          },
        });

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
