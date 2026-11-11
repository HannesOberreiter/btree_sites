import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildCompareContext,
  extractUserImpact,
  pullRequestRefs,
  scopeCompareToPath,
} from './news-context.mjs';

test('compare context includes source patches and skips generated files', () => {
  const context = buildCompareContext({
    commits: [
      {
        sha: 'e80ee30fb138',
        commit: {
          message: 'feat(charge): add inventory total mode\n\nDetails',
        },
      },
    ],
    files: [
      {
        filename: 'src/api/generated/schema.d.ts',
        status: 'modified',
        additions: 300,
        deletions: 2,
        patch: '+generated noise',
      },
      {
        filename: 'src/i18n/de/index.json',
        status: 'modified',
        additions: 3,
        deletions: 0,
        patch:
          '+  "chargeInventoryHint": "Geben Sie den tatsächlich gezählten Gesamtbestand ein."',
      },
    ],
  });

  assert.match(context, /feat\(charge\): add inventory total mode/);
  assert.match(context, /src\/api\/generated\/schema\.d\.ts/);
  assert.match(context, /Patch excerpts[\s\S]*src\/i18n\/de\/index\.json/);
  assert.doesNotMatch(context, /generated noise/);
  assert.match(context, /tatsächlich gezählten Gesamtbestand/);
});

test('compare context bounds each patch excerpt', () => {
  const context = buildCompareContext({
    files: [
      {
        filename: 'src/component.vue',
        patch: `+${'x'.repeat(4000)}`,
      },
    ],
  });

  assert.match(context, /patch excerpt truncated/);
  assert.ok(context.length < 3000);
});

test('compare context skips release metadata patches', () => {
  const context = buildCompareContext({
    files: [
      {
        filename: 'CHANGELOG.md',
        patch: '+release metadata noise',
      },
      {
        filename: '.release-please-manifest.json',
        patch: '+manifest noise',
      },
      {
        filename: 'src/feature.ts',
        patch: '+behavior evidence',
      },
    ],
  });

  assert.doesNotMatch(context, /release metadata noise|manifest noise/);
  assert.match(context, /behavior evidence/);
});

test('compare context continues after a patch exceeds remaining budget', () => {
  const largeFiles = Array.from({ length: 6 }, (_, index) => ({
    filename: `src/large-${index}.ts`,
    patch: `+${'x'.repeat(4000)}`,
  }));
  const context = buildCompareContext({
    files: [
      ...largeFiles,
      { filename: 'src/too-large.ts', patch: `+${'y'.repeat(4000)}` },
      { filename: 'src/later-small.ts', patch: '+important later evidence' },
    ],
  });

  assert.doesNotMatch(context, /src\/too-large\.ts\n\+y/);
  assert.match(context, /src\/later-small\.ts\n\+important later evidence/);
});

test('compare scope keeps only commits and files of the app path', () => {
  const commit = (sha, message) => ({ sha, commit: { message } });
  const scoped = scopeCompareToPath(
    {
      commits: [
        commit('old-web', 'feat: sign in with Apple'),
        commit('server-fix', 'fix(wizbee): keep results small'),
        commit('release', 'Merge pull request #283'),
      ],
      files: [
        { filename: 'apps/web/src/App.vue' },
        { filename: 'apps/server/src/app.ts' },
        { filename: 'apps/server-tools/x.ts' },
      ],
    },
    'apps/server',
    // Path history lists commits outside the compare range too.
    [commit('server-fix'), commit('older-server', 'fix: older')],
  );

  assert.deepEqual(
    scoped.commits.map((c) => c.sha),
    ['server-fix'],
  );
  assert.deepEqual(
    scoped.files.map((f) => f.filename),
    ['apps/server/src/app.ts'],
  );
});

test('pull request refs come from release-please links, once each', () => {
  const notes = `* show queen birth date ([#332](https://github.com/HannesOberreiter/btree/issues/332)) ([e723b0e](https://github.com/HannesOberreiter/btree/commit/e723b0e))
* same change ([#332](https://github.com/HannesOberreiter/btree/issues/332))
* text without a link (#331)`;

  assert.deepEqual(pullRequestRefs(notes), [
    { owner: 'HannesOberreiter', repo: 'btree', number: 332 },
  ]);
});

test('user impact is the section text without comments', () => {
  const body = `## User impact

<!-- One or two plain sentences. -->
The stock movements table no longer has two columns named Typ.

## What and why

Details.`;

  assert.equal(
    extractUserImpact(body),
    'The stock movements table no longer has two columns named Typ.',
  );
});

test('user impact is empty for None, a missing section, or no body', () => {
  assert.equal(extractUserImpact('## User impact\n\nNone.\n\n## What'), '');
  assert.equal(extractUserImpact('## What and why\n\nDetails.'), '');
  assert.equal(extractUserImpact(null), '');
});
