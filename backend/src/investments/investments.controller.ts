import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { UserJwtGuard } from '../user-auth/guards/user-jwt.guard';
import { AdminJwtGuard } from '../admin-auth/guards/admin-jwt.guard';

@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  // ================= USER ENDPOINTS =================

  @Get('plans')
  @Get('active-plans')
  async getPublicPlans() {
    return this.investmentsService.getActivePlans();
  }

  @UseGuards(UserJwtGuard)
  @Post('subscribe')
  async subscribe(@Request() req, @Body() body: { planId: string }) {
    return this.investmentsService.createInvestment(
      req.user.id,
      body.planId,
    );
  }

  @UseGuards(UserJwtGuard)
  @Post('upgrade')
  async requestUpgrade(
    @Request() req,
    @Body() body: { currentInvestmentId: string; targetPlanId: string },
  ) {
    return this.investmentsService.requestUpgrade(
      req.user.id,
      body.currentInvestmentId,
      body.targetPlanId,
    );
  }

  @UseGuards(UserJwtGuard)
  @Post('withdraw-capital')
  async requestCapitalWithdrawal(
    @Request() req,
    @Body() body: { investmentId: string; amount?: number },
  ) {
    return this.investmentsService.requestCapitalWithdrawal(
      req.user.id,
      body.investmentId,
      body.amount !== undefined && !isNaN(Number(body.amount)) ? Number(body.amount) : undefined,
    );
  }

  @UseGuards(UserJwtGuard)
  @Get('my')
  async getMyInvestments(@Request() req) {
    return this.investmentsService.getUserInvestments(req.user.id);
  }

  // ================= ADMIN ENDPOINTS =================

  @UseGuards(AdminJwtGuard)
  @Get('admin/plans')
  async getAllPlansAdmin() {
    return this.investmentsService.getAllPlans();
  }

  @UseGuards(AdminJwtGuard)
  @Post('admin/plans')
  async createPlan(
    @Body()
    body: {
      title: string;
      amount?: number;
      min_amount?: number;
      max_amount?: number;
      monthly_return_percent: number;
      duration_months?: number;
      is_lifetime?: boolean;
    },
  ) {
    const amt = Number(body.amount || body.min_amount || 0);
    return this.investmentsService.createPlan({
      title: body.title,
      amount: amt,
      monthly_return_percent: Number(body.monthly_return_percent),
      duration_months: body.duration_months,
      is_lifetime: body.is_lifetime,
    });
  }

  @UseGuards(AdminJwtGuard)
  @Put('admin/plans/:id')
  async updatePlan(@Param('id') id: string, @Body() body: any) {
    return this.investmentsService.updatePlan(id, body);
  }

  @UseGuards(AdminJwtGuard)
  @Delete('admin/plans/:id')
  async deletePlan(@Param('id') id: string) {
    return this.investmentsService.deletePlan(id);
  }

  @UseGuards(AdminJwtGuard)
  @Get('admin/all')
  async getAdminInvestments() {
    return this.investmentsService.getAdminInvestments();
  }

  @UseGuards(AdminJwtGuard)
  @Post('admin/investments/:id/approve')
  async approveInvestment(@Param('id') id: string) {
    return this.investmentsService.approveUserInvestment(id);
  }

  @UseGuards(AdminJwtGuard)
  @Post('admin/investments/:id/reject')
  async rejectInvestment(@Param('id') id: string) {
    return this.investmentsService.rejectUserInvestment(id);
  }

  @UseGuards(AdminJwtGuard)
  @Delete('admin/investments/:id')
  async deleteInvestment(@Param('id') id: string) {
    return this.investmentsService.deleteUserInvestment(id);
  }

  @UseGuards(AdminJwtGuard)
  @Post('admin/create-for-user')
  async createForUser(
    @Body() body: { userId: string; planId: string; amount: number },
  ) {
    return this.investmentsService.createInvestmentForUser(
      body.userId,
      body.planId,
      Number(body.amount),
    );
  }

  @UseGuards(AdminJwtGuard)
  @Post('admin/payout-selected')
  async payoutSelected(
    @Body('investment_ids') investmentIds: string[],
  ) {
    return this.investmentsService.payoutSpecificInvestments(investmentIds || []);
  }

  @UseGuards(AdminJwtGuard)
  @Post('admin/trigger-payouts')
  async triggerPayouts() {
    return this.investmentsService.processMonthlyPayouts(true);
  }
}
