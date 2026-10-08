import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CoinPurchaseSubService } from './sub-services/coin-purchase.sub-service';
import { CoinTransferSubService } from './sub-services/coin-transfer.sub-service';
import { CoinRewardSubService } from './sub-services/coin-reward.sub-service';
import { CoinAdminSubService } from './sub-services/coin-admin.sub-service';

/**
 * CoinsService acts as a Facade orchestrating dedicated coin domain sub-services:
 * - CoinPurchaseSubService: Balance deductions & direct coin purchasing
 * - CoinTransferSubService: P2P coin transfers, escrow holding, receiver acceptance/rejection
 * - CoinRewardSubService: Premium reward locking, criteria verification & manual unlock
 * - CoinAdminSubService: Admin statistics, manual adjustments & configuration updates
 */
@Injectable()
export class CoinsService {
  constructor(
    private readonly coinPurchaseSubService: CoinPurchaseSubService,
    private readonly coinTransferSubService: CoinTransferSubService,
    private readonly coinRewardSubService: CoinRewardSubService,
    private readonly coinAdminSubService: CoinAdminSubService,
  ) {}

  // ==========================================
  // COIN INFO & REWARDS
  // ==========================================
  async getCoinInfo(userId: string) {
    return this.coinRewardSubService.getCoinInfo(userId);
  }

  async grantLockedCoinsOnPremium(userId: string, txClient?: Prisma.TransactionClient) {
    return this.coinRewardSubService.grantLockedCoinsOnPremium(userId, txClient);
  }

  async unlockPremiumCoins(userId: string) {
    return this.coinRewardSubService.unlockPremiumCoins(userId);
  }

  async checkAndUnlockForReferrer(referrerId: string, txClient?: Prisma.TransactionClient) {
    return this.coinRewardSubService.checkAndUnlockForReferrer(referrerId, txClient);
  }

  async getUserTransactions(userId: string) {
    return this.coinRewardSubService.getUserTransactions(userId);
  }

  // ==========================================
  // COIN PURCHASES
  // ==========================================
  async buyCoins(userId: string, amount: number) {
    return this.coinPurchaseSubService.buyCoins(userId, amount);
  }

  // ==========================================
  // P2P COIN TRANSFERS
  // ==========================================
  async createCoinTransfer(
    senderId: string,
    data: {
      receiver_code: string;
      coin_amount: number;
      coin_rate: number;
      note?: string;
    },
  ) {
    return this.coinTransferSubService.createCoinTransfer(senderId, data);
  }

  async getPendingIncomingTransfers(userId: string) {
    return this.coinTransferSubService.getPendingIncomingTransfers(userId);
  }

  async getMyCoinTransfers(userId: string) {
    return this.coinTransferSubService.getMyCoinTransfers(userId);
  }

  async approveCoinTransfer(transferId: string, receiverId: string) {
    return this.coinTransferSubService.approveCoinTransfer(transferId, receiverId);
  }

  async rejectCoinTransfer(transferId: string, receiverId: string) {
    return this.coinTransferSubService.rejectCoinTransfer(transferId, receiverId);
  }

  // ==========================================
  // ADMIN OPERATIONS
  // ==========================================
  async getAdminCoinStats() {
    return this.coinAdminSubService.getAdminCoinStats();
  }

  async getAdminCoinUsers(page?: number, limit?: number, search?: string) {
    return this.coinAdminSubService.getAdminCoinUsers(page, limit, search);
  }

  async adminAdjustCoins(
    userId: string,
    amount: number,
    isLocked?: boolean,
    description?: string,
  ) {
    return this.coinAdminSubService.adminAdjustCoins(userId, amount, isLocked, description);
  }

  async updateAdminCoinConfigs(configs: {
    COIN_PRICE?: number;
    PREMIUM_FREE_COINS?: number;
    PREMIUM_FREE_COINS_REQUIRED_REFERRALS?: number;
  }) {
    return this.coinAdminSubService.updateAdminCoinConfigs(configs);
  }
}
