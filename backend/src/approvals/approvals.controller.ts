import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { UserJwtGuard } from '../user-auth/guards/user-jwt.guard';
import { ActiveUserGuard } from '../user-auth/guards/active-user.guard';
import { AdminJwtGuard } from '../admin-auth/guards/admin-jwt.guard';

@Controller()
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  // USER ACTIVATION REQUESTS
  @UseGuards(UserJwtGuard)
  @Post('requests/activation')
  async submitActivation(@Request() req: any) {
    return this.approvalsService.submitActivationRequest(req.user.id);
  }

  @UseGuards(UserJwtGuard)
  @Get('requests/downlines/pending')
  async getDownlinePending(@Request() req: any) {
    return this.approvalsService.getPendingDownlineApprovals(req.user.id);
  }

  @UseGuards(UserJwtGuard)
  @Post('requests/activation/:id/approve')
  async referrerApproveActivation(@Request() req: any, @Param('id') id: string) {
    return this.approvalsService.approveActivationRequest(id, req.user.id, false);
  }

  @UseGuards(UserJwtGuard)
  @Post('requests/activation/:id/reject')
  async referrerRejectActivation(
    @Request() req: any,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.approvalsService.rejectActivationRequest(id, req.user.id, reason, false);
  }

  // USER PREMIUM REQUESTS
  @UseGuards(UserJwtGuard, ActiveUserGuard)
  @Post('requests/premium')
  async submitPremium(@Request() req: any) {
    return this.approvalsService.submitPremiumRequest(req.user.id);
  }

  @UseGuards(UserJwtGuard)
  @Post('requests/premium/:id/approve')
  async referrerApprovePremium(@Request() req: any, @Param('id') id: string) {
    return this.approvalsService.approvePremiumRequest(id, req.user.id, false);
  }

  @UseGuards(UserJwtGuard)
  @Post('requests/premium/:id/reject')
  async referrerRejectPremium(
    @Request() req: any,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.approvalsService.rejectPremiumRequest(id, req.user.id, reason, false);
  }

  // USER WITHDRAWAL REQUESTS
  @UseGuards(UserJwtGuard, ActiveUserGuard)
  @Post('requests/withdrawal')
  async submitWithdrawal(
    @Request() req: any,
    @Body('amount') amount: number,
  ) {
    return this.approvalsService.submitWithdrawalRequest(req.user.id, amount);
  }

  // ADMIN APPROVAL QUEUE & CONTROLS
  @UseGuards(AdminJwtGuard)
  @Get('admin/requests/pending')
  async getAdminPendingQueue() {
    return this.approvalsService.getAllPendingAdminApprovals();
  }

  @UseGuards(AdminJwtGuard)
  @Post('admin/requests/activation/:id/approve')
  async adminApproveActivation(@Request() req: any, @Param('id') id: string) {
    return this.approvalsService.approveActivationRequest(id, req.user.id, true);
  }

  @UseGuards(AdminJwtGuard)
  @Post('admin/requests/activation/:id/reject')
  async adminRejectActivation(
    @Request() req: any,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.approvalsService.rejectActivationRequest(id, req.user.id, reason, true);
  }

  @UseGuards(AdminJwtGuard)
  @Post('admin/requests/premium/:id/approve')
  async adminApprovePremium(@Request() req: any, @Param('id') id: string) {
    return this.approvalsService.approvePremiumRequest(id, req.user.id, true);
  }

  @UseGuards(AdminJwtGuard)
  @Post('admin/requests/premium/:id/reject')
  async adminRejectPremium(
    @Request() req: any,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.approvalsService.rejectPremiumRequest(id, req.user.id, reason, true);
  }

  @UseGuards(AdminJwtGuard)
  @Post('admin/requests/withdrawal/:id/approve')
  async adminApproveWithdrawal(@Request() req: any, @Param('id') id: string) {
    return this.approvalsService.approveWithdrawalRequest(id, req.user.id);
  }

  @UseGuards(AdminJwtGuard)
  @Post('admin/requests/withdrawal/:id/reject')
  async adminRejectWithdrawal(
    @Request() req: any,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.approvalsService.rejectWithdrawalRequest(id, req.user.id, reason);
  }
}
