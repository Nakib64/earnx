// test-resolver.mjs
async function resolveVastChain(initialUrl, maxDepth = 6) {
  let currentUrl = initialUrl;
  const impressions = [];
  const trackingEvents = { start: [], firstQuartile: [], midpoint: [], thirdQuartile: [], complete: [] };
  let clickThrough = null;
  let mediaFile = null;

  for (let depth = 0; depth < maxDepth; depth++) {
    if (!currentUrl) break;

    // Bypass blocked jkxxx.com domain if parameter vast= exists
    if (currentUrl.includes('jkxxx.com') && currentUrl.includes('vast=')) {
      const match = currentUrl.match(/[?&]vast=([^&]+)/);
      if (match) {
        currentUrl = decodeURIComponent(match[1]);
      }
    }

    console.log(`[Depth ${depth}] Fetching: ${currentUrl.slice(0, 80)}`);

    try {
      const res = await fetch(currentUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/xml, text/xml, */*',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (!res.ok) {
        console.log(`[Depth ${depth}] HTTP Error ${res.status}`);
        break;
      }

      const xml = await res.text();
      if (!xml || xml.trim() === '<VAST/>' || xml.trim() === '<VAST />' || !xml.includes('<VAST')) {
        console.log(`[Depth ${depth}] Empty VAST response (<VAST/>)`);
        break;
      }

      // Collect Impressions
      for (const m of xml.matchAll(/<Impression[^>]*>([\s\S]*?)<\/Impression>/gi)) {
        const url = m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim();
        if (url && !impressions.includes(url)) impressions.push(url);
      }

      // Collect ClickThrough
      const ctMatch = xml.match(/<ClickThrough[^>]*>([\s\S]*?)<\/ClickThrough>/i);
      if (ctMatch && !clickThrough) {
        clickThrough = ctMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim();
      }

      // Collect Tracking Events
      for (const m of xml.matchAll(/<Tracking[^>]*event="([^"]+)"[^>]*>([\s\S]*?)<\/Tracking>/gi)) {
        const evt = m[1];
        const url = m[2].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim();
        if (url && trackingEvents[evt]) trackingEvents[evt].push(url);
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
          console.log(`[Depth ${depth}] Skipping VPAID JS:`, url.slice(0, 60));
          continue;
        }

        // Accept mp4 or webm
        if (attrs.includes('mp4') || attrs.includes('webm') || url.includes('.mp4') || url.includes('.webm')) {
          mediaFile = url;
          console.log(`[Depth ${depth}] ✅ Found playable video:`, mediaFile);
          break;
        }
      }

      if (mediaFile) break;

      // Follow Wrapper
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
    } catch (err) {
      console.log(`[Depth ${depth}] Error:`, err.message);
      break;
    }
  }

  return {
    hasAd: !!mediaFile,
    mediaFile,
    impressions,
    clickThrough,
    trackingEvents,
  };
}

const SPOT_URL = 'https://crookedagreement.com/d.maFyzUdtGYNpvCZZGNUK/leOm/9zuKZ_Uelgk/PRTRcZ1LMqTgACy/N/z_clt-NazZU/xiMtD/IF4pMNQQ';
console.log('Resolving spot:', SPOT_URL);
resolveVastChain(SPOT_URL).then((result) => {
  console.log('\n=== RESULT ===');
  console.log('hasAd:', result.hasAd);
  console.log('mediaFile:', result.mediaFile);
  console.log('impressions count:', result.impressions.length);
});
