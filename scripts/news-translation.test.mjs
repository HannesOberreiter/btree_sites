import assert from "node:assert/strict";
import test from "node:test";

import {
  buildTranslationRetryPrompt,
  translateGermanNewsItems,
  validateGermanNewsItems,
} from "./news-translation.mjs";

const english = [
  {
    title: "Inventory count mode",
    description: "Charge Control calculates the required incoming goods entry.",
  },
];

test("translation validator rejects wrong Charge Control terminology", () => {
  const errors = validateGermanNewsItems(english, [
    {
      title: "Gesamtansicht der Gebühren",
      description: "Der Ladungsbestand wurde angepasst.",
    },
  ]);

  assert.equal(errors.length, 1);
  assert.match(errors[0], /mistranslates Charge Control terminology/);
});

test("translation validator catches generic charge titles and German compounds", () => {
  for (const [englishItem, germanItem] of [
    [
      {
        title: "Charge adjustments",
        description: "Inventory entries can now be corrected.",
      },
      {
        title: "Ladungsanpassungen",
        description: "Inventareinträge können korrigiert werden.",
      },
    ],
    [
      {
        title: "Charge Control improvements",
        description: "Stock handling was improved.",
      },
      {
        title: "Bestandsgebühren verbessert",
        description: "Die Bestandsführung wurde verbessert.",
      },
    ],
  ]) {
    const errors = validateGermanNewsItems([englishItem], [germanItem]);
    assert.equal(errors.length, 1);
  }
});

test("translation validator accepts scoped b.tree terminology", () => {
  assert.deepEqual(
    validateGermanNewsItems(english, [
      {
        title: "Inventur in der Chargenverwaltung",
        description: "Der nötige Wareneingang wird berechnet.",
      },
    ]),
    [],
  );
});

test("translation validator does not reject payment fees", () => {
  assert.deepEqual(
    validateGermanNewsItems(
      [
        {
          title: "Lower payment charges",
          description: "Payment processing charges are now lower.",
        },
      ],
      [
        {
          title: "Niedrigere Zahlungsgebühren",
          description: "Die Gebühren für Zahlungen sind jetzt niedriger.",
        },
      ],
    ),
    [],
  );
});

test("retry prompt includes validation errors and complete source", () => {
  const prompt = buildTranslationRetryPrompt(english, ["Wrong terminology."]);

  assert.match(prompt, /Wrong terminology/);
  assert.match(prompt, /Inventory count mode/);
  assert.match(prompt, /preserve item count and order/);
});

test("translation retries request failures then uses English fallback", async () => {
  let requests = 0;
  const warnings = [];
  const errors = [];

  const result = await translateGermanNewsItems({
    englishItems: english,
    version: "client-1.0.0",
    requestTranslation: async () => {
      requests++;
      throw new Error("rate limited");
    },
    logger: {
      warn: (message) => warnings.push(message),
      error: (message) => errors.push(message),
    },
  });

  assert.equal(requests, 2);
  assert.deepEqual(result, english);
  assert.equal(warnings.length, 2);
  assert.equal(errors.length, 1);
});

test("translation retry can recover from invalid terminology", async () => {
  let requests = 0;
  const result = await translateGermanNewsItems({
    englishItems: english,
    version: "client-1.0.0",
    requestTranslation: async () => {
      requests++;
      return requests === 1
        ? JSON.stringify([
            {
              title: "Ladungsbestand",
              description: "Die Gebühr wurde angepasst.",
            },
          ])
        : JSON.stringify([
            {
              title: "Inventur",
              description: "Der Chargenbestand wurde angepasst.",
            },
          ]);
    },
    logger: { warn: () => {}, error: () => {} },
  });

  assert.equal(requests, 2);
  assert.equal(result[0].title, "Inventur");
});
