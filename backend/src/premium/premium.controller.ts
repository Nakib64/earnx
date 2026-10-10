import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Query,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PremiumService } from './premium.service';
import { UserJwtGuard } from '../user-auth/guards/user-jwt.guard';
import { AdminJwtGuard } from '../admin-auth/guards/admin-jwt.guard';

@Controller('premium')
export class PremiumController {
  constructor(private readonly premiumService: PremiumService) {}

  // ==========================================
  // PUBLIC / USER ENDPOINTS
  // ==========================================

  @Get('packages')
  async getActivePackages() {
    return this.premiumService.getActivePackages();
  }

  @UseGuards(UserJwtGuard)
  @Post('subscribe')
  async subscribePackage(
    @Request() req: any,
    @Body('package_id') packageId: string,
    @Body('referrer_code') referrerCode?: string,
  ) {
    return this.premiumService.subscribePackage(req.user.id, packageId, referrerCode);
  }

  @UseGuards(UserJwtGuard)
  @Get('daily-task')
  async getDailyTask(@Request() req: any) {
    return this.premiumService.getDailyTask(req.user.id);
  }

  @UseGuards(UserJwtGuard)
  @Post('watch-ad')
  async recordAdWatched(@Request() req: any) {
    return this.premiumService.recordAdWatched(req.user.id);
  }

  @UseGuards(UserJwtGuard)
  @Post('claim-daily-reward')
  async claimDailyReward(@Request() req: any) {
    return this.premiumService.claimDailyReward(req.user.id);
  }

  @UseGuards(UserJwtGuard)
  @Get('user/ads-analytics')
  async getUserAdsAnalytics(
    @Request() req: any,
    @Query('timeframe') timeframe?: string,
  ) {
    return this.premiumService.getUserAdsAnalytics(req.user.id, timeframe);
  }

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================

  @UseGuards(AdminJwtGuard)
  @Get('admin/packages')
  async getAllPackages() {
    return this.premiumService.getAllPackages();
  }

  @UseGuards(AdminJwtGuard)
  @Post('admin/packages')
  async createPackage(@Body() body: any) {
    return this.premiumService.createPackage(body);
  }

  @UseGuards(AdminJwtGuard)
  @Patch('admin/packages/:id')
  async updatePackage(@Param('id') id: string, @Body() body: any) {
    return this.premiumService.updatePackage(id, body);
  }

  @UseGuards(AdminJwtGuard)
  @Delete('admin/packages/:id')
  async deletePackage(@Param('id') id: string) {
    return this.premiumService.deletePackage(id);
  }

  @UseGuards(AdminJwtGuard)
  @Get('admin/users')
  async getPremiumUsers(@Query('search') search?: string) {
    return this.premiumService.getPremiumUsers(search);
  }

  @UseGuards(AdminJwtGuard)
  @Get('admin/ads-analytics')
  async getAdsAnalytics(@Query('timeframe') timeframe?: string) {
    return this.premiumService.getAdsAnalytics(timeframe);
  }
}

