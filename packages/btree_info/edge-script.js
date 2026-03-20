/**
 * Bunny Edge Script for www.btree.at
 *
 * Deploy via: Bunny Dashboard → CDN → Pull Zone → Edge Scripting
 *
 * Handles redirects that can't be expressed as simple Bunny Edge Rules
 * (pattern matching with capture groups). Everything else — HTTPS, www,
 * HSTS, cache headers, CORS — is configured in the pull zone settings.
 */

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const { pathname } = url;

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

  return fetch(request);
}
