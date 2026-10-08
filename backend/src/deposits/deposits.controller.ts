import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DepositsService } from './deposits.service';
import { UserJwtGuard } from '../user-auth/guards/user-jwt.guard';
import { AdminJwtGuard } from '../admin-auth/guards/admin-jwt.guard';
import { RequestStatus } from '@prisma/client';

@Controller('deposits')
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}

  /**
   * Public/User: Get active payment gateway numbers
   */
  @Get('gateways')
  async getGateways() {
    return this.depositsService.getDepositGateways();
  }

  /**
   * User: Submit a new deposit request
   */
  @UseGuards(UserJwtGuard)
  @Post('submit')
  async submitDeposit(
    @Request() req: any,
    @Body()
    body: {
      method: string;
      sender_number: string;
      amount: number;
      trx_id: string;
    },
  ) {
    return this.depositsService.submitDeposit(req.user.id, body);
  }

  /**
   * User: View own deposit history
   */
  @UseGuards(UserJwtGuard)
  @Get('my-history')
  async getMyDeposits(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.depositsService.getMyDeposits(
      req.user.id,
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
    );
  }

  /**
   * Admin: List all deposits
   */
  @UseGuards(AdminJwtGuard)
  @Get('admin')
  async getAllDeposits(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('status') status?: RequestStatus,
  ) {
    return this.depositsService.getAllDeposits(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      search,
      status,
    );
  }

  /**
   * Admin: Approve deposit
   */
  @UseGuards(AdminJwtGuard)
  @Post('admin/:id/approve')
  async approveDeposit(@Request() req: any, @Param('id') id: string) {
    return this.depositsService.approveDeposit(id, req.user?.phone || req.user?.email || 'admin');
  }

  /**
   * Admin: Reject deposit
   */
  @UseGuards(AdminJwtGuard)
  @Post('admin/:id/reject')
  async rejectDeposit(
    @Request() req: any,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.depositsService.rejectDeposit(
      id,
      req.user?.phone || req.user?.email || 'admin',
      reason,
    );
  }

  /**
   * Admin: Update gateway numbers
   */
  @UseGuards(AdminJwtGuard)
  @Patch('admin/gateways')
  async updateGateways(@Body() body: any) {
    return this.depositsService.updateDepositGateways(body);
  }
}
