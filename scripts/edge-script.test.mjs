import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';

const edgeScriptPath = new URL(
  '../packages/btree_info/edge-script.ts',
  import.meta.url,
);
const source = await readFile(edgeScriptPath, 'utf8');
let handler;
let responseHandler;
const pullZone = {
  onOriginRequest: (callback) => {
    handler = callback;
    return pullZone;
  },
  onOriginResponse: (callback) => {
    responseHandler = callback;
    return pullZone;
  },
};
const BunnySDK = {
  net: {
    http: {
      servePullZone: () => pullZone,
    },
  },
};
const executableSource = stripTypeScriptTypes(
  source.replace(
    /^import \* as BunnySDK from .*;$/m,
    'const BunnySDK = globalThis.BunnySDK;',
  ),
);

vm.runInNewContext(executableSource, {
  BunnySDK,
  Request,
  Response,
  URL,
});

assert.equal(typeof handler, 'function');
assert.equal(typeof responseHandler, 'function');

async function originResponse(path, init = {}) {
  const originRequest = new Request(
    new URL(path, 'http://origin.internal:9000'),
  );
  const response = new Response('body', {
    status: 200,
    headers: { 'content-type': 'application/octet-stream' },
    ...init,
  });
  return responseHandler({ request: originRequest, response });
}

async function request(url) {
  const publicURL = new URL(url);
  const originURL = new URL(
    `${publicURL.pathname}${publicURL.search}`,
    'http://origin.internal:9000',
  );
  const originalRequest = new Request(originURL, {
    headers: { host: publicURL.host },
  });
  return {
    originalRequest,
    response: await handler({ request: originalRequest }),
  };
}

test('redirects extensionless page URLs to trailing-slash canonicals', async () => {
  for (const [sourceURL, canonicalURL] of [
    ['https://www.btree.at/doc-agent', 'https://www.btree.at/doc-agent/'],
    ['https://www.btree.at/de', 'https://www.btree.at/de/'],
    ['https://www.btree.at/de/imprint', 'https://www.btree.at/de/imprint/'],
  ]) {
    const { response } = await request(sourceURL);
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('location'), canonicalURL);
  }
});

test('preserves query parameters while adding trailing slash', async () => {
  const { response } = await request(
    'https://www.btree.at/doc-agent?mtm_campaign=test',
  );

  assert.equal(response.status, 301);
  assert.equal(
    response.headers.get('location'),
    'https://www.btree.at/doc-agent/?mtm_campaign=test',
  );
});

test('redirects legacy WordPress page ID to home', async () => {
  const { response } = await request('https://www.btree.at/?page_id=277');

  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), 'https://www.btree.at/');
});

test('passes canonical pages, files, and campaign home URL through', async () => {
  for (const url of [
    'https://www.btree.at/doc-agent/',
    'https://www.btree.at/favicon.ico',
    'https://www.btree.at/.well-known/apple-app-site-association',
    'https://www.btree.at/?mtm_campaign=beekeeping-news&mtm_medium=referral',
  ]) {
    const { originalRequest, response } = await request(url);
    assert.equal(response, originalRequest);
  }
});

test('serves Markdown copies as text/markdown', async () => {
  const response = await originResponse('/features/index.md');

  assert.equal(
    response.headers.get('content-type'),
    'text/markdown; charset=utf-8',
  );
  assert.equal(await response.text(), 'body');
});

test('serves the API catalog as linkset JSON', async () => {
  const response = await originResponse('/.well-known/api-catalog');

  assert.match(
    response.headers.get('content-type'),
    /^application\/linkset\+json; profile=/,
  );
});

test('adds discovery Link header to the home page only', async () => {
  const home = await originResponse('/', {
    headers: { 'content-type': 'text/html' },
  });
  const link = home.headers.get('link');
  assert.match(link, /<\/\.well-known\/api-catalog>; rel="api-catalog"/);
  assert.match(link, /<\/\.well-known\/ai-catalog\.json>; rel="ai-catalog"/);
  assert.match(link, /<\/index\.md>; rel="alternate"; type="text\/markdown"/);
  assert.equal(home.headers.get('content-type'), 'text/html');

  const page = await originResponse('/doc-agent/', {
    headers: { 'content-type': 'text/html' },
  });
  assert.equal(page.headers.get('link'), null);
});

test('passes error responses through unchanged', async () => {
  const response = await originResponse('/missing/index.md', { status: 404 });

  assert.equal(response.status, 404);
  assert.equal(
    response.headers.get('content-type'),
    'application/octet-stream',
  );
});
