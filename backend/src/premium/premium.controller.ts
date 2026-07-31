import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { PremiumService } from './premium.service';
import { AdminJwtGuard } from '../admin-auth/guards/admin-jwt.guard';

@Controller('admin/premium')
@UseGuards(AdminJwtGuard)
export class PremiumController {
  constructor(private readonly premiumService: PremiumService) {}

  @Post('trigger-payouts')
  async triggerPayouts() {
    return this.premiumService.processWeeklyPayouts();
  }
}
