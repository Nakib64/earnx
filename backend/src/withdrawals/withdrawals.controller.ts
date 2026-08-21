import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { AdminJwtGuard } from '../admin-auth/guards/admin-jwt.guard';
import { UserJwtGuard } from '../user-auth/guards/user-jwt.guard';
import { RequestStatus } from '@prisma/client';

@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  // ----------------------------------------------------
  // User Routes
  // ----------------------------------------------------

  @UseGuards(UserJwtGuard)
  @Post('request')
  async requestWithdrawal(@Request() req: any, @Body() body: { amount: number }) {
    return this.withdrawalsService.requestWithdrawal(req.user.id, body.amount);
  }

  @UseGuards(UserJwtGuard)
  @Get('my')
  async getMyWithdrawals(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 20;
    return this.withdrawalsService.getUserWithdrawals(req.user.id, p, l);
  }

  // ----------------------------------------------------
  // Admin Routes
  // ----------------------------------------------------

  @UseGuards(AdminJwtGuard)
  @Get()
  async getAllWithdrawals(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: RequestStatus,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 20;
    return this.withdrawalsService.getAllWithdrawals(p, l, search, status);
  }

  @UseGuards(AdminJwtGuard)
  @Post(':id/resend-otp')
  async resendOtp(@Param('id') id: string) {
    return this.withdrawalsService.resendOtp(id);
  }

  @UseGuards(AdminJwtGuard)
  @Post(':id/payment')
  async processPayment(
    @Param('id') id: string,
    @Body() body: { target_user_id: string },
    @Request() req: any,
  ) {
    const adminPhone = req.user?.phone || req.user?.name || 'Admin';
    return this.withdrawalsService.processPayment(id, body.target_user_id, adminPhone);
  }
}
