import { parseJsonResponse } from "./news-translation.mjs";

const MIN_LENGTH = 250;
const MAX_LENGTH = 800;
const EMOJI = /\p{Extended_Pictographic}/u;

export function buildSocialPrompt(date, englishItems) {
  return [
    `Write the Facebook post for the b.tree updates of ${date}.`,
    "",
    "News items:",
    JSON.stringify(englishItems, null, 2),
  ].join("\n");
}

// Returns a list of errors. An empty text is valid: it means that the day
// has no change worth a post.
export function validateSocialPost(post) {
  if (typeof post !== "object" || post === null || typeof post.en !== "string") {
    return ["The answer must be a JSON object with a string en field."];
  }
  const text = post.en.trim();
  if (text === "") return [];

  const errors = [];
  if (text.length < MIN_LENGTH || text.length > MAX_LENGTH) {
    errors.push(`The post has ${text.length} characters; write 400 to 600.`);
  }
  if (text.includes("#")) errors.push("The post contains a hashtag.");
  if (EMOJI.test(text)) errors.push("The post contains an emoji.");
  if (/https?:\/\/|www\./i.test(text)) errors.push("The post contains a link.");
  return errors;
}

// Returns the post text with the link added, or null when the day has no post
// or the answer stays invalid.
export async function generateSocialPost({
  date,
  englishItems,
  updatesUrl,
  requestPost,
  logger = console,
}) {
  const basePrompt = buildSocialPrompt(date, englishItems);
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
      if (post.en.trim() === "") {
        logger.log(`No Facebook post for ${date}: no change worth a post.`);
        return null;
      }
      return `${post.en.trim()}\n\nAll updates: ${updatesUrl}`;
    }

    logger.warn(`Facebook post for ${date} is invalid (attempt ${attempt}): ${errors.join(" ")}`);
    prompt = `Write the post again. Correct every validation error.\n\nValidation errors:\n${errors
      .map((error) => `- ${error}`)
      .join("\n")}\n\n${basePrompt}`;
  }

  logger.error(`Facebook post for ${date} remained invalid; the publish issue gets no post.`);
  return null;
}
