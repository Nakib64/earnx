import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class InvestmentPlanSubService {
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
    amount?: number;
    min_amount?: number;
    max_amount?: number;
    monthly_return_percent: number;
    duration_months?: number;
    is_lifetime?: boolean;
  }) {
    const minAmt = Number(data.min_amount || data.amount || 0);
    if (minAmt <= 0) {
      throw new BadRequestException('Minimum package investment amount must be greater than 0');
    }
    if (data.monthly_return_percent <= 0 || data.monthly_return_percent > 100) {
      throw new BadRequestException('Monthly return percentage must be between 0 and 100');
    }

    const isLifetime = data.is_lifetime || false;
    const maxAmt = data.max_amount ? Number(data.max_amount) : null;

    return this.prisma.investmentPlan.create({
      data: {
        title: data.title,
        amount: new Prisma.Decimal(minAmt),
        min_amount: new Prisma.Decimal(minAmt),
        max_amount: maxAmt ? new Prisma.Decimal(maxAmt) : null,
        monthly_return_percent: new Prisma.Decimal(data.monthly_return_percent),
        duration_months: isLifetime ? null : (data.duration_months || 3),
        is_lifetime: isLifetime,
      },
    });
  }

  async updatePlan(
    id: string,
    data: Partial<{
      title: string;
      amount: number;
      min_amount: number;
      max_amount: number | null;
      monthly_return_percent: number;
      duration_months: number;
      is_lifetime: boolean;
      is_active: boolean;
    }>,
  ) {
    const plan = await this.prisma.investmentPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Investment plan not found');

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.min_amount !== undefined || data.amount !== undefined) {
      const amt = Number(data.min_amount ?? data.amount);
      updateData.amount = new Prisma.Decimal(amt);
      updateData.min_amount = new Prisma.Decimal(amt);
    }
    if (data.max_amount !== undefined) {
      updateData.max_amount = data.max_amount ? new Prisma.Decimal(data.max_amount) : null;
    }
    if (data.monthly_return_percent !== undefined)
      updateData.monthly_return_percent = new Prisma.Decimal(data.monthly_return_percent);
    if (data.is_lifetime !== undefined) {
      updateData.is_lifetime = data.is_lifetime;
      updateData.duration_months = data.is_lifetime
        ? null
        : data.duration_months || plan.duration_months || 3;
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
}
