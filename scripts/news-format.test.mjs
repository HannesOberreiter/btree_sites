import assert from "node:assert/strict";
import test from "node:test";

import { buildFallbackItems } from "./news-format.mjs";

test("feature fallback publishes one clean user-facing item", () => {
  const notes = `## [7.3.0](https://github.com/HannesOberreiter/btree_vue/compare/btree-client-v7.2.1...btree-client-v7.3.0) (2026-07-18)

### Features

* remove unused US server to reduce costs ([ead9ff0](https://github.com/HannesOberreiter/btree_vue/commit/ead9ff099c5051f003486267cec07cb8bd910fd4))`;

  assert.deepEqual(buildFallbackItems(notes), [
    {
      title: "Feature",
      description: "Remove unused US server to reduce costs.",
    },
  ]);
});

test("fallback skips irrelevant maintenance sections", () => {
  const notes = `## 7.3.1\n\n### Miscellaneous\n\n* update dependencies ([abc1234](https://example.com/commit/abc1234))\n* fix linting`;

  assert.deepEqual(buildFallbackItems(notes), []);
});
