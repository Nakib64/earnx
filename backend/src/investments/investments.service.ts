import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InvestmentPlanSubService } from './sub-services/investment-plan.sub-service';
import { InvestmentExecutionSubService } from './sub-services/investment-execution.sub-service';

/**
 * InvestmentsService acts as a Facade orchestrating investment sub-services:
 * - InvestmentPlanSubService: Package tier configuration & catalog management
 * - InvestmentExecutionSubService: User investments, principal lock enforcement, returns, and payout processing
 */
@Injectable()
export class InvestmentsService {
  private readonly logger = new Logger(InvestmentsService.name);

  constructor(
    private readonly planSubService: InvestmentPlanSubService,
    private readonly executionSubService: InvestmentExecutionSubService,
  ) {}

  // ==========================================
  // INVESTMENT PLANS (Admin Management)
  // ==========================================
  async getActivePlans() {
    return this.planSubService.getActivePlans();
  }

  async getAllPlans() {
    return this.planSubService.getAllPlans();
  }

  async createPlan(data: {
    title: string;
    amount: number;
    monthly_return_percent: number;
    duration_months?: number;
    is_lifetime?: boolean;
  }) {
    return this.planSubService.createPlan(data);
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
    return this.planSubService.updatePlan(id, data);
  }

  async deletePlan(id: string) {
    return this.planSubService.deletePlan(id);
  }

  // ==========================================
  // USER INVESTMENTS & UPGRADES / WITHDRAWALS
  // ==========================================
  async createInvestment(userId: string, planId: string, amount?: number) {
    return this.executionSubService.createInvestment(userId, planId, amount);
  }

  async requestUpgrade(userId: string, currentInvestmentId: string, targetPlanId: string) {
    return this.executionSubService.requestUpgrade(userId, currentInvestmentId, targetPlanId);
  }

  async requestCapitalWithdrawal(userId: string, investmentId: string, withdrawAmount?: number) {
    return this.executionSubService.requestCapitalWithdrawal(userId, investmentId, withdrawAmount);
  }

  async getUserInvestments(userId: string) {
    return this.executionSubService.getUserInvestments(userId);
  }

  async getAdminInvestments() {
    return this.executionSubService.getAdminInvestments();
  }

  async approveUserInvestment(id: string) {
    return this.executionSubService.approveUserInvestment(id);
  }

  async rejectUserInvestment(id: string) {
    return this.executionSubService.rejectUserInvestment(id);
  }

  async deleteUserInvestment(id: string) {
    return this.executionSubService.deleteUserInvestment(id);
  }

  // ==========================================
  // MONTHLY PAYOUT CRON & PROCESSOR
  // ==========================================
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Executing automated monthly investment return check...');
    await this.executionSubService.processMonthlyPayouts(false);
  }

  async processMonthlyPayouts(force = false) {
    return this.executionSubService.processMonthlyPayouts(force);
  }

  // ==========================================
  // ADMIN MANUAL ASSIGNMENT & TARGETED PAYOUTS
  // ==========================================
  async createInvestmentForUser(userId: string, planId: string, customAmount?: number) {
    return this.executionSubService.createInvestmentForUser(userId, planId, customAmount);
  }

  async payoutSpecificInvestments(investmentIds: string[]) {
    return this.executionSubService.payoutSpecificInvestments(investmentIds);
  }
}
