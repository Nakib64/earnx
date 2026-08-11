import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { RequestStatus, TransactionType, Prisma } from '@prisma/client';

@Injectable()
export class InvestmentsService {
  private readonly logger = new Logger(InvestmentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // INVESTMENT PLANS (Admin Management)
  // ==========================================

  async getActivePlans() {
    return this.prisma.investmentPlan.findMany({
      where: { is_active: true },
      orderBy: { amount: 'asc' },
    });
  }

  async getAllPlans() {
    return this.prisma.investmentPlan.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async createPlan(data: {
    title: string;
    amount: number;
    monthly_return_percent: number;
    duration_months?: number;
    is_lifetime?: boolean;
  }) {
    if (data.amount <= 0) {
      throw new BadRequestException('Invalid package investment amount');
    }
    if (data.monthly_return_percent <= 0 || data.monthly_return_percent > 100) {
      throw new BadRequestException('Monthly return percentage must be between 0 and 100');
    }

    const isLifetime = data.is_lifetime || false;

    return this.prisma.investmentPlan.create({
      data: {
        title: data.title,
        amount: new Prisma.Decimal(data.amount),
        min_amount: new Prisma.Decimal(data.amount),
        max_amount: new Prisma.Decimal(data.amount),
        monthly_return_percent: new Prisma.Decimal(data.monthly_return_percent),
        duration_months: isLifetime ? null : (data.duration_months || 12),
        is_lifetime: isLifetime,
      },
    });
  }

  async updatePlan(id: string, data: Partial<{
    title: string;
    amount: number;
    monthly_return_percent: number;
    duration_months: number;
    is_lifetime: boolean;
    is_active: boolean;
  }>) {
    const plan = await this.prisma.investmentPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Investment plan not found');

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.amount !== undefined) {
      updateData.amount = new Prisma.Decimal(data.amount);
      updateData.min_amount = new Prisma.Decimal(data.amount);
      updateData.max_amount = new Prisma.Decimal(data.amount);
    }
    if (data.monthly_return_percent !== undefined)
      updateData.monthly_return_percent = new Prisma.Decimal(data.monthly_return_percent);
    if (data.is_lifetime !== undefined) {
      updateData.is_lifetime = data.is_lifetime;
      updateData.duration_months = data.is_lifetime ? null : (data.duration_months || plan.duration_months || 12);
    } else if (data.duration_months !== undefined) {
      updateData.duration_months = data.duration_months;
    }
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    return this.prisma.investmentPlan.update({
      where: { id },
      data: updateData,
    });
  }

  async deletePlan(id: string) {
    return this.prisma.investmentPlan.delete({ where: { id } });
  }

  // ==========================================
  // USER INVESTMENTS & UPGRADES / WITHDRAWALS
  // ==========================================

  async createInvestment(userId: string, planId: string, amount?: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const plan = await this.prisma.investmentPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.is_active) {
      throw new BadRequestException('Invalid or inactive investment plan');
    }

    const planAmount = Number(plan.amount) > 0 ? Number(plan.amount) : Number(plan.min_amount);
    const returnPercent = Number(plan.monthly_return_percent);
    const monthlyPayout = (planAmount * returnPercent) / 100;
    const isLifetime = plan.is_lifetime || false;

    return this.prisma.userInvestment.create({
      data: {
        user_id: userId,
        plan_id: planId,
        amount: new Prisma.Decimal(planAmount),
        monthly_return_percent: new Prisma.Decimal(returnPercent),
        monthly_payout_amount: new Prisma.Decimal(monthlyPayout),
        status: RequestStatus.PENDING,
        request_type: 'NEW',
        total_payouts_made: 0,
        max_payouts: isLifetime ? null : (plan.duration_months || 12),
        is_lifetime: isLifetime,
      },
      include: { plan: true, pending_plan: true },
    });
  }

  async requestUpgrade(userId: string, currentInvestmentId: string, targetPlanId: string) {
    const inv = await this.prisma.userInvestment.findFirst({
      where: { id: currentInvestmentId, user_id: userId },
      include: { plan: true },
    });
    if (!inv) throw new NotFoundException('Active investment record not found');
    if (inv.status === RequestStatus.PENDING) {
      throw new BadRequestException('You already have a pending request on this investment.');
    }

    const targetPlan = await this.prisma.investmentPlan.findUnique({ where: { id: targetPlanId } });
    if (!targetPlan || !targetPlan.is_active) {
      throw new BadRequestException('Target upgrade package is invalid or inactive.');
    }

    const currentAmt = Number(inv.amount);
    const targetAmt = Number(targetPlan.amount) > 0 ? Number(targetPlan.amount) : Number(targetPlan.min_amount);

    if (targetAmt <= currentAmt) {
      throw new BadRequestException('Target package must be higher than your current invested amount.');
    }

    const remainingToPay = targetAmt - currentAmt;

    return this.prisma.userInvestment.update({
      where: { id: currentInvestmentId },
      data: {
        request_type: 'UPGRADE',
        pending_plan_id: targetPlanId,
        pending_amount: new Prisma.Decimal(remainingToPay),
        status: RequestStatus.PENDING,
      },
      include: { plan: true, pending_plan: true },
    });
  }

  async requestCapitalWithdrawal(userId: string, investmentId: string, withdrawAmount: number) {
    const inv = await this.prisma.userInvestment.findFirst({
      where: { id: investmentId, user_id: userId },
    });
    if (!inv) throw new NotFoundException('Active investment record not found');
    if (inv.status === RequestStatus.PENDING) {
      throw new BadRequestException('You already have a pending request on this investment.');
    }

    const currentAmt = Number(inv.amount);
    if (withdrawAmount <= 0 || withdrawAmount > currentAmt) {
      throw new BadRequestException(`Withdrawal amount must be between ৳1 and ৳${currentAmt}`);
    }

    return this.prisma.userInvestment.update({
      where: { id: investmentId },
      data: {
        request_type: 'WITHDRAWAL',
        pending_amount: new Prisma.Decimal(withdrawAmount),
        status: RequestStatus.PENDING,
      },
      include: { plan: true, pending_plan: true },
    });
  }

  async getUserInvestments(userId: string) {
    return this.prisma.userInvestment.findMany({
      where: { user_id: userId },
      include: { plan: true, pending_plan: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async getAdminInvestments() {
    return this.prisma.userInvestment.findMany({
      include: {
        user: { select: { id: true, full_name: true, phone: true } },
        plan: true,
        pending_plan: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async approveUserInvestment(id: string) {
    const inv = await this.prisma.userInvestment.findUnique({
      where: { id },
      include: { pending_plan: true, plan: true },
    });
    if (!inv) throw new NotFoundException('Investment record not found');
    if (inv.status !== RequestStatus.PENDING) {
      throw new BadRequestException(`Investment is already ${inv.status}`);
    }

    const now = new Date();
    const nextPayout = inv.next_payout_at || new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    if (inv.request_type === 'UPGRADE' && inv.pending_plan_id && inv.pending_plan) {
      const targetPlan = inv.pending_plan;
      const targetAmt = Number(targetPlan.amount) > 0 ? Number(targetPlan.amount) : Number(targetPlan.min_amount);
      const returnPercent = Number(targetPlan.monthly_return_percent);
      const monthlyPayout = (targetAmt * returnPercent) / 100;
      const isLifetime = targetPlan.is_lifetime || false;

      return this.prisma.userInvestment.update({
        where: { id },
        data: {
          plan_id: inv.pending_plan_id,
          amount: new Prisma.Decimal(targetAmt),
          monthly_return_percent: new Prisma.Decimal(returnPercent),
          monthly_payout_amount: new Prisma.Decimal(monthlyPayout),
          is_lifetime: isLifetime,
          max_payouts: isLifetime ? null : (targetPlan.duration_months || 12),
          status: RequestStatus.APPROVED,
          request_type: 'NEW',
          pending_plan_id: null,
          pending_amount: null,
          next_payout_at: nextPayout,
        },
        include: { user: true, plan: true, pending_plan: true },
      });
    }

    if (inv.request_type === 'WITHDRAWAL' && inv.pending_amount) {
      const withdrawAmt = Number(inv.pending_amount);
      const newAmount = Number(inv.amount) - withdrawAmt;

      if (newAmount <= 0) {
        return this.prisma.userInvestment.update({
          where: { id },
          data: {
            amount: new Prisma.Decimal(0),
            monthly_payout_amount: new Prisma.Decimal(0),
            status: RequestStatus.REJECTED,
            request_type: 'NEW',
            pending_amount: null,
            next_payout_at: null,
          },
          include: { user: true, plan: true, pending_plan: true },
        });
      }

      const returnPercent = Number(inv.monthly_return_percent);
      const newMonthlyPayout = (newAmount * returnPercent) / 100;

      return this.prisma.userInvestment.update({
        where: { id },
        data: {
          amount: new Prisma.Decimal(newAmount),
          monthly_payout_amount: new Prisma.Decimal(newMonthlyPayout),
          status: RequestStatus.APPROVED,
          request_type: 'NEW',
          pending_amount: null,
        },
        include: { user: true, plan: true, pending_plan: true },
      });
    }

    return this.prisma.userInvestment.update({
      where: { id },
      data: {
        status: RequestStatus.APPROVED,
        request_type: 'NEW',
        pending_plan_id: null,
        pending_amount: null,
        next_payout_at: nextPayout,
      },
      include: { user: true, plan: true, pending_plan: true },
    });
  }

  async rejectUserInvestment(id: string) {
    const inv = await this.prisma.userInvestment.findUnique({ where: { id } });
    if (!inv) throw new NotFoundException('Investment record not found');
    if (inv.status !== RequestStatus.PENDING) {
      throw new BadRequestException(`Investment is already ${inv.status}`);
    }

    if (inv.request_type === 'UPGRADE' || inv.request_type === 'WITHDRAWAL') {
      return this.prisma.userInvestment.update({
        where: { id },
        data: {
          status: RequestStatus.APPROVED,
          request_type: 'NEW',
          pending_plan_id: null,
          pending_amount: null,
        },
        include: { user: true, plan: true },
      });
    }

    return this.prisma.userInvestment.update({
      where: { id },
      data: { status: RequestStatus.REJECTED },
      include: { user: true, plan: true },
    });
  }

  async deleteUserInvestment(id: string) {
    return this.prisma.userInvestment.delete({ where: { id } });
  }

  // ==========================================
  // MONTHLY PAYOUT CRON & PROCESSOR
  // ==========================================

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Executing automated monthly investment return check...');
    await this.processMonthlyPayouts(false);
  }

  async processMonthlyPayouts(force = false) {
    const now = new Date();

    const whereClause: Prisma.UserInvestmentWhereInput = {
      status: RequestStatus.APPROVED,
    };

    if (!force) {
      whereClause.OR = [
        { next_payout_at: null },
        { next_payout_at: { lte: now } },
      ];
    }

    const dueInvestments = await this.prisma.userInvestment.findMany({
      where: whereClause,
      include: { user: true, plan: true },
    });

    let count = 0;

    for (const inv of dueInvestments) {
      const isLifetime = inv.is_lifetime || false;
      const maxPayouts = inv.max_payouts;

      if (!isLifetime && maxPayouts !== null && inv.total_payouts_made >= maxPayouts) {
        await this.prisma.userInvestment.update({
          where: { id: inv.id },
          data: { status: RequestStatus.REJECTED }, // Mark completed
        });
        continue;
      }

      await this.prisma.$transaction(async (tx) => {
        const payoutAmt = Number(inv.monthly_payout_amount);
        const userBalBefore = Number(inv.user.wallet_balance);
        const userBalAfter = userBalBefore + payoutAmt;
        const newPayoutCount = inv.total_payouts_made + 1;
        const isCompleted = !isLifetime && maxPayouts !== null && newPayoutCount >= maxPayouts;

        const nextDate = new Date(inv.next_payout_at || now);
        nextDate.setMonth(nextDate.getMonth() + 1);

        // 1. Credit wallet balance
        await tx.user.update({
          where: { id: inv.user_id },
          data: { wallet_balance: new Prisma.Decimal(userBalAfter) },
        });

        // 2. Log transaction
        await tx.walletTransaction.create({
          data: {
            user_id: inv.user_id,
            type: TransactionType.INVESTMENT_PAYOUT,
            amount: new Prisma.Decimal(payoutAmt),
            balance_before: new Prisma.Decimal(userBalBefore),
            balance_after: new Prisma.Decimal(userBalAfter),
            description: `Monthly Investment Return (${newPayoutCount}${isLifetime ? ' - Lifetime' : '/' + maxPayouts})`,
          },
        });

        // 3. Update investment record
        await tx.userInvestment.update({
          where: { id: inv.id },
          data: {
            total_payouts_made: newPayoutCount,
            last_payout_at: now,
            next_payout_at: isCompleted ? null : nextDate,
          },
        });
      }, { maxWait: 10000, timeout: 30000 });

      count++;
    }

    this.logger.log(`Processed ${count} monthly investment return payouts.`);
    return { success: true, processedCount: count };
  }

  // ==========================================
  // ADMIN MANUAL ASSIGNMENT & TARGETED PAYOUTS
  // ==========================================

  async createInvestmentForUser(userId: string, planId: string, customAmount?: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const plan = await this.prisma.investmentPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Investment plan not found');

    const planAmt = (customAmount && customAmount > 0)
      ? customAmount
      : (Number(plan.amount) > 0 ? Number(plan.amount) : Number(plan.min_amount));

    const returnPercent = Number(plan.monthly_return_percent);
    const monthlyPayout = (planAmt * returnPercent) / 100;
    const isLifetime = plan.is_lifetime || false;

    const now = new Date();
    const nextPayout = new Date();
    nextPayout.setMonth(now.getMonth() + 1);

    return this.prisma.userInvestment.create({
      data: {
        user_id: userId,
        plan_id: planId,
        amount: new Prisma.Decimal(planAmt),
        monthly_return_percent: new Prisma.Decimal(returnPercent),
        monthly_payout_amount: new Prisma.Decimal(monthlyPayout),
        status: RequestStatus.APPROVED, // Direct active status when assigned by Admin
        request_type: 'NEW',
        total_payouts_made: 0,
        max_payouts: isLifetime ? null : (plan.duration_months || 12),
        is_lifetime: isLifetime,
        next_payout_at: nextPayout,
      },
      include: { user: true, plan: true },
    });
  }

  async payoutSpecificInvestments(investmentIds: string[]) {
    if (!investmentIds || investmentIds.length === 0) {
      return { success: true, processedCount: 0 };
    }

    const now = new Date();
    const targetInvestments = await this.prisma.userInvestment.findMany({
      where: {
        id: { in: investmentIds },
      },
      include: { user: true, plan: true },
    });

    let count = 0;

    for (const inv of targetInvestments) {
      const isLifetime = inv.is_lifetime || false;
      const maxPayouts = inv.max_payouts;

      if (!isLifetime && maxPayouts !== null && inv.total_payouts_made >= maxPayouts) {
        continue;
      }

      await this.prisma.$transaction(async (tx) => {
        const payoutAmt = Number(inv.monthly_payout_amount);
        const userBalBefore = Number(inv.user.wallet_balance);
        const userBalAfter = userBalBefore + payoutAmt;
        const newPayoutCount = inv.total_payouts_made + 1;
        const isCompleted = !isLifetime && maxPayouts !== null && newPayoutCount >= maxPayouts;

        const nextDate = new Date();
        nextDate.setMonth(now.getMonth() + 1);

        // 1. Credit wallet balance
        await tx.user.update({
          where: { id: inv.user_id },
          data: { wallet_balance: new Prisma.Decimal(userBalAfter) },
        });

        // 2. Log transaction
        await tx.walletTransaction.create({
          data: {
            user_id: inv.user_id,
            type: TransactionType.INVESTMENT_PAYOUT,
            amount: new Prisma.Decimal(payoutAmt),
            balance_before: new Prisma.Decimal(userBalBefore),
            balance_after: new Prisma.Decimal(userBalAfter),
            description: `Monthly Investment Return (${newPayoutCount}${isLifetime ? ' - Lifetime' : '/' + maxPayouts})`,
          },
        });

        // 3. Update investment record
        await tx.userInvestment.update({
          where: { id: inv.id },
          data: {
            status: RequestStatus.APPROVED,
            total_payouts_made: newPayoutCount,
            last_payout_at: now,
            next_payout_at: isCompleted ? null : nextDate,
          },
        });
      }, { maxWait: 10000, timeout: 30000 });

      count++;
    }

    this.logger.log(`Targeted payout processed for ${count} user investments.`);
    return { success: true, processedCount: count };
  }
}
