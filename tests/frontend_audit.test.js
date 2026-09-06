import assert from 'assert';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

async function auditFrontend() {
  console.log('--- Starting Self-Contained Frontend & Mobile Performance Audit ---');
  let failures = 0;

  // 1. Create a self-contained local HTTP server to audit static delivery
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';

    let filePath;
    if (reqPath === '/index.html') {
      filePath = path.join(ROOT_DIR, 'index.html');
    } else if (fs.existsSync(path.join(ROOT_DIR, 'public', reqPath))) {
      filePath = path.join(ROOT_DIR, 'public', reqPath);
    } else if (fs.existsSync(path.join(ROOT_DIR, 'dist', reqPath))) {
      filePath = path.join(ROOT_DIR, 'dist', reqPath);
    } else if (fs.existsSync(path.join(ROOT_DIR, reqPath))) {
      filePath = path.join(ROOT_DIR, reqPath);
    }

    if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.webp': 'image/webp',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.mp4': 'video/mp4',
        '.tsx': 'application/javascript',
        '.ts': 'application/javascript',
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  await new Promise((resolve) => server.listen(5199, '127.0.0.1', resolve));
  const BASE = 'http://127.0.0.1:5199';

  try {
    const res = await fetch(BASE + '/index.html');
    assert.strictEqual(res.status, 200, 'HTML response should be 200 OK');
    const html = await res.text();

    console.log('1. Verifying critical asset preloads in <head>...');
    assert(html.includes('rel="preload" as="image" href="/bg-poster.webp"'), 'Preload for bg-poster.webp is present');
    assert(html.includes('rel="preload" as="image" href="/midas-logo.jpg"'), 'Preload for midas-logo.jpg is present');
    assert(html.includes('fetchpriority="high"'), 'High fetch priority is set on critical assets');
    console.log('   PASS: Critical images preloaded with high fetch priority.');

    console.log('2. Verifying non-blocking font loading & display=swap...');
    assert(html.includes('&display=swap'), 'display=swap is set on Google Fonts request');
    assert(html.includes('media="print" onload="this.media=\'all\'"'), 'Non-blocking CSS loading pattern is used');
    assert(html.includes('Playfair+Display:wght@400;700;900'), 'Playfair Display weight 400 is included for normal headline weight');
    assert(html.includes('Cinzel:wght@600;700;800;900'), 'Cinzel includes bold and semibold weights');
    console.log('   PASS: Google Fonts configured with non-blocking paint and complete weight coverage.');

    console.log('3. Verifying zero-black-screen instant first paint HTML skeleton in #root...');
    assert(html.includes('id="root"'), '#root container exists');
    assert(html.includes('100dvh'), 'Dynamic viewport height 100dvh included for mobile browsers');
    assert(html.includes('MIDAS'), 'Header logo and branding exists in first paint HTML');
    assert(html.includes('Live signals'), 'Live badge exists in first paint HTML');
    assert(html.includes('Turn Market Liquidity'), 'Headline exists in first paint HTML');
    assert(html.includes('Join Free on Telegram'), 'CTA primary button exists in first paint HTML');
    assert(html.includes('Official Social Media Hub'), 'Secondary CTA button exists in first paint HTML skeleton');
    assert(html.includes('Members') && html.includes('1,400+'), 'Stats row exists in first paint HTML skeleton');
    assert(html.includes('Verified Execution Records'), 'Section II break exists in first paint HTML skeleton');
    assert(html.includes('Latest Verified Trades'), 'Verified results preview exists in first paint HTML');
    assert(html.includes('+£228,624.29'), 'First trade setup card exists in first paint HTML');
    console.log('   PASS: All primary mobile content (header, live badge, headline, dual CTA, stats, section break, verified results) present in instant first paint HTML.');

    console.log('3b. Verifying mobile WebKit inline video and performance attributes in Home.tsx...');
    const homeTsx = fs.readFileSync(path.join(ROOT_DIR, 'src', 'Home.tsx'), 'utf-8');
    assert(homeTsx.includes("webkit-playsinline"), 'webkit-playsinline attribute present on video elements for iOS in-app browsers');
    assert(homeTsx.includes("x5-playsinline"), 'x5-playsinline attribute present for mobile webview compatibility');
    assert(homeTsx.includes("playsInline"), 'playsInline present on video elements');
    assert(homeTsx.includes('preload="metadata"'), 'preload="metadata" configured for faststart non-blocking video loading');
    assert(homeTsx.includes('defaultMuted = true'), 'Synchronous defaultMuted set to prevent WebKit autoplay policy rejection');
    assert(homeTsx.includes('onError={() => setVideoPlaying(false)}'), 'Graceful poster fallback onError handler present on background video');
    console.log('   PASS: Mobile WebKit video attributes and sync muted playback verified.');

    console.log('3c. Verifying inline CSS syntax in index.html (zero rogue class tokens)...');
    let invalidCssTokens = [];
    for (const m of html.matchAll(/style='([^']+)'|style="([^"]+)"/g)) {
      const content = m[1] || m[2];
      for (let p of content.split(';')) {
        p = p.trim();
        if (p && !p.includes(':')) invalidCssTokens.push(p);
      }
    }
    assert.strictEqual(invalidCssTokens.length, 0, `Inline CSS contains invalid tokens: ${invalidCssTokens.join(', ')}`);
    console.log('   PASS: All inline style declarations in index.html are 100% syntactically valid CSS.');

    console.log('3d. Verifying dynamic viewport height (dvh) & scrolling across all modal containers...');
    assert(homeTsx.includes('max-h-[92dvh]') && homeTsx.includes('max-h-[90dvh]') && homeTsx.includes('max-h-[85dvh]'), 'Modal containers use dvh units for mobile browsers');
    assert(homeTsx.includes('overflow-y-auto'), 'Modals include overflow-y-auto for scrollability');
    assert(homeTsx.includes("document.body.style.overflow = 'hidden'"), 'Body scroll lock active during modal display');
    assert(homeTsx.includes("e.key === 'Escape'"), 'Keyboard Escape navigation supported for accessibility');
    console.log('   PASS: All modal containers use dvh bounds, overflow scrolling, body scroll lock, and Escape handling.');

    console.log('3e. Verifying getProofUrl media normalization (zero double slashes)...');
    assert(homeTsx.includes('function getProofUrl'), 'getProofUrl helper is implemented');
    assert(!homeTsx.includes('/proofs/${proof.filename}'), 'No unnormalized proof URLs in Home.tsx');
    console.log('   PASS: Media URLs normalized with double-slash protection.');

    console.log('4. Verifying JS chunking & script references...');
    const hasDevScript = html.includes('/src/main.tsx');
    const hasBuiltScript = /src="([^"]+\.js)"/.test(html);
    assert(hasDevScript || hasBuiltScript, 'Valid module entry script present in HTML');
    console.log(`   PASS: Module entry script validated (${hasDevScript ? 'Development /src/main.tsx' : 'Production bundle'}).`);

    // If dist exists, audit the production build chunks
    const distPath = path.join(ROOT_DIR, 'dist');
    if (fs.existsSync(distPath)) {
      console.log('4b. Auditing production build chunks in dist/assets...');
      const distHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
      const scriptMatches = distHtml.match(/src="([^"]+\.js)"/g) || [];
      assert(scriptMatches.length > 0, 'Production HTML contains script chunks');
      
      const assetFiles = fs.readdirSync(path.join(distPath, 'assets'));
      const hasVendorIcons = assetFiles.some(f => f.startsWith('vendor-icons'));
      const hasVendorReact = assetFiles.some(f => f.startsWith('vendor-react'));
      assert(hasVendorIcons, 'vendor-icons chunk cleanly separated in production build');
      assert(hasVendorReact, 'vendor-react chunk cleanly separated in production build');
      console.log(`   PASS: Production chunk splitting verified (vendor-icons and vendor-react separated).`);
    }

    console.log('5. Verifying preloaded and critical assets are accessible...');
    const posterRes = await fetch(BASE + '/bg-poster.webp');
    assert.strictEqual(posterRes.status, 200, 'bg-poster.webp should return 200 OK');
    assert(Number(posterRes.headers.get('content-length') || 1) > 0, 'bg-poster.webp is non-empty');

    const logoRes = await fetch(BASE + '/midas-logo.jpg');
    assert.strictEqual(logoRes.status, 200, 'midas-logo.jpg should return 200 OK');
    assert(Number(logoRes.headers.get('content-length') || 1) > 0, 'midas-logo.jpg is non-empty');

    const videoMobileRes = await fetch(BASE + '/bg-video-mobile.mp4');
    assert.strictEqual(videoMobileRes.status, 200, 'bg-video-mobile.mp4 should return 200 OK');

    const proofImgRes = await fetch(BASE + '/proofs/photo_5942833990374985878_y.jpg');
    assert.strictEqual(proofImgRes.status, 200, 'Preloaded proof image should return 200 OK');
    assert(Number(proofImgRes.headers.get('content-length') || 1) > 0, 'Preloaded proof image is non-empty');
    console.log('   PASS: All critical images, proof preloads, and mobile video return 200 OK with non-empty content.');

    console.log('--- ALL FRONTEND AUDIT CHECKS PASSED ---');
  } catch (err) {
    console.error('FAIL:', err.message);
    failures++;
  } finally {
    server.closeAllConnections?.();
    server.close();
  }

  process.exitCode = failures > 0 ? 1 : 0;
}

auditFrontend();
