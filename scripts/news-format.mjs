const MAX_FALLBACK_ITEMS = 6;
const MAX_FALLBACK_DESCRIPTION_LENGTH = 240;

const PUBLISHABLE_SECTIONS = new Map([
  ["features", "Feature"],
  ["bug fixes", "Fix"],
  ["fixes", "Fix"],
  ["improvements", "Improvement"],
  ["performance", "Performance"],
]);

function truncateAtWordBoundary(text, maxLength) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  const chunk = clean.slice(0, maxLength + 1);
  const lastSpace = chunk.lastIndexOf(" ");
  if (lastSpace > 0) return `${chunk.slice(0, lastSpace)}…`;
  return `${clean.slice(0, maxLength)}…`;
}

function cleanDescription(line) {
  const clean = line
    .replace(/^[-*]\s*/, "")
    .replace(/:[a-z0-9_+-]+:/gi, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/\s*\((?:#[0-9]+|[0-9a-f]{7,40})\)\s*$/i, "")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) return "";
  const sentence = `${clean[0].toUpperCase()}${clean.slice(1)}`;
  return /[.!?…]$/.test(sentence) ? sentence : `${sentence}.`;
}

export function buildFallbackItems(notes) {
  const items = [];
  let title = null;

  for (const line of notes.split(/\r?\n/)) {
    const section = line.match(/^###\s+(.+?)\s*$/);
    if (section) {
      title = PUBLISHABLE_SECTIONS.get(section[1].trim().toLowerCase()) || null;
      continue;
    }

    if (!title || !/^[-*]\s+/.test(line)) continue;
    const description = cleanDescription(line);
    if (!description) continue;

    items.push({
      title,
      description: truncateAtWordBoundary(
        description,
        MAX_FALLBACK_DESCRIPTION_LENGTH,
      ),
    });

    if (items.length === MAX_FALLBACK_ITEMS) break;
  }

  return items;
}
