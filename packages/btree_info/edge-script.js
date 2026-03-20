/**
 * Bunny Edge Script for www.btree.at
 *
 * Deploy via: Bunny Dashboard → CDN → Pull Zone → Edge Scripting
 * Replaces the legacy Apache .htaccess.
 *
 * Handles:
 *  - HTTP → HTTPS redirect
 *  - Non-www → www redirect
 *  - /app/* → app.btree.at
 *  - /en/* → / (Astro i18n: English is the default locale, no prefix)
 *  - HSTS header
 *  - Cache-Control per file type
 *  - CORS for fonts / CSS / JSON
 */

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const { hostname, pathname } = url;

  // ── Force HTTPS ──────────────────────────────────────────────────────────
  if (url.protocol === 'http:') {
    url.protocol = 'https:';
    return Response.redirect(url.toString(), 301);
  }

  // ── Force www ─────────────────────────────────────────────────────────────
  if (hostname === 'btree.at') {
    url.hostname = 'www.btree.at';
    return Response.redirect(url.toString(), 301);
  }

  // ── /app/detail/* → https://app.btree.at/detail/* ────────────────────────
  const appDetailMatch = pathname.match(/^\/app\/detail\/(.*)$/);
  if (appDetailMatch) {
    return Response.redirect(`https://app.btree.at/detail/${appDetailMatch[1]}`, 301);
  }

  // ── /app/* → https://app.btree.at/ ───────────────────────────────────────
  if (pathname === '/app' || pathname.startsWith('/app/')) {
    return Response.redirect('https://app.btree.at/', 301);
  }

  // ── /en/* → /* (default locale has no prefix) ────────────────────────────
  const enMatch = pathname.match(/^\/en(\/.*)?$/);
  if (enMatch) {
    const rest = enMatch[1] || '/';
    return Response.redirect(`https://www.btree.at${rest}`, 301);
  }

  // ── Forward to origin ─────────────────────────────────────────────────────
  const originResponse = await fetch(request);
  const response = new Response(originResponse.body, originResponse);
  const headers = response.headers;

  // HSTS
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Derive extension for header rules
  const ext = pathname.split('.').pop()?.toLowerCase() ?? '';

  // CORS — fonts, CSS, JSON
  if (['ttf', 'ttc', 'otf', 'eot', 'woff', 'woff2', 'css', 'json'].includes(ext)) {
    headers.set('Access-Control-Allow-Origin', '*');
  }

  // Cache-Control
  if (['ttf', 'ttc', 'otf', 'eot', 'woff', 'woff2', 'ico',
       'jpg', 'jpeg', 'gif', 'png', 'webp', 'pdf', 'mp3', 'mp4'].includes(ext)) {
    // Immutable assets (hashed filenames from Astro build)
    headers.set('Cache-Control', 'max-age=31536000, immutable');
  } else if (['js', 'css'].includes(ext)) {
    headers.set('Cache-Control', 'max-age=2628000, must-revalidate');
  } else if (['html', 'htm', 'xml', 'txt', 'xsl'].includes(ext)) {
    headers.set('Cache-Control', 'max-age=86400, must-revalidate');
  }

  return response;
}
