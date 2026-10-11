import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SystemConfigService } from '../system-config/system-config.service';
import { DailyAdsSubService } from '../premium/sub-services/daily-ads.sub-service';
import { createHmac } from 'crypto';

/**
 * MonetagService handles Server-to-Server (S2S) Postback verification from Monetag.
 *
 * Flow:
 * 1. Frontend launches Monetag Rewarded Interstitial with user's unique token.
 * 2. Monetag serves the ad and controls the countdown timer itself.
 * 3. After confirmed full view, Monetag's servers call our postback URL:
 *    GET /api/ads/monetag-postback?uid={user_id}&token={HMAC_signature}
 * 4. We verify the HMAC signature using our shared secret, then credit the reward.
 *
 * Config keys in SystemConfig table:
 *   MONETAG_ZONE_ID       — Your Monetag zone/campaign ID
 *   MONETAG_POSTBACK_SECRET — Shared secret for HMAC verification
 */
@Injectable()
export class MonetagService {
  private readonly logger = new Logger(MonetagService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly systemConfig: SystemConfigService,
    private readonly dailyAdsSubService: DailyAdsSubService,
  ) {}

  /**
   * Generates a secure HMAC token to pass to Monetag as the user identifier.
   * This lets us verify on postback that Monetag actually triggered the callback.
   * Format: HMAC-SHA256(userId + ":" + todayDate, MONETAG_POSTBACK_SECRET)
   */
  async generateUserToken(userId: string): Promise<{ token: string; zoneId: string }> {
    const secret = await this.systemConfig.getValue(
      'MONETAG_POSTBACK_SECRET',
      process.env.MONETAG_POSTBACK_SECRET || 'earnx-monetag-placeholder-secret',
    );
    const zoneId = await this.systemConfig.getValue(
      'MONETAG_ZONE_ID',
      process.env.MONETAG_ZONE_ID || 'REPLACE_WITH_YOUR_ZONE_ID',
    );

    // Include today's date so tokens expire daily (prevents replay attacks)
    const today = new Date().toISOString().split('T')[0];
    const payload = `${userId}:${today}`;
    const token = createHmac('sha256', secret).update(payload).digest('hex');

    return { token, zoneId };
  }

  /**
   * Verifies the Monetag S2S postback and credits the user's wallet.
   * Called by Monetag's servers (not the user's browser).
   *
   * Monetag will call: GET /api/ads/monetag-postback?uid={userId}&token={token}
   * We return "OK" on success (required by Monetag) or throw on failure.
   */
  async handlePostback(userId: string, incomingToken: string): Promise<string> {
    // 1. Verify HMAC signature
    const secret = await this.systemConfig.getValue('MONETAG_POSTBACK_SECRET', 'earnx-monetag-placeholder-secret');
    const today = new Date().toISOString().split('T')[0];
    const payload = `${userId}:${today}`;
    const expectedToken = createHmac('sha256', secret).update(payload).digest('hex');

    if (expectedToken !== incomingToken) {
      this.logger.warn(`Invalid Monetag postback token for user ${userId}`);
      throw new BadRequestException('Invalid postback token');
    }

    // 2. Verify user exists and is premium
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { premium_package: true },
    });

    if (!user) {
      this.logger.warn(`Monetag postback: user ${userId} not found`);
      throw new BadRequestException('User not found');
    }

    if (!user.is_premium || !user.premium_package) {
      this.logger.warn(`Monetag postback: user ${userId} is not premium`);
      throw new BadRequestException('User is not a premium member');
    }

    // 3. Credit the reward (delegates to existing DailyAdsSubService)
    try {
      const result = await this.dailyAdsSubService.recordAdWatched(userId);
      this.logger.log(`Monetag S2S postback: credited ৳${result.reward_per_ad} to user ${userId} (ad ${result.ads_watched}/${result.daily_ads_required})`);
    } catch (err: any) {
      // Quota reached or other business logic errors — still return OK to Monetag
      // so they don't retry, but log the event
      this.logger.warn(`Monetag postback handled (non-credit): ${err.message}`);
      return 'OK';
    }

    // Monetag expects plain text "OK" response on success
    return 'OK';
  }
}
