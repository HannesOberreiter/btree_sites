/**
 * Markdown versions of the content pages, for AI agents.
 *
 * Each Markdown or MDX page under src/pages gets a copy at
 * `<page URL>index.md`, for example `/features/` has `/features/index.md`.
 * HeadSEO links the copy with `<link rel="alternate" type="text/markdown">`.
 */

const SOURCES = import.meta.glob<string>('./pages/**/*.{md,mdx}', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/* Pages without useful text content: the 404 page and the news pages. */
const EXCLUDED_PAGES = new Set(['/404/', '/updates/', '/de/updates/']);

export interface MarkdownPage {
  /** URL path of the HTML page, for example `/features/`. */
  pagePath: string;
  /** URL path of the Markdown copy, for example `/features/index.md`. */
  markdownPath: string;
  raw: string;
}

/**
 * Removes frontmatter, imports, images and page-only HTML from Markdown/MDX.
 * Keeps links, code and URLs because agents need exact references.
 */
export function extractContent(content: string): string {
  let cleanContent = content.replace(/^---[\s\S]*?---\n*/, '');

  cleanContent = cleanContent.replace(/^import\s[^\n]+\n/gm, '');
  cleanContent = cleanContent.replace(/<Image[^>]*\/>/g, '');
  cleanContent = cleanContent.replace(/<Image[^>]*>[\s\S]*?<\/Image>/g, '');
  cleanContent = cleanContent.replace(/<section[^>]*>[\s\S]*?<\/section>/g, '');
  cleanContent = cleanContent.replace(/<ul[^>]*>/g, '');
  cleanContent = cleanContent.replace(/<\/ul>/g, '');
  cleanContent = cleanContent.replace(/<li>([\s\S]*?)<\/li>/g, '- $1');
  cleanContent = cleanContent.replace(
    /<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g,
    '$2 ($1)',
  );
  cleanContent = cleanContent.replace(/<!--[\s\S]*?-->/g, '');
  cleanContent = cleanContent.replace(/<hr\s*\/?>/g, '---');
  cleanContent = cleanContent.replace(/<[^>]+>/g, '');

  return cleanContent.trim();
}

function frontmatterValue(raw: string, key: string): string | undefined {
  const frontmatter = raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const value = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1];
  return value?.trim().replace(/^(['"])(.*)\1$/, '$2');
}

/** Converts the source of a page into plain Markdown. */
export function toMarkdown(raw: string): string {
  const title = frontmatterValue(raw, 'title');
  const description = frontmatterValue(raw, 'description');
  const body = extractContent(raw)
    // Image paths point to source files, not to public URLs.
    .replace(/^!\[[^\]]*\]\([^)]*\)\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  let output = '';
  if (title) output += `# ${title}\n\n`;
  if (description) output += `> ${description}\n\n`;
  return `${output}${body}\n`;
}

function pagePathOf(file: string): string {
  const path = file
    .replace(/^\.\/pages/, '')
    .replace(/\.mdx?$/, '')
    .replace(/\/index$/, '');
  return `${path}/`;
}

export const MARKDOWN_PAGES: MarkdownPage[] = Object.entries(SOURCES)
  .map(([file, raw]) => {
    const pagePath = pagePathOf(file);
    return { pagePath, markdownPath: `${pagePath}index.md`, raw };
  })
  .filter(
    (page) =>
      !EXCLUDED_PAGES.has(page.pagePath) &&
      frontmatterValue(page.raw, 'noindex') !== 'true',
  );

const MARKDOWN_PATHS = new Map(
  MARKDOWN_PAGES.map((page) => [page.pagePath, page.markdownPath]),
);

/** Returns the Markdown URL path for an HTML page path, if one exists. */
export function markdownPathFor(pagePath: string): string | undefined {
  const normalized = pagePath.endsWith('/') ? pagePath : `${pagePath}/`;
  return MARKDOWN_PATHS.get(normalized);
}
