import { Injectable } from '@nestjs/common';
import { PremiumPackageSubService } from './sub-services/premium-package.sub-service';
import { DailyAdsSubService } from './sub-services/daily-ads.sub-service';

/**
 * PremiumService acts as a Facade orchestrating premium sub-services:
 * - PremiumPackageSubService: Package tier administration and subscription activation
 * - DailyAdsSubService: Watch-to-earn daily limits, ad tracking, and reward disbursements
 */
@Injectable()
export class PremiumService {
  constructor(
    private readonly packageSubService: PremiumPackageSubService,
    private readonly dailyAdsSubService: DailyAdsSubService,
  ) {}

  // ==========================================
  // PACKAGE TIERS & SUBSCRIPTIONS
  // ==========================================
  async getActivePackages() {
    return this.packageSubService.getActivePackages();
  }

  async getAllPackages() {
    return this.packageSubService.getAllPackages();
  }

  async createPackage(data: {
    title: string;
    description?: string;
    original_price?: number;
    discount_percent?: number;
    price: number;
    daily_ads_count: number;
    daily_reward_amount: number;
    duration_days?: number;
    direct_referral_commission?: number;
  }) {
    return this.packageSubService.createPackage(data);
  }

  async updatePackage(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      original_price: number;
      discount_percent: number;
      price: number;
      daily_ads_count: number;
      daily_reward_amount: number;
      duration_days: number;
      is_active: boolean;
      direct_referral_commission: number;
    }>,
  ) {
    return this.packageSubService.updatePackage(id, data);
  }

  async deletePackage(id: string) {
    return this.packageSubService.deletePackage(id);
  }

  async subscribePackage(userId: string, packageId: string, referrerCode?: string) {
    return this.packageSubService.subscribePackage(userId, packageId, referrerCode);
  }

  async getPremiumUsers(search?: string) {
    return this.packageSubService.getPremiumUsers(search);
  }

  // ==========================================
  // DAILY WATCH-TO-EARN ADS
  // ==========================================
  async getDailyTask(userId: string) {
    return this.dailyAdsSubService.getDailyTask(userId);
  }

  async recordAdWatched(userId: string) {
    return this.dailyAdsSubService.recordAdWatched(userId);
  }

  async claimDailyReward(userId: string) {
    return this.dailyAdsSubService.claimDailyReward(userId);
  }

  // ==========================================
  // USER & ADMIN ADS ANALYTICS
  // ==========================================
  async getAdsAnalytics(timeframe?: string) {
    return this.dailyAdsSubService.getAdsAnalytics(timeframe);
  }

  async getUserAdsAnalytics(userId: string, timeframe?: string) {
    return this.dailyAdsSubService.getAdsAnalytics(timeframe, userId);
  }
}

