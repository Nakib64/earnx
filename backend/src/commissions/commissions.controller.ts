import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CommissionService } from './commission.service';
import { AdminJwtGuard } from '../admin-auth/guards/admin-jwt.guard';
import { CommissionType } from '@prisma/client';

@Controller('admin/commissions')
@UseGuards(AdminJwtGuard)
export class CommissionsController {
  constructor(private readonly commissionService: CommissionService) {}

  @Get('rules')
  async getRules() {
    return this.commissionService.getCommissionRules();
  }

  @Post('rules')
  async upsertRule(
    @Body('type') type: CommissionType,
    @Body('level') level: number,
    @Body('amount') amount: number,
  ) {
    return this.commissionService.upsertCommissionRule(type, level, amount);
  }

  @Delete('rules/:id')
  async deleteRule(@Param('id') id: string) {
    return this.commissionService.deleteCommissionRule(id);
  }
}
