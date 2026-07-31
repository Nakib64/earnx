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
      orderBy: { min_amount: 'asc' },
    });
  }

  async getAllPlans() {
    return this.prisma.investmentPlan.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async createPlan(data: {
    title: string;
    min_amount: number;
    max_amount: number;
    monthly_return_percent: number;
    duration_months?: number;
  }) {
    if (data.min_amount <= 0 || data.max_amount < data.min_amount) {
      throw new BadRequestException('Invalid min or max investment amounts');
    }
    if (data.monthly_return_percent <= 0 || data.monthly_return_percent > 100) {
      throw new BadRequestException('Monthly return percentage must be between 0 and 100');
    }

    return this.prisma.investmentPlan.create({
      data: {
        title: data.title,
        min_amount: new Prisma.Decimal(data.min_amount),
        max_amount: new Prisma.Decimal(data.max_amount),
        monthly_return_percent: new Prisma.Decimal(data.monthly_return_percent),
        duration_months: data.duration_months || 12,
      },
    });
  }

  async updatePlan(id: string, data: Partial<{
    title: string;
    min_amount: number;
    max_amount: number;
    monthly_return_percent: number;
    duration_months: number;
    is_active: boolean;
  }>) {
    const plan = await this.prisma.investmentPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Investment plan not found');

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.min_amount !== undefined) updateData.min_amount = new Prisma.Decimal(data.min_amount);
    if (data.max_amount !== undefined) updateData.max_amount = new Prisma.Decimal(data.max_amount);
    if (data.monthly_return_percent !== undefined)
      updateData.monthly_return_percent = new Prisma.Decimal(data.monthly_return_percent);
    if (data.duration_months !== undefined) updateData.duration_months = data.duration_months;
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
  // USER INVESTMENTS
  // ==========================================

  async createInvestment(userId: string, planId: string, amount: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const plan = await this.prisma.investmentPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.is_active) {
      throw new BadRequestException('Invalid or inactive investment plan');
    }

    const minAmt = Number(plan.min_amount);
    const maxAmt = Number(plan.max_amount);
    if (amount < minAmt || amount > maxAmt) {
      throw new BadRequestException(
        `Investment amount must be between ৳${minAmt} and ৳${maxAmt} for ${plan.title}`,
      );
    }

    if (Number(user.wallet_balance) < amount) {
      throw new BadRequestException('Insufficient wallet balance to invest');
    }

    const returnPercent = Number(plan.monthly_return_percent);
    const monthlyPayout = (amount * returnPercent) / 100;
    const now = new Date();
    const nextPayout = new Date();
    nextPayout.setMonth(now.getMonth() + 1);

    return this.prisma.$transaction(async (tx) => {
      // 1. Deduct wallet balance
      const balanceBefore = Number(user.wallet_balance);
      const balanceAfter = balanceBefore - amount;

      await tx.user.update({
        where: { id: userId },
        data: { wallet_balance: new Prisma.Decimal(balanceAfter) },
      });

      // 2. Log transaction
      await tx.walletTransaction.create({
        data: {
          user_id: userId,
          type: TransactionType.INVESTMENT_DEPOSIT,
          amount: new Prisma.Decimal(-amount),
          balance_before: new Prisma.Decimal(balanceBefore),
          balance_after: new Prisma.Decimal(balanceAfter),
          description: `Invested in ${plan.title} (৳${amount})`,
        },
      });

      // 3. Create active investment
      return tx.userInvestment.create({
        data: {
          user_id: userId,
          plan_id: planId,
          amount: new Prisma.Decimal(amount),
          monthly_return_percent: new Prisma.Decimal(returnPercent),
          monthly_payout_amount: new Prisma.Decimal(monthlyPayout),
          status: RequestStatus.APPROVED, // Direct activate when paid from wallet
          total_payouts_made: 0,
          max_payouts: plan.duration_months,
          next_payout_at: nextPayout,
        },
        include: { plan: true },
      });
    });
  }

  async getUserInvestments(userId: string) {
    return this.prisma.userInvestment.findMany({
      where: { user_id: userId },
      include: { plan: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async getAdminInvestments() {
    return this.prisma.userInvestment.findMany({
      include: {
        user: { select: { id: true, full_name: true, phone: true } },
        plan: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // ==========================================
  // MONTHLY PAYOUT CRON & PROCESSOR
  // ==========================================

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Executing automated monthly investment return check...');
    await this.processMonthlyPayouts();
  }

  async processMonthlyPayouts() {
    const now = new Date();

    const dueInvestments = await this.prisma.userInvestment.findMany({
      where: {
        status: RequestStatus.APPROVED,
        next_payout_at: { lte: now },
      },
      include: { user: true, plan: true },
    });

    let count = 0;

    for (const inv of dueInvestments) {
      if (inv.total_payouts_made >= inv.max_payouts) {
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
        const isCompleted = newPayoutCount >= inv.max_payouts;

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
            description: `Monthly Investment Return (${newPayoutCount}/${inv.max_payouts})`,
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
      });

      count++;
    }

    this.logger.log(`Processed ${count} monthly investment return payouts.`);
    return { success: true, processedCount: count };
  }
}
