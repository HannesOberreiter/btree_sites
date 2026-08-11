import assert from "node:assert/strict";
import test from "node:test";

import {
  APP_CONTEXT,
  SYSTEM_PROMPT_EN,
  SYSTEM_PROMPT_TRANSLATE,
} from "./news-prompts.mjs";

test("English prompt defines Charge Control as inventory", () => {
  assert.match(APP_CONTEXT, /Charge Control/);
  assert.match(APP_CONTEXT, /incoming and outgoing goods/);
  assert.match(APP_CONTEXT, /not a fee, electrical charge, load, or burden/);
  assert.match(SYSTEM_PROMPT_EN, /Do not reinterpret domain terms/);
  assert.match(
    SYSTEM_PROMPT_EN,
    /Use application context only to interpret terminology/,
  );
});

test("German prompt requires b.tree charge terminology", () => {
  assert.match(SYSTEM_PROMPT_TRANSLATE, /Charge Control = Chargenverwaltung/);
  assert.match(
    SYSTEM_PROMPT_TRANSLATE,
    /charge, when it means a Charge Control inventory record/,
  );
  assert.match(SYSTEM_PROMPT_TRANSLATE, /goods receipt or incoming goods = Wareneingang/);
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
