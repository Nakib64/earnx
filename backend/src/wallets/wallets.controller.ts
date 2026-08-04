import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { UserJwtGuard } from '../user-auth/guards/user-jwt.guard';
import { AdminJwtGuard } from '../admin-auth/guards/admin-jwt.guard';
import { TransactionType } from '@prisma/client';

@Controller()
export class WalletsController {
  constructor(private readonly walletService: WalletService) {}

  // User transaction ledger
  @UseGuards(UserJwtGuard)
  @Get('wallet/transactions')
  async getUserTransactions(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.walletService.getUserTransactions(
      req.user.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  // Network Balance Transfer (User)
  @UseGuards(UserJwtGuard)
  @Get('wallet/verify-recipient')
  async verifyRecipient(
    @Request() req: any,
    @Query('referral_code') referralCode: string,
  ) {
    return this.walletService.verifyTransferRecipient(req.user.id, referralCode);
  }

  @UseGuards(UserJwtGuard)
  @Post('wallet/transfer')
  async transferBalance(
    @Request() req: any,
    @Body('target_referral_code') targetReferralCode: string,
    @Body('amount') amount: number,
  ) {
    return this.walletService.executeBalanceTransfer(
      req.user.id,
      targetReferralCode,
      Number(amount),
    );
  }

  // Admin transaction ledger & manual adjustments
  @UseGuards(AdminJwtGuard)
  @Get('admin/wallet/transactions')
  async getAllTransactions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('user_id') userId?: string,
    @Query('type') type?: TransactionType,
    @Query('search') search?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    return this.walletService.getAllTransactions(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      userId,
      type,
      search,
      startDate,
      endDate,
    );
  }

  @UseGuards(AdminJwtGuard)
  @Post('admin/wallet/adjust')
  async adminAdjustWallet(
    @Body('user_id') userId: string,
    @Body('amount') amount: number,
    @Body('description') description: string,
  ) {
    return this.walletService.processTransaction(
      userId,
      TransactionType.ADMIN_ADJUSTMENT,
      amount,
      description || 'Manual Admin Wallet Adjustment',
    );
  }
}
