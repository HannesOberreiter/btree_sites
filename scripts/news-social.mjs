import { parseJsonResponse } from "./news-translation.mjs";

const MIN_LENGTH = 250;
const MAX_LENGTH = 800;
const EMOJI = /\p{Extended_Pictographic}/u;
// Formal address. "Sie" at the start of a sentence can mean "they", so only
// "Sie" inside a sentence counts.
const FORMAL_GERMAN = /(?<![.!?:]\s|^)\bSie\b|\b(?:Ihr(?:e[mnrs]?)?|Ihnen)\b/u;

export function buildSocialPrompt(date, englishItems, germanItems) {
  return [
    `Write the Facebook post for the b.tree updates of ${date}.`,
    "",
    "English news items:",
    JSON.stringify(englishItems, null, 2),
    "",
    "German news items:",
    JSON.stringify(germanItems, null, 2),
  ].join("\n");
}

// Returns a list of errors. A post with two empty texts is valid: it means
// that the day has no change worth a post.
export function validateSocialPost(post) {
  if (typeof post !== "object" || post === null) {
    return ["The answer must be a JSON object with en and de fields."];
  }
  if (typeof post.en !== "string" || typeof post.de !== "string") {
    return ["The en and de fields must be strings."];
  }
  if (post.en === "" && post.de === "") return [];

  const errors = [];
  for (const lang of ["en", "de"]) {
    const text = post[lang].trim();
    if (text.length < MIN_LENGTH || text.length > MAX_LENGTH) {
      errors.push(`The ${lang} post has ${text.length} characters; write 400 to 600.`);
    }
    if (text.includes("#")) errors.push(`The ${lang} post contains a hashtag.`);
    if (EMOJI.test(text)) errors.push(`The ${lang} post contains an emoji.`);
    if (/https?:\/\/|www\./i.test(text)) errors.push(`The ${lang} post contains a link.`);
  }
  if (FORMAL_GERMAN.test(post.de)) {
    errors.push('The de post uses "Sie", "Ihr" or "Ihnen"; use "du", "dein" and "dir".');
  }
  return errors;
}

export function germanUpdatesUrl(url) {
  const german = new URL(url);
  german.pathname = `/de${german.pathname}`;
  return german.toString();
}

// Returns { en, de } with the link added, or null when the day has no post
// or the answer stays invalid.
export async function generateSocialPost({
  date,
  englishItems,
  germanItems,
  updatesUrl,
  requestPost,
  logger = console,
}) {
  const basePrompt = buildSocialPrompt(date, englishItems, germanItems);
  let prompt = basePrompt;

  for (let attempt = 1; attempt <= 2; attempt++) {
    let post;
    let errors;
    try {
      post = parseJsonResponse(await requestPost(prompt));
      errors = validateSocialPost(post);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors = [`Request or JSON parsing failed: ${message}`];
    }

    if (errors.length === 0) {
      if (post.en === "" && post.de === "") {
        logger.log(`No Facebook post for ${date}: no change worth a post.`);
        return null;
      }
      return {
        en: `${post.en.trim()}\n\nAll updates: ${updatesUrl}`,
        de: `${post.de.trim()}\n\nAlle Neuerungen: ${germanUpdatesUrl(updatesUrl)}`,
      };
    }

    logger.warn(`Facebook post for ${date} is invalid (attempt ${attempt}): ${errors.join(" ")}`);
    prompt = `Write the post again. Correct every validation error.\n\nValidation errors:\n${errors
      .map((error) => `- ${error}`)
      .join("\n")}\n\n${basePrompt}`;
  }

  logger.error(`Facebook post for ${date} remained invalid; the publish issue gets no post.`);
  return null;
}
