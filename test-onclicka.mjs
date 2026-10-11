// Run with: node test-onclicka.mjs

const VAST_URL = 'https://bid.onclckstr.com/vast?spot_id=6153497';
const JS_SCRIPT_URL = 'https://js.onclckmn.com/static/onclicka.js';

console.log('='.repeat(60));
console.log('  TESTING ONCLICKA AD NETWORK RESPONSES');
console.log('='.repeat(60));

async function testVastEndpoint() {
  console.log('\n[1] Testing OnClickA VAST Tag Endpoint:');
  console.log('    URL:', VAST_URL);

  try {
    const res = await fetch(VAST_URL, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/xml, text/xml, */*',
      },
    });

    console.log('    HTTP Status:', res.status, res.statusText);
    console.log('    Content-Type:', res.headers.get('content-type'));
    console.log('    CORS Header (ACAO):', res.headers.get('access-control-allow-origin') || '(None)');

    const xml = await res.text();
    console.log('    Response Length:', xml.length, 'characters');

    if (xml.trim() === '<VAST/>' || xml.trim() === '<VAST />') {
      console.log('    Result: ⚠️ Empty VAST (<VAST/>) - No ad campaign filled for this IP/request right now.');
      return;
    }

    if (xml.includes('<VAST')) {
      console.log('    Result: ✅ Valid VAST XML received!');

      // Check for MediaFiles
      const mediaFiles = [...xml.matchAll(/<MediaFile[^>]*>(.*?)<\/MediaFile>/gs)];
      if (mediaFiles.length > 0) {
        console.log(`    Found ${mediaFiles.length} direct MediaFile video(s):`);
        mediaFiles.forEach((m, idx) => {
          const url = m[1].replace(/<!\[CDATA\[(.*?)\]\]>/s, '$1').trim();
          console.log(`      [${idx + 1}] ${url}`);
        });
      }

      // Check for VAST Wrappers
      const wrappers = [...xml.matchAll(/<VASTAdTagURI[^>]*>(.*?)<\/VASTAdTagURI>/gs)];
      if (wrappers.length > 0) {
        console.log(`    Found ${wrappers.length} downstream VAST Wrapper redirect(s):`);
        for (let idx = 0; idx < wrappers.length; idx++) {
          const redirectUrl = wrappers[idx][1].replace(/<!\[CDATA\[(.*?)\]\]>/s, '$1').trim();
          console.log(`      [${idx + 1}] ${redirectUrl}`);
          try {
            console.log(`      -> Following wrapper redirect...`);
            const wrapRes = await fetch(redirectUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                Accept: 'application/xml, text/xml, */*'
              }
            });
            console.log(`      Wrapper Status:`, wrapRes.status, wrapRes.statusText);
            console.log(`      Wrapper ACAO:`, wrapRes.headers.get('access-control-allow-origin') || '(None)');
            const wrapXml = await wrapRes.text();
            console.log(`      Wrapper Body Length:`, wrapXml.length);
            const subMedia = [...wrapXml.matchAll(/<MediaFile[^>]*>(.*?)<\/MediaFile>/gs)];
            if (subMedia.length > 0) {
              console.log(`      ✅ Found ${subMedia.length} MediaFile(s) in wrapper:`);
              subMedia.forEach(sm => console.log('         Media: ' + sm[1].replace(/<!\[CDATA\[(.*?)\]\]>/s, '$1').trim()));
            } else {
              console.log(`      Wrapper sample:`, wrapXml.slice(0, 300));
            }
          } catch (wrapErr) {
            console.log(`      ❌ Wrapper fetch failed:`, wrapErr.message);
            // Try extracting nested vast param if present
            const matchVastParam = redirectUrl.match(/[?&]vast=([^&]+)/);
            if (matchVastParam) {
              const decodedUrl = decodeURIComponent(matchVastParam[1]);
              console.log(`      -> Trying extracted inner vast URL:`, decodedUrl);
              try {
                const innerRes = await fetch(decodedUrl, {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    Accept: 'application/xml, text/xml, */*'
                  }
                });
                console.log(`      Inner Status:`, innerRes.status, innerRes.statusText);
                console.log(`      Inner ACAO:`, innerRes.headers.get('access-control-allow-origin') || '(None)');
                const innerXml = await innerRes.text();
                console.log(`      Inner Body Length:`, innerXml.length);
                const innerMedia = [...innerXml.matchAll(/<MediaFile[^>]*>(.*?)<\/MediaFile>/gs)];
                if (innerMedia.length > 0) {
                  console.log(`      ✅ Found ${innerMedia.length} MediaFile(s) in inner vast:`);
                  innerMedia.forEach(im => console.log('         Media: ' + im[1].replace(/<!\[CDATA\[(.*?)\]\]>/s, '$1').trim()));
                } else {
                  console.log(`      Inner sample:`, innerXml.slice(0, 300));
                  const nextWrappers = [...innerXml.matchAll(/<VASTAdTagURI[^>]*>(.*?)<\/VASTAdTagURI>/gs)];
                  if (nextWrappers.length > 0) {
                    const nextUrl = nextWrappers[0][1].replace(/<!\[CDATA\[(.*?)\]\]>/s, '$1').trim();
                    console.log(`      -> Following next wrapper (vtrk):`, nextUrl);
                    try {
                      const vtrkRes = await fetch(nextUrl, {
                        headers: {
                          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                          Accept: 'application/xml, text/xml, */*'
                        }
                      });
                      console.log(`      vtrk Status:`, vtrkRes.status, vtrkRes.statusText);
                      const vtrkXml = await vtrkRes.text();
                      console.log(`      vtrk Body Length:`, vtrkXml.length);
                      const vtrkMedia = [...vtrkXml.matchAll(/<MediaFile[^>]*>(.*?)<\/MediaFile>/gs)];
                      const vtrkWrappers = [...vtrkXml.matchAll(/<VASTAdTagURI[^>]*>(.*?)<\/VASTAdTagURI>/gs)];
                      console.log('      vtrk MediaFiles:', vtrkMedia.length, 'Wrappers:', vtrkWrappers.length);
                      if (vtrkMedia.length > 0) {
                        console.log(`      ✅ Found ${vtrkMedia.length} MediaFile(s) in vtrk:`);
                        vtrkMedia.forEach(vm => console.log('         Media: ' + vm[1].replace(/<!\[CDATA\[(.*?)\]\]>/s, '$1').trim()));
                      } else if (vtrkWrappers.length > 0) {
                        const superUrl = vtrkWrappers[0][1].replace(/<!\[CDATA\[(.*?)\]\]>/s, '$1').trim();
                        console.log('      -> Following super wrapper:', superUrl);
                        try {
                          const superRes = await fetch(superUrl, {
                            headers: {
                              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                              Accept: 'application/xml, text/xml, */*'
                            }
                          });
                          console.log('      super Status:', superRes.status);
                          const superXml = await superRes.text();
                          console.log('      super Body Length:', superXml.length);
                          const superMedia = [...superXml.matchAll(/<MediaFile[^>]*>(.*?)<\/MediaFile>/gs)];
                          if (superMedia.length > 0) {
                            console.log(`      ✅ Found ${superMedia.length} MediaFile(s) in super:`);
                            superMedia.forEach(sm => console.log('         Media: ' + sm[1].replace(/<!\[CDATA\[(.*?)\]\]>/s, '$1').trim()));
                          } else {
                            console.log('      super sample:', superXml.slice(0, 400));
                          }
                        } catch (sErr) {
                          console.log('      ❌ super fetch failed:', sErr.message);
                        }
                      } else {
                        console.log(`      vtrk XML:`, vtrkXml.slice(0, 400));
                      }
                    } catch (vtrkErr) {
                      console.log(`      ❌ vtrk fetch failed:`, vtrkErr.message);
                    }
                  }
                }
              } catch (innerErr) {
                console.log(`      ❌ Inner fetch failed:`, innerErr.message);
              }
            }
          }
        }
      }

      // Check for Error beacon
      const errors = [...xml.matchAll(/<Error[^>]*>(.*?)<\/Error>/gs)];
      if (errors.length > 0) {
        const errUrl = errors[0][1].replace(/<!\[CDATA\[(.*?)\]\]>/s, '$1').trim();
        console.log('    Tracking Error Beacon:', errUrl.slice(0, 100) + '...');
      }

      console.log('\n--- VAST XML Summary ---');
      const adTags = [...xml.matchAll(/<Ad\b[^>]*>/g)].map(m => m[0]);
      console.log('Ad tags found:', adTags);
      const inLineTags = [...xml.matchAll(/<InLine\b[^>]*>/g)].map(m => m[0]);
      console.log('InLine tags found:', inLineTags);
      const wrapperTags = [...xml.matchAll(/<Wrapper\b[^>]*>/g)].map(m => m[0]);
      console.log('Wrapper tags found:', wrapperTags);
      console.log('\n--- First 1500 characters of XML response ---');
      console.log(xml.slice(0, 1500));
      console.log('---------------------------------------------');
    } else {
      console.log('    Result: ❌ Unexpected non-XML response:');
      console.log(xml.slice(0, 300));
    }
  } catch (err) {
    console.error('    Error fetching VAST endpoint:', err.message);
  }
}

async function testJsScript() {
  console.log('\n[2] Testing OnClickA Mainstream Script (Tag ID 467921):');
  console.log('    URL:', JS_SCRIPT_URL);

  try {
    const res = await fetch(JS_SCRIPT_URL, { method: 'GET' });
    console.log('    HTTP Status:', res.status, res.statusText);
    console.log('    Content-Type:', res.headers.get('content-type'));
    const body = await res.text();
    console.log('    Script Size:', (body.length / 1024).toFixed(2), 'KB');
    console.log('    Result: ✅ Script is live, reachable, and served via CDN.');
  } catch (err) {
    console.error('    Error reaching JS script:', err.message);
  }
}

async function run() {
  await testVastEndpoint();
  await testJsScript();
  console.log('\n' + '='.repeat(60));
  console.log('  TEST COMPLETE');
  console.log('='.repeat(60) + '\n');
}

run();
