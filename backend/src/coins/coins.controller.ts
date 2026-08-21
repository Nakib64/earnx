import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { CoinsService } from './coins.service';
import { UserJwtGuard } from '../user-auth/guards/user-jwt.guard';
import { AdminJwtGuard } from '../admin-auth/guards/admin-jwt.guard';

@Controller('coins')
export class CoinsController {
  constructor(private readonly coinsService: CoinsService) {}

  // ==========================================
  // USER ENDPOINTS
  // ==========================================

  @UseGuards(UserJwtGuard)
  @Get('info')
  async getCoinInfo(@Request() req: any) {
    return this.coinsService.getCoinInfo(req.user.id);
  }

  @UseGuards(UserJwtGuard)
  @Post('buy')
  async buyCoins(@Request() req: any, @Body() body: { amount: number }) {
    return this.coinsService.buyCoins(req.user.id, body.amount);
  }

  @UseGuards(UserJwtGuard)
  @Post('unlock-premium')
  async unlockPremiumCoins(@Request() req: any) {
    return this.coinsService.unlockPremiumCoins(req.user.id);
  }

  @UseGuards(UserJwtGuard)
  @Get('transactions')
  async getUserTransactions(@Request() req: any) {
    return this.coinsService.getUserTransactions(req.user.id);
  }

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================

  @UseGuards(AdminJwtGuard)
  @Get('admin/stats')
  async getAdminStats() {
    return this.coinsService.getAdminCoinStats();
  }

  @UseGuards(AdminJwtGuard)
  @Get('admin/users')
  async getAdminCoinUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.coinsService.getAdminCoinUsers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      search,
    );
  }

  @UseGuards(AdminJwtGuard)
  @Patch('admin/configs')
  async updateAdminCoinConfigs(
    @Body()
    body: {
      COIN_PRICE?: number;
      PREMIUM_FREE_COINS?: number;
      PREMIUM_FREE_COINS_REQUIRED_REFERRALS?: number;
    },
  ) {
    return this.coinsService.updateAdminCoinConfigs(body);
  }

  @UseGuards(AdminJwtGuard)
  @Post('admin/configs')
  async postAdminCoinConfigs(
    @Body()
    body: {
      COIN_PRICE?: number;
      PREMIUM_FREE_COINS?: number;
      PREMIUM_FREE_COINS_REQUIRED_REFERRALS?: number;
    },
  ) {
    return this.coinsService.updateAdminCoinConfigs(body);
  }

  @UseGuards(AdminJwtGuard)
  @Post('admin/adjust')
  async adminAdjustCoins(
    @Body()
    body: {
      user_id: string;
      amount: number;
      is_locked?: boolean;
      description?: string;
    },
  ) {
    return this.coinsService.adminAdjustCoins(
      body.user_id,
      body.amount,
      body.is_locked,
      body.description,
    );
  }
}

