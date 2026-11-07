const MAX_FALLBACK_ITEMS = 6;
const MAX_FALLBACK_DESCRIPTION_LENGTH = 240;

const PUBLISHABLE_SECTIONS = new Map([
  ['features', 'Feature'],
  ['bug fixes', 'Fix'],
  ['fixes', 'Fix'],
  ['improvements', 'Improvement'],
  ['performance', 'Performance'],
]);

function truncateAtWordBoundary(text, maxLength) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  const chunk = clean.slice(0, maxLength + 1);
  const lastSpace = chunk.lastIndexOf(' ');
  if (lastSpace > 0) return `${chunk.slice(0, lastSpace)}…`;
  return `${clean.slice(0, maxLength)}…`;
}

function cleanDescription(line) {
  const clean = line
    .replace(/^[-*]\s*/, '')
    .replace(/:[a-z0-9_+-]+:/gi, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/\s*\((?:#[0-9]+|[0-9a-f]{7,40})\)\s*$/i, '')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return '';
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

/**
 * Get the answer text of a Mistral message. Reasoning models return chunks:
 * thinking first, then the answer text. The thinking is dropped.
 */
export function responseText(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .filter((chunk) => chunk.type === 'text')
    .map((chunk) => chunk.text)
    .join('');
}

// Day entries list their releases in "versions". Older entries have one
// release in "version" only.
export function entryVersions(entry) {
  return Array.isArray(entry.versions) && entry.versions.length > 0
    ? entry.versions
    : [entry.version];
}

// Stable HTML id of a news entry. RSS readers use it to tell entries apart.
// A day entry keeps its id when later releases of the day join it.
export function newsAnchor(entry) {
  const id = Array.isArray(entry.versions)
    ? entry.date
    : `${entry.date}-${entry.version}`;
  return `news-${id}`.replace(/[^A-Za-z0-9-]+/g, '-');
}

const COMPONENT_LABELS = {
  en: { client: 'Web app', server: 'Server' },
  de: { client: 'Web-App', server: 'Server' },
};

function compareSemver(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

// "btree-client-7.10.0", "btree-client-7.10.4", "btree-server-7.12.2"
// -> "Web app 7.10.0–7.10.4 · Server 7.12.2"
export function buildDayLabel(versions, lang = 'en') {
  const labels = COMPONENT_LABELS[lang] || COMPONENT_LABELS.en;
  const parts = [];
  for (const component of ['client', 'server']) {
    const semvers = versions
      .filter((version) => version.startsWith(`btree-${component}-`))
      .map((version) => version.slice(`btree-${component}-`.length))
      .sort(compareSemver);
    if (semvers.length === 0) continue;
    const first = semvers[0];
    const last = semvers[semvers.length - 1];
    parts.push(
      `${labels[component]} ${first === last ? first : `${first}–${last}`}`,
    );
  }
  const other = versions.filter(
    (version) => !/^btree-(client|server)-/.test(version),
  );
  return [...parts, ...other].join(' · ');
}

// Newest first. Entries of one day are ordered by the publish time of their
// newest release.
export function sortNewsEntries(entries, publishedAtByVersion) {
  const newestPublish = (entry) =>
    entryVersions(entry)
      .map((version) => publishedAtByVersion.get(version) || '')
      .sort()
      .at(-1) || '';
  return entries.sort(
    (a, b) =>
      b.date.localeCompare(a.date) ||
      newestPublish(b).localeCompare(newestPublish(a)),
  );
}
