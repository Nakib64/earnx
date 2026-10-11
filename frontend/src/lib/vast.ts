/**
 * VAST (Video Ad Serving Template) Parser & Tracker
 * 
 * Supports VAST 2.0 / 3.0 / 4.0 XML feeds from networks like Adsterra.
 * Extracts video media files, skip offsets, click-through URLs, and tracking beacons.
 */

export interface VastAdData {
  mediaFileUrl: string;
  skipOffsetSeconds: number;
  clickThroughUrl?: string;
  impressionUrls: string[];
  trackingEvents: {
    start?: string[];
    firstQuartile?: string[];
    midpoint?: string[];
    thirdQuartile?: string[];
    complete?: string[];
    skip?: string[];
  };
}

export const DEFAULT_SAMPLE_VIDEO_URL =
  'https://raw.githubusercontent.com/bower-media-samples/big-buck-bunny-1080p-30s/master/video.mp4';

/**
 * Parses time strings like "00:00:15" or percentages like "20%" into seconds (clamped to 15-30s)
 */
function parseOffsetToSeconds(offsetStr: string | null, defaultSeconds = 15): number {
  if (!offsetStr) return defaultSeconds;

  let parsed = defaultSeconds;

  // Handle HH:MM:SS format
  if (offsetStr.includes(':')) {
    const parts = offsetStr.split(':').map((p) => parseFloat(p) || 0);
    if (parts.length === 3) {
      parsed = Math.round(parts[0] * 3600 + parts[1] * 60 + parts[2]);
    }
  } else {
    // Handle plain numbers
    const num = parseFloat(offsetStr);
    if (!isNaN(num) && num > 0) {
      parsed = Math.round(num);
    }
  }

  // Ensure minimum 15s and maximum 30s view time
  return Math.max(15, Math.min(30, parsed));
}

/**
 * Fires tracking pixel beacon silently in the background
 */
export function fireTrackingBeacons(urls?: string[]): void {
  if (!urls || !Array.isArray(urls)) return;
  urls.forEach((url) => {
    if (!url || typeof url !== 'string') return;
    try {
      const img = new Image();
      img.src = url.trim();
    } catch {
      // Beacon fire error handled silently
    }
  });
}

/**
 * Fetches and parses an Adsterra VAST XML tag URL into playable ad data
 */
export async function fetchAndParseVast(
  vastTagUrl: string,
  maxRedirects = 3,
): Promise<VastAdData | null> {
  if (!vastTagUrl || typeof vastTagUrl !== 'string') {
    return null;
  }

  try {
    const response = await fetch(vastTagUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/xml, text/xml, */*',
      },
    });

    if (!response.ok) {
      console.warn(`[VAST] HTTP error ${response.status} fetching VAST tag`);
      return null;
    }

    const xmlText = await response.text();
    if (!xmlText || !xmlText.includes('<VAST')) {
      console.warn('[VAST] Response is not valid VAST XML');
      return null;
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // 1. Extract MediaFiles (prefer MP4)
    const mediaFiles = xmlDoc.getElementsByTagName('MediaFile');
    let chosenMediaUrl = '';

    for (let i = 0; i < mediaFiles.length; i++) {
      const node = mediaFiles[i];
      const type = (node.getAttribute('type') || '').toLowerCase();
      const content = (node.textContent || '').trim();

      if (content && (type.includes('mp4') || content.endsWith('.mp4'))) {
        chosenMediaUrl = content;
        break;
      }
    }

    if (!chosenMediaUrl && mediaFiles.length > 0) {
      chosenMediaUrl = (mediaFiles[0].textContent || '').trim();
    }

    // 1b. Check for VAST Wrapper (VASTAdTagURI) if no media file found directly
    if (!chosenMediaUrl) {
      const vastAdTagUriEl = xmlDoc.getElementsByTagName('VASTAdTagURI')[0];
      if (vastAdTagUriEl && maxRedirects > 0) {
        const wrappedUrl = (vastAdTagUriEl.textContent || '').trim();
        if (wrappedUrl) {
          const nested = await fetchAndParseVast(wrappedUrl, maxRedirects - 1);
          if (nested) {
            const topImpressionEls = xmlDoc.getElementsByTagName('Impression');
            for (let i = 0; i < topImpressionEls.length; i++) {
              const u = (topImpressionEls[i].textContent || '').trim();
              if (u) nested.impressionUrls.push(u);
            }
            return nested;
          }
        }
      }
      console.warn('[VAST] No media files found in VAST response (No Fill)');
      return null;
    }

    // 2. Extract Skip Offset (default 15s)
    const linear = xmlDoc.getElementsByTagName('Linear')[0];
    const skipOffsetAttr = linear ? linear.getAttribute('skipoffset') : null;
    const skipOffsetSeconds = parseOffsetToSeconds(skipOffsetAttr, 15);

    // 3. Extract ClickThrough
    const clickThroughEl = xmlDoc.getElementsByTagName('ClickThrough')[0];
    const clickThroughUrl = clickThroughEl ? (clickThroughEl.textContent || '').trim() : undefined;

    // 4. Extract Impression Beacons
    const impressionEls = xmlDoc.getElementsByTagName('Impression');
    const impressionUrls: string[] = [];
    for (let i = 0; i < impressionEls.length; i++) {
      const url = (impressionEls[i].textContent || '').trim();
      if (url) impressionUrls.push(url);
    }

    // 5. Extract Tracking Events
    const trackingEls = xmlDoc.getElementsByTagName('Tracking');
    const trackingEvents: VastAdData['trackingEvents'] = {
      start: [],
      firstQuartile: [],
      midpoint: [],
      thirdQuartile: [],
      complete: [],
      skip: [],
    };

    for (let i = 0; i < trackingEls.length; i++) {
      const el = trackingEls[i];
      const event = (el.getAttribute('event') || '') as keyof VastAdData['trackingEvents'];
      const url = (el.textContent || '').trim();
      if (event && trackingEvents[event] && url) {
        trackingEvents[event]!.push(url);
      }
    }

    return {
      mediaFileUrl: chosenMediaUrl,
      skipOffsetSeconds,
      clickThroughUrl,
      impressionUrls,
      trackingEvents,
    };
  } catch (err: any) {
    console.warn(`[VAST] Error parsing VAST feed: ${err?.message}`);
    return null;
  }
}
