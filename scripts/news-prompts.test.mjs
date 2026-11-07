import assert from 'node:assert/strict';
import test from 'node:test';

import {
  APP_CONTEXT,
  SYSTEM_PROMPT_EN,
  SYSTEM_PROMPT_SOCIAL,
  SYSTEM_PROMPT_TRANSLATE,
} from './news-prompts.mjs';

test('English prompt defines stock movements as inventory', () => {
  assert.match(APP_CONTEXT, /"stock movements"/);
  assert.match(APP_CONTEXT, /never "charge"/);
  assert.match(APP_CONTEXT, /incoming and outgoing goods/);
  assert.match(APP_CONTEXT, /not a fee, electrical charge, load, or burden/);
  assert.match(SYSTEM_PROMPT_EN, /Do not reinterpret domain terms/);
  assert.match(
    SYSTEM_PROMPT_EN,
    /Use application context only to interpret terminology/,
  );
});

test('German prompt requires b.tree charge terminology', () => {
  assert.match(SYSTEM_PROMPT_TRANSLATE, /stock movement = Lagerbuchung/);
  assert.match(SYSTEM_PROMPT_TRANSLATE, /stock item = Lagerartikel/);
  assert.match(
    SYSTEM_PROMPT_TRANSLATE,
    /lot or lot number = Charge or Chargennummer/,
  );
  assert.match(
    SYSTEM_PROMPT_TRANSLATE,
    /goods receipt or incoming goods = Wareneingang/,
  );
  assert.match(SYSTEM_PROMPT_TRANSLATE, /outgoing goods = Warenausgang/);
  assert.match(SYSTEM_PROMPT_TRANSLATE, /apiary = Stand; plural = Stände/);
  assert.match(SYSTEM_PROMPT_TRANSLATE, /hive = Stock; plural = Stöcke/);
  assert.match(SYSTEM_PROMPT_TRANSLATE, /colony = Volk; plural = Völker/);
  assert.match(SYSTEM_PROMPT_TRANSLATE, /wax lot = Wachslos/);
  assert.match(SYSTEM_PROMPT_TRANSLATE, /hive movement = Wanderung/);
  assert.match(SYSTEM_PROMPT_TRANSLATE, /hive scale = Stockwaage/);
  assert.match(
    SYSTEM_PROMPT_TRANSLATE,
    /never translate it as "Laden", "Ladung", "Gebühr", or "Belastung"/,
  );
});

test('German news address the reader with du', () => {
  assert.match(SYSTEM_PROMPT_TRANSLATE, /informally with "du"/);
});

test('Facebook post prompt forbids emojis, hashtags and links', () => {
  assert.match(SYSTEM_PROMPT_SOCIAL, /no emojis, no hashtags, no links/);
  assert.match(SYSTEM_PROMPT_SOCIAL, /Never invent features/);
  assert.match(SYSTEM_PROMPT_SOCIAL, /in English\./);
  assert.match(SYSTEM_PROMPT_SOCIAL, /\{"en": ""\}/);
});
