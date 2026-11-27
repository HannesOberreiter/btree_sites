import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, delimiter } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./upload-bunny.sh', import.meta.url));

// Fake curl: logs every call, stores PUT files in UPLOAD_TEST_STATE, and
// serves HEAD requests only for stored files. UPLOAD_TEST_FAIL fails every
// call. UPLOAD_TEST_DROP accepts PUTs of matching URLs without storing them.
// UPLOAD_TEST_DROP_ONCE drops only the first matching PUT.
const fakeCurl = `#!/usr/bin/env python3
import hashlib, json, os, sys
from urllib.parse import urlparse
args = sys.argv[1:]
with open(os.environ['UPLOAD_TEST_LOG'], 'a') as log:
    log.write(json.dumps(args) + chr(10))
if os.environ.get('UPLOAD_TEST_FAIL'):
    sys.exit(22)
if '--request' in args:
    url = args[args.index('--request') + 2]
else:
    url = args[-1]
u = urlparse(url)
path = u.path.lstrip('/')
if u.netloc == 'storage.bunnycdn.com':
    path = path.split('/', 1)[1]
key = os.path.join(
    os.environ['UPLOAD_TEST_STATE'], hashlib.sha256(path.encode()).hexdigest()
)
if '--head' in args:
    sys.exit(0 if os.path.exists(key) else 22)
drop = os.environ.get('UPLOAD_TEST_DROP', '')
drop_once = os.environ.get('UPLOAD_TEST_DROP_ONCE', '')
if drop and drop in path:
    sys.exit(0)
if drop_once and drop_once in path:
    marker = key + '.dropped'
    if not os.path.exists(marker):
        open(marker, 'w').close()
        sys.exit(0)
open(key, 'w').close()
sys.exit(0)
`;

function fixture(t, files) {
  const directory = mkdtempSync(join(tmpdir(), 'bunny-upload-test-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const dist = join(directory, 'dist');
  mkdirSync(dist);
  for (const file of files) {
    const path = join(dist, file);
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, 'test content');
  }
  const log = join(directory, 'calls.jsonl');
  const state = join(directory, 'state');
  mkdirSync(state);
  writeFileSync(join(directory, 'curl'), fakeCurl, { mode: 0o700 });
  const env = {
    ...process.env,
    PATH: directory + delimiter + process.env.PATH,
    STORAGE_ZONE_NAME: 'test-zone',
    STORAGE_PASSWORD: 'test-password',
    SITE_PUBLIC_HOST: 'test-host.example',
    UPLOAD_TEST_LOG: log,
    UPLOAD_TEST_STATE: state,
    UPLOAD_RETRY_WAIT: '0',
  };
  return {
    run: (overrides = {}) =>
      spawnSync('bash', [script, dist], {
        env: { ...env, ...overrides },
        encoding: 'utf8',
      }),
    calls: () =>
      existsSync(log)
        ? readFileSync(log, 'utf8')
            .trim()
            .split('\n')
            .map((line) => JSON.parse(line))
        : [],
  };
}

const isPut = (call) => call.includes('--request');
const isHead = (call) => call.includes('--head');
const putUrl = (call) => call[call.indexOf('--request') + 2];
const headUrl = (call) => call[call.length - 1];

test('uploads assets, verifies them on the public host, then publishes HTML last', (t) => {
  const f = fixture(t, [
    'index.html',
    'de/index.html',
    '_astro/main.hash.css',
    'pagefind/pagefind.js',
    'news.json',
    '.well-known/assetlinks.json',
    'media/image #1 ü.png',
  ]);
  const result = f.run();
  assert.equal(result.status, 0, result.stderr);
  const calls = f.calls();
  const puts = calls.filter(isPut);
  const heads = calls.filter(isHead);
  assert.equal(puts.length, 7);
  assert.equal(heads.length, 5);
  // Asset PUTs first, then one HEAD per asset, then HTML PUTs.
  assert.deepEqual(
    calls.map((c) => (isPut(c) ? 'PUT' : 'HEAD')),
    [
      'PUT',
      'PUT',
      'PUT',
      'PUT',
      'PUT',
      'HEAD',
      'HEAD',
      'HEAD',
      'HEAD',
      'HEAD',
      'PUT',
      'PUT',
    ],
  );
  for (const call of puts) {
    assert.equal(call[call.indexOf('--request') + 1], 'PUT');
    assert.ok(call.includes('--fail'));
    assert.ok(!call.includes('DELETE'));
  }
  for (const call of heads) {
    assert.ok(headUrl(call).startsWith('https://test-host.example/'));
    assert.ok(!headUrl(call).endsWith('.html'));
  }
  const urls = puts.map(putUrl);
  assert.ok(urls.slice(0, -2).every((url) => !url.endsWith('.html')));
  assert.deepEqual(urls.slice(-2), [
    'https://storage.bunnycdn.com/test-zone/de/index.html',
    'https://storage.bunnycdn.com/test-zone/index.html',
  ]);
  assert.ok(
    urls.includes(
      'https://storage.bunnycdn.com/test-zone/media/image%20%231%20%C3%BC.png',
    ),
  );
  assert.ok(
    urls.includes(
      'https://storage.bunnycdn.com/test-zone/.well-known/assetlinks.json',
    ),
  );
  assert.ok(
    heads.some((call) =>
      headUrl(call).endsWith('/media/image%20%231%20%C3%BC.png'),
    ),
  );
});

test('stops before HTML when an asset upload fails', (t) => {
  const f = fixture(t, ['index.html', '_astro/main.hash.css']);
  assert.notEqual(f.run({ UPLOAD_TEST_FAIL: '1' }).status, 0);
  assert.equal(f.calls().length, 1);
  assert.ok(!f.calls()[0].some((arg) => arg.endsWith('/index.html')));
});

test('re-uploads a dropped asset and publishes HTML after it is served', (t) => {
  const f = fixture(t, ['index.html', '_astro/main.hash.css']);
  const result = f.run({ UPLOAD_TEST_DROP_ONCE: '_astro/main.hash.css' });
  assert.equal(result.status, 0, result.stderr);
  const calls = f.calls();
  const cssPuts = calls.filter(
    (call) => isPut(call) && putUrl(call).includes('_astro/main.hash.css'),
  );
  assert.equal(cssPuts.length, 2);
  const cssHeads = calls.filter(
    (call) => isHead(call) && headUrl(call).includes('_astro/main.hash.css'),
  );
  assert.equal(cssHeads.length, 2);
  const indexPut = calls.find(
    (call) => isPut(call) && putUrl(call).endsWith('/index.html'),
  );
  assert.ok(indexPut, 'index.html is uploaded');
  assert.ok(
    calls.indexOf(indexPut) > calls.lastIndexOf(cssPuts[1]),
    'index.html is uploaded only after the re-uploaded asset is served',
  );
});

test('stops before index.html when an asset stays missing after 3 checks', (t) => {
  const f = fixture(t, ['index.html', '_astro/main.hash.css']);
  const result = f.run({ UPLOAD_TEST_DROP: '_astro/main.hash.css' });
  assert.notEqual(result.status, 0);
  const calls = f.calls();
  const heads = calls.filter(
    (call) => isHead(call) && headUrl(call).includes('_astro/main.hash.css'),
  );
  assert.equal(heads.length, 3);
  const puts = calls.filter(isPut);
  // Initial upload plus 2 re-uploads, and no HTML at all.
  assert.equal(puts.length, 3);
  assert.ok(puts.every((call) => !putUrl(call).endsWith('.html')));
});

test('rejects missing index before uploading anything', (t) => {
  const f = fixture(t, ['_astro/main.hash.css']);
  assert.notEqual(f.run().status, 0);
  assert.deepEqual(f.calls(), []);
});

test('rejects missing credentials before uploading anything', (t) => {
  const f = fixture(t, ['index.html']);
  assert.notEqual(f.run({ STORAGE_PASSWORD: '' }).status, 0);
  assert.deepEqual(f.calls(), []);
});

test('rejects missing public host before uploading anything', (t) => {
  const f = fixture(t, ['index.html']);
  assert.notEqual(f.run({ SITE_PUBLIC_HOST: '' }).status, 0);
  assert.deepEqual(f.calls(), []);
});
