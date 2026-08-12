import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
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
    const data = await this.coinsService.getCoinInfo(req.user.id);
    return { success: true, data };
  }

  @UseGuards(UserJwtGuard)
  @Post('buy')
  async buyCoins(@Request() req: any, @Body() body: { amount: number }) {
    const data = await this.coinsService.buyCoins(req.user.id, body.amount);
    return { success: true, data };
  }

  @UseGuards(UserJwtGuard)
  @Post('unlock-premium')
  async unlockPremiumCoins(@Request() req: any) {
    const data = await this.coinsService.unlockPremiumCoins(req.user.id);
    return { success: true, data };
  }

  @UseGuards(UserJwtGuard)
  @Get('transactions')
  async getUserTransactions(@Request() req: any) {
    const data = await this.coinsService.getUserTransactions(req.user.id);
    return { success: true, data };
  }

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================

  @UseGuards(AdminJwtGuard)
  @Get('admin/stats')
  async getAdminStats() {
    const data = await this.coinsService.getAdminCoinStats();
    return { success: true, data };
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
    const data = await this.coinsService.adminAdjustCoins(
      body.user_id,
      body.amount,
      body.is_locked,
      body.description,
    );
    return { success: true, data };
  }
}
