import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildFallbackItems,
  buildDayLabel,
  entryVersions,
  newsAnchor,
  responseText,
  sortNewsEntries,
} from './news-format.mjs';

test('feature fallback publishes one clean user-facing item', () => {
  const notes = `## [7.3.0](https://github.com/HannesOberreiter/btree_vue/compare/btree-client-v7.2.1...btree-client-v7.3.0) (2026-07-18)

### Features

* remove unused US server to reduce costs ([ead9ff0](https://github.com/HannesOberreiter/btree_vue/commit/ead9ff099c5051f003486267cec07cb8bd910fd4))`;

  assert.deepEqual(buildFallbackItems(notes), [
    {
      title: 'Feature',
      description: 'Remove unused US server to reduce costs.',
    },
  ]);
});

test('fallback lists a change of two releases once', () => {
  const notes = `### Bug Fixes\n\n* require a birth date on queens (#329) ([abc1234](https://example.com/commit/abc1234))\n\n### Bug Fixes\n\n* require a birth date on queens (#329) ([abc1234](https://example.com/commit/abc1234))`;

  assert.deepEqual(buildFallbackItems(notes), [
    { title: 'Fix', description: 'Require a birth date on queens (#329).' },
  ]);
});

test('fallback skips irrelevant maintenance sections', () => {
  const notes = `## 7.3.1\n\n### Miscellaneous\n\n* update dependencies ([abc1234](https://example.com/commit/abc1234))\n* fix linting`;

  assert.deepEqual(buildFallbackItems(notes), []);
});

test('response text keeps string content', () => {
  assert.equal(responseText('[{"title":"A"}]'), '[{"title":"A"}]');
});

test('response text drops thinking chunks', () => {
  assert.equal(
    responseText([
      {
        type: 'thinking',
        thinking: [{ type: 'text', text: 'Plan the release notes.' }],
      },
      { type: 'text', text: '[{"title":' },
      { type: 'text', text: '"A"}]' },
    ]),
    '[{"title":"A"}]',
  );
});

test('response text is empty without text chunks', () => {
  assert.equal(
    responseText([
      { type: 'thinking', thinking: [{ type: 'text', text: 'Plan' }] },
    ]),
    '',
  );
  assert.equal(responseText(null), '');
});

test('news entries of one day are sorted newest first by publish time', () => {
  const entries = [
    { version: 'btree-server-7.11.0', date: '2026-11-05' },
    { version: 'btree-client-7.10.0', date: '2026-11-06' },
    { version: 'btree-client-7.10.3', date: '2026-11-06' },
    { version: 'btree-server-7.12.1', date: '2026-11-06' },
  ];
  const publishedAt = new Map([
    ['btree-server-7.11.0', '2026-11-05T11:19:00Z'],
    ['btree-client-7.10.0', '2026-11-06T07:19:00Z'],
    ['btree-client-7.10.3', '2026-11-06T15:00:05Z'],
    ['btree-server-7.12.1', '2026-11-06T15:00:03Z'],
  ]);

  assert.deepEqual(
    sortNewsEntries(entries, publishedAt).map((e) => e.version),
    [
      'btree-client-7.10.3',
      'btree-server-7.12.1',
      'btree-client-7.10.0',
      'btree-server-7.11.0',
    ],
  );
});

test('day label lists the version range of each app', () => {
  const versions = [
    'btree-server-7.12.2',
    'btree-client-7.10.10',
    'btree-client-7.10.4',
    'btree-server-7.12.0',
  ];
  assert.equal(
    buildDayLabel(versions, 'en'),
    'Web app 7.10.4–7.10.10 · Server 7.12.0–7.12.2',
  );
  assert.equal(buildDayLabel(['btree-client-7.10.4'], 'de'), 'Web-App 7.10.4');
});

test('entry versions fall back to the single version of old entries', () => {
  assert.deepEqual(entryVersions({ version: 'btree-client-7.9.0' }), [
    'btree-client-7.9.0',
  ]);
  assert.deepEqual(
    entryVersions({
      version: 'Web app 7.10.4',
      versions: ['btree-client-7.10.4'],
    }),
    ['btree-client-7.10.4'],
  );
});

test('day entries sort by the publish time of their newest release', () => {
  const publishedAt = new Map([
    ['1.0.6', '2014-03-02T08:00:00Z'],
    ['1.0.7', '2014-03-02T09:00:00Z'],
  ]);
  const entries = [
    { version: '1.0.6', date: '2014-03-02' },
    { version: 'x', versions: ['1.0.6', '1.0.7'], date: '2014-03-02' },
  ];
  assert.deepEqual(
    sortNewsEntries(entries, publishedAt).map((e) => e.version),
    ['x', '1.0.6'],
  );
});

test('news anchors stay stable for day entries and unique for old entries', () => {
  assert.equal(
    newsAnchor({
      version: 'Web app 7.10.4',
      versions: ['btree-client-7.10.4'],
      date: '2026-11-06',
    }),
    'news-2026-11-06',
  );
  assert.equal(
    newsAnchor({ version: 'btree-client-7.9.0', date: '2026-10-01' }),
    'news-2026-10-01-btree-client-7-9-0',
  );
});
