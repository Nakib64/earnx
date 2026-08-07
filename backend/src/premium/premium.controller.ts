import { Controller, Post, Get, Query, Body, UseGuards } from '@nestjs/common';
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

  @Get('users')
  async getPremiumUsers(@Query('search') search?: string) {
    return this.premiumService.getPremiumUsers(search);
  }

  @Post('payout-selected')
  async payoutSelectedUsers(@Body('user_ids') userIds: string[]) {
    return this.premiumService.payoutSpecificUsers(userIds || []);
  }
}
