/**
 * Bunny Middleware Script for www.btree.at
 *
 * Handles redirects that require pattern matching with capture groups —
 * not possible with simple Bunny Edge Rules. It also sets the Content-Type
 * of Markdown copies and the API catalog, and the discovery Link header of
 * the home page. Everything else (HTTPS, www,
 * HSTS, cache headers, CORS) is configured in the pull zone settings.
 *
 * Linked to the pull zone via MiddlewareScriptId (ID: 68801).
 */

import * as BunnySDK from 'https://esm.sh/@bunny.net/edgescript-sdk@0.11.2';

async function onOriginRequest(context: {
  request: Request;
}): Promise<Response> | Response | Promise<Request> | Request | void {
  const url = new URL(context.request.url);
  const { pathname } = url;
  url.protocol = 'https:';
  url.hostname = 'www.btree.at';
  url.port = '';

  // ── Legacy WordPress home URL → canonical home URL ──────────────────────
  if (url.searchParams.get('page_id') === '277') {
    url.searchParams.delete('page_id');
    return Response.redirect(url.toString(), 301);
  }

  // ── /app/detail/* → https://app.btree.at/detail/* ────────────────────────
  const appDetailMatch = pathname.match(/^\/app\/detail\/(.*)$/);
  if (appDetailMatch) {
    return Response.redirect(
      `https://app.btree.at/detail/${appDetailMatch[1]}`,
      301,
    );
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

  // ── Extensionless pages → trailing-slash canonical URLs ─────────────────
  if (!pathname.endsWith('/') && !pathname.includes('.')) {
    url.pathname = `${pathname}/`;
    return Response.redirect(url.toString(), 301);
  }

  // Pass all other requests through to origin
  return context.request;
}

// Link header of the home page (RFC 8288), for agent discovery.
const HOME_LINK_HEADER = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</.well-known/ai-catalog.json>; rel="ai-catalog"',
  '</doc-agent/>; rel="service-doc"',
  '</index.md>; rel="alternate"; type="text/markdown"',
  '</llms.txt>; rel="describedby"; type="text/plain"',
].join(', ');

async function onOriginResponse(context: {
  request: Request;
  response: Response;
}): Promise<Response> {
  const { pathname } = new URL(context.request.url);
  const { response } = context;

  // Bunny Storage serves unknown file types as application/octet-stream.
  let contentType: string | undefined;
  if (pathname.endsWith('.md')) {
    contentType = 'text/markdown; charset=utf-8';
  } else if (pathname === '/.well-known/api-catalog') {
    contentType =
      'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"';
  }
  const isHome = pathname === '/';
  if (!response.ok || (!contentType && !isHome)) {
    return response;
  }

  const modified = new Response(response.body, response);
  if (contentType) modified.headers.set('Content-Type', contentType);
  if (isHome) modified.headers.set('Link', HOME_LINK_HEADER);
  return modified;
}

BunnySDK.net.http
  .servePullZone()
  .onOriginRequest(onOriginRequest)
  .onOriginResponse(onOriginResponse);
