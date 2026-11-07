import assert from 'node:assert/strict';
import test from 'node:test';

import { generateSocialPost, validateSocialPost } from './news-social.mjs';

const en =
  'Winter feeding is coming. b.tree now books the sugar of a feeding from your stock automatically, so your stock is always up to date. You can set a recipe for each feed type, and every saved feeding books the amount for you. Stock movements now also show which task created them, and you can book stock for many tasks at once in multi-edit.';
const silent = { log() {}, warn() {}, error() {} };

function run(answers, prompts = []) {
  return generateSocialPost({
    date: '2026-11-06',
    englishItems: [],
    updatesUrl: 'https://btree.at/updates/',
    requestPost: async (prompt) => {
      prompts.push(prompt);
      return answers.shift();
    },
    logger: silent,
  });
}

test('valid post and empty post pass the check', () => {
  assert.deepEqual(validateSocialPost({ en }), []);
  assert.deepEqual(validateSocialPost({ en: '' }), []);
});

test('post check rejects hashtags, emojis, links and bad length', () => {
  const errors = (text) => validateSocialPost({ en: text }).join(' ');
  assert.match(errors(`${en} #beekeeping`), /hashtag/);
  assert.match(errors(`${en} \u{1F41D}`), /emoji/);
  assert.match(errors(`${en} More on www.btree.at`), /link/);
  assert.match(errors('Too short.'), /characters/);
  assert.match(validateSocialPost({}).join(' '), /string en field/);
});

test('generated post gets the updates link and retries once on errors', async () => {
  const prompts = [];
  const post = await run(
    [JSON.stringify({ en: `${en} #bees` }), JSON.stringify({ en })],
    prompts,
  );
  assert.equal(prompts.length, 2);
  assert.match(prompts[1], /hashtag/);
  assert.equal(post, `${en}\n\nAll updates: https://btree.at/updates/`);
});

test('day without a change worth a post and invalid answers give no post', async () => {
  assert.equal(await run([JSON.stringify({ en: '' })]), null);
  assert.equal(await run(['not json', 'not json']), null);
});
