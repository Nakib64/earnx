import { Controller, Post, Query, Body, UseGuards } from '@nestjs/common';
import { PremiumService } from './premium.service';
import { AdminJwtGuard } from '../admin-auth/guards/admin-jwt.guard';

@Controller('admin/premium')
@UseGuards(AdminJwtGuard)
export class PremiumController {
  constructor(private readonly premiumService: PremiumService) {}

  @Post('trigger-payouts')
  async triggerPayouts(
    @Query('force') force?: string,
    @Body('force') bodyForce?: boolean,
  ) {
    const isForce = force !== undefined ? force === 'true' : bodyForce !== undefined ? bodyForce : true;
    return this.premiumService.processWeeklyPayouts(isForce);
  }
}
