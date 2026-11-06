import assert from "node:assert/strict";
import test from "node:test";

import {
  generateSocialPost,
  germanUpdatesUrl,
  validateSocialPost,
} from "./news-social.mjs";

const en = "Winter feeding is coming. b.tree now books the sugar of a feeding from your stock automatically, so your stock is always up to date. You can set a recipe for each feed type, and every saved feeding books the amount for you. Stock movements now also show which task created them, and you can book stock for many tasks at once in multi-edit.";
const de = "Die Winterfütterung steht an. b.tree bucht den Zucker einer Fütterung jetzt automatisch aus deinem Lager, damit dein Bestand immer stimmt. Für jede Futterart legst du ein Rezept fest, und jede gespeicherte Fütterung bucht die Menge für dich. Lagerbuchungen zeigen jetzt auch, welche Aufgabe sie erstellt hat, und im Mehrfach-Edit buchst du Lager für viele Aufgaben auf einmal.";
const silent = { log() {}, warn() {}, error() {} };

test("valid post and empty post pass the check", () => {
  assert.deepEqual(validateSocialPost({ en, de }), []);
  assert.deepEqual(validateSocialPost({ en: "", de: "" }), []);
});

test("post check rejects hashtags, emojis, links, formal German and bad length", () => {
  const errors = (post) => validateSocialPost({ en, de, ...post }).join(" ");
  assert.match(errors({ en: `${en} #beekeeping` }), /hashtag/);
  assert.match(errors({ en: `${en} \u{1F41D}` }), /emoji/);
  assert.match(errors({ de: `${de} Mehr auf www.btree.at` }), /link/);
  assert.match(errors({ de: de.replace("deinem Lager", "Ihrem Lager") }), /"Sie"/);
  assert.match(errors({ de: `${de} Damit sparen Sie Zeit.` }), /"Sie"/);
  assert.match(errors({ en: "Too short." }), /characters/);
  assert.deepEqual(
    validateSocialPost({ en, de: `${de} Sie zeigen den Bestand.` }),
    [],
  );
});

test("German updates URL gets the de prefix", () => {
  assert.equal(germanUpdatesUrl("https://btree.at/updates/"), "https://btree.at/de/updates/");
});

test("generated post gets the updates link and retries once on errors", async () => {
  const prompts = [];
  const answers = [JSON.stringify({ en: `${en} #bees`, de }), JSON.stringify({ en, de })];
  const post = await generateSocialPost({
    date: "2026-11-06",
    englishItems: [],
    germanItems: [],
    updatesUrl: "https://btree.at/updates/",
    requestPost: async (prompt) => {
      prompts.push(prompt);
      return answers.shift();
    },
    logger: silent,
  });
  assert.equal(prompts.length, 2);
  assert.match(prompts[1], /hashtag/);
  assert.equal(post.en, `${en}\n\nAll updates: https://btree.at/updates/`);
  assert.equal(post.de, `${de}\n\nAlle Neuerungen: https://btree.at/de/updates/`);
});

test("day without a change worth a post and invalid answers give no post", async () => {
  const run = (answer) =>
    generateSocialPost({
      date: "2026-11-06",
      englishItems: [],
      germanItems: [],
      updatesUrl: "https://btree.at/updates/",
      requestPost: async () => answer,
      logger: silent,
    });
  assert.equal(await run(JSON.stringify({ en: "", de: "" })), null);
  assert.equal(await run("not json"), null);
});
