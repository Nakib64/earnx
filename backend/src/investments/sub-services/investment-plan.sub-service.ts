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

  async updatePlan(
    id: string,
    data: Partial<{
      title: string;
      amount: number;
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
    if (data.amount !== undefined) {
      updateData.amount = new Prisma.Decimal(data.amount);
      updateData.min_amount = new Prisma.Decimal(data.amount);
      updateData.max_amount = new Prisma.Decimal(data.amount);
    }
    if (data.monthly_return_percent !== undefined)
      updateData.monthly_return_percent = new Prisma.Decimal(data.monthly_return_percent);
    if (data.is_lifetime !== undefined) {
      updateData.is_lifetime = data.is_lifetime;
      updateData.duration_months = data.is_lifetime
        ? null
        : data.duration_months || plan.duration_months || 12;
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
