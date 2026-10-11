import { Controller, Get, UseGuards } from '@nestjs/common';
import { SystemConfigService } from '../system-config/system-config.service';
import { UserJwtGuard } from '../user-auth/guards/user-jwt.guard';

@Controller('ads')
export class AdsController {
  constructor(private readonly systemConfig: SystemConfigService) {}

  /**
   * Returns current VAST Video ad configuration (OnClickA / VAST networks)
   * GET /api/ads/vast-config (and alias /api/ads/adsterra-config)
   */
  @UseGuards(UserJwtGuard)
  @Get('vast-config')
  async getVastConfig() {
    const rawTagUrl =
      process.env.HILLTOPADS_VAST_TAG_URL ||
      process.env.VAST_TAG_URL ||
      process.env.ONCLICKA_VAST_TAG_URL ||
      process.env.ADSTERRA_VAST_TAG_URL ||
      '';
    const vastTagUrl = await this.systemConfig.getValue(
      'VAST_TAG_URL',
      rawTagUrl,
    );
    const configuredSkip = parseInt(
      (await this.systemConfig.getValue(
        'VAST_SKIP_OFFSET_SECONDS',
        process.env.VAST_SKIP_OFFSET_SECONDS ||
          process.env.ADSTERRA_SKIP_OFFSET_SECONDS ||
          '15',
      )) || '15',
      10,
    );
    const skipOffset = Math.max(15, Math.min(30, Number.isFinite(configuredSkip) ? configuredSkip : 15));
    return {
      success: true,
      data: {
        vast_tag_url: vastTagUrl,
        skip_offset_seconds: skipOffset,
        min_view_seconds: 15,
        max_view_seconds: 30,
        network: 'HilltopAds / VAST Video',
      },
    };
  }

  @UseGuards(UserJwtGuard)
  @Get('adsterra-config')
  async getAdsterraConfig() {
    return this.getVastConfig();
  }

  /**
   * Resolves the active VAST feed server-side into a playable video,
   * bypassing ISP domain blocks and extracting direct MP4 media files and impression beacons.
   * GET /api/ads/resolve-vast
   */
  @Get('resolve-vast')
  async resolveVast() {
    const rawTagUrl =
      process.env.HILLTOPADS_VAST_TAG_URL ||
      process.env.VAST_TAG_URL ||
      process.env.ONCLICKA_VAST_TAG_URL ||
      process.env.ADSTERRA_VAST_TAG_URL ||
      '';
    const vastTagUrl = await this.systemConfig.getValue(
      'VAST_TAG_URL',
      rawTagUrl,
    );

    if (!vastTagUrl) {
      return {
        success: true,
        hasAd: false,
        message: 'No VAST ad network configured.',
      };
    }

    let currentUrl = vastTagUrl;
    const impressions: string[] = [];
    const trackingEvents: Record<string, string[]> = {
      start: [],
      firstQuartile: [],
      midpoint: [],
      thirdQuartile: [],
      complete: [],
      skip: [],
    };
    let clickThrough: string | null = null;
    let mediaFile: string | null = null;

    const maxDepth = 6;
    for (let depth = 0; depth < maxDepth; depth++) {
      if (!currentUrl) break;

      // Strictly block adult/18+ ad networks and adult categories
      const isAdultAd =
        currentUrl.toLowerCase().includes('jkxxx') ||
        currentUrl.toLowerCase().includes('tsyndicate') ||
        currentUrl.toLowerCase().includes('category=adult') ||
        currentUrl.toLowerCase().includes('traffic_category=adult');

      if (isAdultAd) {
        // Discard adult branch - strictly do not show 18+ ads to users
        break;
      }

      try {
        const res = await fetch(currentUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'application/xml, text/xml, */*',
          },
          signal: AbortSignal.timeout(6000),
        });

        if (!res.ok) break;

        const xml = await res.text();
        if (
          !xml ||
          xml.trim() === '<VAST/>' ||
          xml.trim() === '<VAST />' ||
          !xml.includes('<VAST')
        ) {
          break;
        }

        // Check if XML body flags adult content
        const lowerXml = xml.toLowerCase();
        if (
          lowerXml.includes('category=adult') ||
          lowerXml.includes('traffic_category="adult"') ||
          lowerXml.includes('traffic_category=adult') ||
          lowerXml.includes('jkxxx.com') ||
          lowerXml.includes('tsyndicate.com')
        ) {
          // Reject adult VAST feed
          break;
        }

        // Collect Impression beacons
        for (const m of xml.matchAll(/<Impression[^>]*>([\s\S]*?)<\/Impression>/gi)) {
          const u = m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim();
          if (u && !impressions.includes(u)) impressions.push(u);
        }

        // Collect ClickThrough URL
        const ctMatch = xml.match(/<ClickThrough[^>]*>([\s\S]*?)<\/ClickThrough>/i);
        if (ctMatch && !clickThrough) {
          clickThrough = ctMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim();
        }

        // Collect Tracking events
        for (const m of xml.matchAll(/<Tracking[^>]*event="([^"]+)"[^>]*>([\s\S]*?)<\/Tracking>/gi)) {
          const evt = m[1];
          const u = m[2].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim();
          if (u && trackingEvents[evt] && !trackingEvents[evt].includes(u)) {
            trackingEvents[evt].push(u);
          }
        }

        // Check for MediaFiles (strictly real playable video, NOT vpaid / javascript)
        const mediaMatches = [...xml.matchAll(/<MediaFile([^>]*)>([\s\S]*?)<\/MediaFile>/gi)];
        for (const m of mediaMatches) {
          const attrs = m[1].toLowerCase();
          let content = m[2].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim();
          // Extract clean http URL from content
          const urlMatch = content.match(/https?:\/\/[^\s<>"']+/i);
          if (!urlMatch) continue;
          const url = urlMatch[0];

          // Skip VPAID / javascript
          if (attrs.includes('vpaid') || attrs.includes('javascript') || url.endsWith('.js')) {
            continue;
          }

          // Accept mp4 or webm
          if (attrs.includes('mp4') || attrs.includes('webm') || url.includes('.mp4') || url.includes('.webm')) {
            mediaFile = url;
            break;
          }
        }

        if (mediaFile) break;

        // Follow downstream wrapper
        const wrapperMatch = xml.match(/<VASTAdTagURI[^>]*>([\s\S]*?)<\/VASTAdTagURI>/i);
        if (wrapperMatch) {
          let nextUrl = wrapperMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim();
          if (nextUrl.includes('jkxxx.com') && nextUrl.includes('vast=')) {
            const match = nextUrl.match(/[?&]vast=([^&]+)/);
            if (match) nextUrl = decodeURIComponent(match[1]);
          }
          currentUrl = nextUrl;
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    if (!mediaFile) {
      return {
        success: true,
        hasAd: false,
        message: 'No active video ads available at this moment.',
      };
    }

    return {
      success: true,
      hasAd: true,
      data: {
        mediaUrl: mediaFile,
        skipOffsetSeconds: 15,
        impressionUrls: impressions,
        clickThroughUrl: clickThrough,
        trackingEvents,
        network: 'OnClickA VAST Video',
      },
    };
  }
}
