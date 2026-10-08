import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestStatus, TransactionType, Prisma } from '@prisma/client';

@Injectable()
export class InvestmentExecutionSubService {
  private readonly logger = new Logger(InvestmentExecutionSubService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // USER SUBSCRIPTIONS & UPGRADES / WITHDRAWALS
  // ==========================================

  async createInvestment(userId: string, planId: string, amount?: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const plan = await this.prisma.investmentPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.is_active) {
      throw new BadRequestException('Invalid or inactive investment plan');
    }

    const minRequired =
      Number(plan.min_amount) > 0 ? Number(plan.min_amount) : Number(plan.amount) || 1000;
    const investAmount = amount && Number(amount) > 0 ? Number(amount) : minRequired;

    if (investAmount < minRequired) {
      throw new BadRequestException(
        `Investment amount cannot be less than the minimum required amount of ৳${minRequired.toLocaleString()}.`,
      );
    }

    const userBal = Number(user.wallet_balance);

    if (userBal < investAmount) {
      throw new BadRequestException(
        `Insufficient account balance. You have ৳${userBal.toLocaleString()} in your wallet, but ৳${investAmount.toLocaleString()} is required.`,
      );
    }

    const returnPercent = Number(plan.monthly_return_percent);
    const monthlyPayout = (investAmount * returnPercent) / 100;
    const isLifetime = plan.is_lifetime || false;
    const durationMonths = isLifetime ? null : plan.duration_months || 12;

    const now = new Date();
    const nextPayout = new Date();
    nextPayout.setMonth(now.getMonth() + 1);

    const endsAt = durationMonths
      ? new Date(now.getFullYear(), now.getMonth() + durationMonths, now.getDate())
      : null;

    return this.prisma.$transaction(
      async (tx) => {
        // 1. Deduct investment amount from user's account balance
        const newBal = userBal - investAmount;
        await tx.user.update({
          where: { id: userId },
          data: { wallet_balance: new Prisma.Decimal(newBal) },
        });

        // 2. Log wallet transaction
        await tx.walletTransaction.create({
          data: {
            user_id: userId,
            type: TransactionType.WITHDRAW,
            amount: new Prisma.Decimal(-investAmount),
            balance_before: new Prisma.Decimal(userBal),
            balance_after: new Prisma.Decimal(newBal),
            description: `Investment package subscribed: ${plan.title} (৳${investAmount.toLocaleString()})`,
          },
        });

        // 3. Create active investment record with lock period
        return tx.userInvestment.create({
          data: {
            user_id: userId,
            plan_id: planId,
            amount: new Prisma.Decimal(investAmount),
            monthly_return_percent: new Prisma.Decimal(returnPercent),
            monthly_payout_amount: new Prisma.Decimal(monthlyPayout),
            status: RequestStatus.APPROVED,
            request_type: 'NEW',
            total_payouts_made: 0,
            max_payouts: durationMonths,
            duration_months: durationMonths,
            is_lifetime: isLifetime,
            starts_at: now,
            ends_at: endsAt,
            is_principal_returned: false,
            next_payout_at: nextPayout,
          },
          include: { plan: true, pending_plan: true },
        });
      },
      { maxWait: 10000, timeout: 30000 },
    );
  }

  async requestUpgrade(userId: string, currentInvestmentId: string, targetPlanId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const inv = await this.prisma.userInvestment.findFirst({
      where: { id: currentInvestmentId, user_id: userId },
      include: { plan: true },
    });
    if (!inv) throw new NotFoundException('Active investment record not found');
    if (inv.status === RequestStatus.PENDING) {
      throw new BadRequestException('You already have a pending request on this investment.');
    }

    const targetPlan = await this.prisma.investmentPlan.findUnique({
      where: { id: targetPlanId },
    });
    if (!targetPlan || !targetPlan.is_active) {
      throw new BadRequestException('Target upgrade package is invalid or inactive.');
    }

    const currentAmt = Number(inv.amount);
    const targetAmt =
      Number(targetPlan.amount) > 0 ? Number(targetPlan.amount) : Number(targetPlan.min_amount);

    if (targetAmt <= currentAmt) {
      throw new BadRequestException(
        'Target package must be higher than your current invested amount.',
      );
    }

    const remainingToPay = targetAmt - currentAmt;
    const userBal = Number(user.wallet_balance);

    if (userBal < remainingToPay) {
      throw new BadRequestException(
        `Insufficient account balance. Upgrading from ৳${currentAmt.toLocaleString()} to ৳${targetAmt.toLocaleString()} requires ৳${remainingToPay.toLocaleString()}, but your current wallet balance is ৳${userBal.toLocaleString()}.`,
      );
    }

    const returnPercent = Number(targetPlan.monthly_return_percent);
    const monthlyPayout = (targetAmt * returnPercent) / 100;
    const isLifetime = targetPlan.is_lifetime || false;

    const now = new Date();
    const nextPayout =
      inv.next_payout_at || new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    return this.prisma.$transaction(
      async (tx) => {
        // 1. Deduct remaining upgrade cost from account balance
        const newBal = userBal - remainingToPay;
        await tx.user.update({
          where: { id: userId },
          data: { wallet_balance: new Prisma.Decimal(newBal) },
        });

        // 2. Log transaction
        await tx.walletTransaction.create({
          data: {
            user_id: userId,
            type: TransactionType.WITHDRAW,
            amount: new Prisma.Decimal(remainingToPay),
            balance_before: new Prisma.Decimal(userBal),
            balance_after: new Prisma.Decimal(newBal),
            description: `Investment package upgrade to ${targetPlan.title} (৳${remainingToPay.toLocaleString()})`,
          },
        });

        // 3. Update investment to new target package
        return tx.userInvestment.update({
          where: { id: currentInvestmentId },
          data: {
            plan_id: targetPlanId,
            amount: new Prisma.Decimal(targetAmt),
            monthly_return_percent: new Prisma.Decimal(returnPercent),
            monthly_payout_amount: new Prisma.Decimal(monthlyPayout),
            is_lifetime: isLifetime,
            max_payouts: isLifetime ? null : targetPlan.duration_months || 12,
            status: RequestStatus.APPROVED,
            request_type: 'NEW',
            pending_plan_id: null,
            pending_amount: null,
            next_payout_at: nextPayout,
          },
          include: { plan: true, pending_plan: true },
        });
      },
      { maxWait: 10000, timeout: 30000 },
    );
  }

  async requestCapitalWithdrawal(userId: string, investmentId: string, withdrawAmount?: number) {
    const inv = await this.prisma.userInvestment.findFirst({
      where: { id: investmentId, user_id: userId },
      include: { plan: true },
    });
    if (!inv) throw new NotFoundException('Active investment record not found');

    const currentAmt = Number(inv.amount);
    if (currentAmt <= 0) {
      throw new BadRequestException('This investment has no active capital to withdraw.');
    }

    // Capital lock rule: Cannot withdraw invested principal before the tenure ends
    if (inv.ends_at && new Date() < new Date(inv.ends_at)) {
      const lockDateStr = new Date(inv.ends_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      throw new BadRequestException(
        `Invested principal is locked until ${lockDateStr}. You cannot withdraw invested funds before the package tenure ends.`,
      );
    }

    const planTitle = inv.plan?.title || 'Investment Package';

    return this.prisma.$transaction(
      async (tx) => {
        // 1. Directly credit 100% of capital back to user's account balance
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (user) {
          const userBalBefore = Number(user.wallet_balance);
          const userBalAfter = userBalBefore + currentAmt;

          await tx.user.update({
            where: { id: userId },
            data: { wallet_balance: new Prisma.Decimal(userBalAfter) },
          });

          await tx.walletTransaction.create({
            data: {
              user_id: userId,
              type: TransactionType.INVESTMENT_PAYOUT,
              amount: new Prisma.Decimal(currentAmt),
              balance_before: new Prisma.Decimal(userBalBefore),
              balance_after: new Prisma.Decimal(userBalAfter),
              description: `Direct investment capital withdrawal refund: ${planTitle} (৳${currentAmt.toLocaleString()})`,
            },
          });
        }

        // 2. Immediately delete the investment package record
        return tx.userInvestment.delete({
          where: { id: investmentId },
        });
      },
      { maxWait: 10000, timeout: 30000 },
    );
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
    const nextPayout =
      inv.next_payout_at || new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    if (inv.request_type === 'UPGRADE' && inv.pending_plan_id && inv.pending_plan) {
      const targetPlan = inv.pending_plan;
      const targetAmt =
        Number(targetPlan.amount) > 0 ? Number(targetPlan.amount) : Number(targetPlan.min_amount);
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
          max_payouts: isLifetime ? null : targetPlan.duration_months || 12,
          status: RequestStatus.APPROVED,
          request_type: 'NEW',
          pending_plan_id: null,
          pending_amount: null,
          next_payout_at: nextPayout,
        },
        include: { user: true, plan: true, pending_plan: true },
      });
    }

    if (inv.request_type === 'WITHDRAWAL') {
      const refundAmt = Number(inv.pending_amount) || Number(inv.amount);

      return this.prisma.$transaction(
        async (tx) => {
          // Refund 100% of capital back to user's wallet
          const user = await tx.user.findUnique({ where: { id: inv.user_id } });
          if (user && refundAmt > 0) {
            const userBalBefore = Number(user.wallet_balance);
            const userBalAfter = userBalBefore + refundAmt;

            await tx.user.update({
              where: { id: inv.user_id },
              data: { wallet_balance: new Prisma.Decimal(userBalAfter) },
            });

            await tx.walletTransaction.create({
              data: {
                user_id: inv.user_id,
                type: TransactionType.WITHDRAW,
                amount: new Prisma.Decimal(refundAmt),
                balance_before: new Prisma.Decimal(userBalBefore),
                balance_after: new Prisma.Decimal(userBalAfter),
                description: `Invested capital withdrawal refund (100% total refund)`,
              },
            });
          }

          return tx.userInvestment.update({
            where: { id },
            data: {
              amount: new Prisma.Decimal(0),
              monthly_payout_amount: new Prisma.Decimal(0),
              status: RequestStatus.REJECTED, // Terminated/closed
              request_type: 'NEW',
              pending_amount: null,
              next_payout_at: null,
            },
            include: { user: true, plan: true, pending_plan: true },
          });
        },
        { maxWait: 10000, timeout: 30000 },
      );
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

  async createInvestmentForUser(userId: string, planId: string, customAmount?: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const plan = await this.prisma.investmentPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Investment plan not found');

    const planAmt =
      customAmount && customAmount > 0
        ? customAmount
        : Number(plan.amount) > 0
        ? Number(plan.amount)
        : Number(plan.min_amount);

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
        max_payouts: isLifetime ? null : plan.duration_months || 12,
        is_lifetime: isLifetime,
        next_payout_at: nextPayout,
      },
      include: { user: true, plan: true },
    });
  }

  async processMonthlyPayouts(force = false) {
    const now = new Date();

    const whereClause: Prisma.UserInvestmentWhereInput = {
      status: RequestStatus.APPROVED,
    };

    if (!force) {
      whereClause.OR = [{ next_payout_at: null }, { next_payout_at: { lte: now } }];
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

      await this.prisma.$transaction(
        async (tx) => {
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
              description: `Monthly Investment Return (${newPayoutCount}${
                isLifetime ? ' - Lifetime' : '/' + maxPayouts
              })`,
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
        },
        { maxWait: 10000, timeout: 30000 },
      );

      count++;
    }

    this.logger.log(`Processed ${count} monthly investment return payouts.`);
    return { success: true, processedCount: count };
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

      await this.prisma.$transaction(
        async (tx) => {
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
              description: `Monthly Investment Return (${newPayoutCount}${
                isLifetime ? ' - Lifetime' : '/' + maxPayouts
              })`,
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
        },
        { maxWait: 10000, timeout: 30000 },
      );

      count++;
    }

    this.logger.log(`Targeted payout processed for ${count} user investments.`);
    return { success: true, processedCount: count };
  }
}
