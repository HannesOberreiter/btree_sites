import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';

const edgeScriptPath = new URL('../packages/btree_info/edge-script.ts', import.meta.url);
const source = await readFile(edgeScriptPath, 'utf8');
let handler;
const BunnySDK = {
  net: {
    http: {
      servePullZone: () => ({
        onOriginRequest: (callback) => {
          handler = callback;
        },
      }),
    },
  },
};
const executableSource = stripTypeScriptTypes(source.replace(
  /^import \* as BunnySDK from .*;$/m,
  'const BunnySDK = globalThis.BunnySDK;',
));

vm.runInNewContext(executableSource, {
  BunnySDK,
  Request,
  Response,
  URL,
});

assert.equal(typeof handler, 'function');

async function request(url) {
  const originalRequest = new Request(url);
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
  const { response } = await request('https://www.btree.at/doc-agent?mtm_campaign=test');

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
