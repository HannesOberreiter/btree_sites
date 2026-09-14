import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, delimiter } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = fileURLToPath(new URL('./upload-bunny.sh', import.meta.url));

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
  writeFileSync(join(directory, 'curl'), `#!/usr/bin/env python3
import json, os, sys
with open(os.environ['UPLOAD_TEST_LOG'], 'a') as log:
    log.write(json.dumps(sys.argv[1:]) + '\\n')
if os.environ.get('UPLOAD_TEST_FAIL'):
    sys.exit(22)
`, { mode: 0o700 });
  const env = {
    ...process.env,
    PATH: directory + delimiter + process.env.PATH,
    STORAGE_ZONE_NAME: 'test-zone',
    STORAGE_PASSWORD: 'test-password',
    UPLOAD_TEST_LOG: log,
  };
  return {
    run: (overrides = {}) => spawnSync('bash', [script, dist], { env: { ...env, ...overrides }, encoding: 'utf8' }),
    calls: () => existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n').map(line => JSON.parse(line)) : [],
  };
}

test('uploads assets before HTML, publishes root index last, and never deletes files', t => {
  const f = fixture(t, ['index.html', 'de/index.html', '_astro/main.hash.css', 'pagefind/pagefind.js', 'news.json', '.well-known/assetlinks.json', 'media/image #1 ü.png']);
  const result = f.run();
  assert.equal(result.status, 0, result.stderr);
  const calls = f.calls();
  assert.equal(calls.length, 7);
  for (const call of calls) {
    assert.equal(call[call.indexOf('--request') + 1], 'PUT');
    assert.ok(call.includes('--fail'));
    assert.ok(!call.includes('DELETE'));
  }
  const urls = calls.map(call => call[call.indexOf('--request') + 2]);
  assert.ok(urls.slice(0, -2).every(url => !url.endsWith('.html')));
  assert.deepEqual(urls.slice(-2), ['https://storage.bunnycdn.com/test-zone/de/index.html', 'https://storage.bunnycdn.com/test-zone/index.html']);
  assert.ok(urls.includes('https://storage.bunnycdn.com/test-zone/media/image%20%231%20%C3%BC.png'));
  assert.ok(urls.includes('https://storage.bunnycdn.com/test-zone/.well-known/assetlinks.json'));
});

test('stops before HTML when an asset upload fails', t => {
  const f = fixture(t, ['index.html', '_astro/main.hash.css']);
  assert.notEqual(f.run({ UPLOAD_TEST_FAIL: '1' }).status, 0);
  assert.equal(f.calls().length, 1);
  assert.ok(!f.calls()[0].some(arg => arg.endsWith('/index.html')));
});

test('rejects missing index before uploading anything', t => {
  const f = fixture(t, ['_astro/main.hash.css']);
  assert.notEqual(f.run().status, 0);
  assert.deepEqual(f.calls(), []);
});

test('rejects missing credentials before uploading anything', t => {
  const f = fixture(t, ['index.html']);
  assert.notEqual(f.run({ STORAGE_PASSWORD: '' }).status, 0);
  assert.deepEqual(f.calls(), []);
});
