const CHARGE_SOURCE = /\bcharge(?:s)?\b/i;
const PAYMENT_CHARGE_SOURCE =
  /\b(?:payment|billing|card|transaction|service)\s+charges?\b|\bcharges?\s+(?:fee|fees|payment|billing|card|transaction|service)\b/i;
const FORBIDDEN_CHARGE_TRANSLATION =
  /(?:Lad(?:ung|en)|Gebühr|Belastung)\p{L}*/iu;

function isNewsItem(item) {
  return (
    typeof item === "object" &&
    item !== null &&
    typeof item.title === "string" &&
    typeof item.description === "string"
  );
}

function refersToChargeControl(text) {
  return (
    /\bCharge Control\b/i.test(text) ||
    (CHARGE_SOURCE.test(text) && !PAYMENT_CHARGE_SOURCE.test(text))
  );
}

export function parseJsonResponse(raw) {
  return JSON.parse(
    raw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim(),
  );
}

export function validateGermanNewsItems(englishItems, germanItems) {
  if (!Array.isArray(germanItems)) {
    return ["Translation must be a JSON array."];
  }
  if (germanItems.length !== englishItems.length) {
    return [
      `Translation must contain ${englishItems.length} items in the original order; received ${germanItems.length}.`,
    ];
  }

  const errors = [];
  for (let index = 0; index < englishItems.length; index++) {
    const english = englishItems[index];
    const german = germanItems[index];
    if (!isNewsItem(german)) {
      errors.push(`Item ${index + 1} must contain string title and description fields.`);
      continue;
    }

    const englishText = `${english.title} ${english.description}`;
    const germanText = `${german.title} ${german.description}`;
    if (
      refersToChargeControl(englishText) &&
      FORBIDDEN_CHARGE_TRANSLATION.test(germanText)
    ) {
      errors.push(
        `Item ${index + 1} mistranslates Charge Control terminology as Laden, Ladung, Gebühr, or Belastung.`,
      );
    }
  }
  return errors;
}

export function buildTranslationRetryPrompt(englishItems, errors) {
  return `Translate the complete JSON array again. Correct every validation error and preserve item count and order.

Validation errors:
${errors.map((error) => `- ${error}`).join("\n")}

English source:
${JSON.stringify(englishItems, null, 2)}`;
}

export async function translateGermanNewsItems({
  englishItems,
  version,
  requestTranslation,
  logger = console,
}) {
  let prompt = JSON.stringify(englishItems, null, 2);

  for (let attempt = 1; attempt <= 2; attempt++) {
    let germanItems;
    let errors;

    try {
      const raw = await requestTranslation(prompt);
      germanItems = parseJsonResponse(raw);
      errors = validateGermanNewsItems(englishItems, germanItems);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors = [`Translation request or JSON parsing failed: ${message}`];
    }

    if (errors.length === 0) return germanItems;

    logger.warn(
      `German translation validation failed for ${version} (attempt ${attempt}): ${errors.join(" ")}`,
    );
    prompt = buildTranslationRetryPrompt(englishItems, errors);
  }

  logger.error(
    `German translation remained invalid for ${version}; using English fallback.`,
  );
  return englishItems;
}
