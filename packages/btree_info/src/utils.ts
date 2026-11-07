import type { Graph, Thing, WithContext } from 'schema-dts';

/**
 * Removes null values from JSON-LD data
 */
function removeNullValues(_key: string, value: unknown): unknown {
  return value === null ? undefined : value;
}

/**
 * Converts schema.org structured data to a safe JSON-LD string.
 * Escapes `<` as a JSON unicode escape, so that the content cannot close
 * the script element. JSON parsers read the escape as `<` again.
 */
export function stringifyJsonLd(
  structuredData: Graph | WithContext<Thing>,
  formatting?: string | number,
): string {
  return JSON.stringify(structuredData, removeNullValues, formatting).replace(
    /</g,
    '\\u003c',
  );
}

export interface FaqEntry {
  question: string;
  answer: string;
}

/**
 * Converts a Markdown snippet to plain text for JSON-LD
 */
function markdownToText(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{4,6}\s+(.+)$/gm, '$1:')
    .replace(/^\s*(?:>|[-*]|\d+\.)\s+/gm, '')
    .replace(/\*\*|__|`/g, '')
    .replace(/\\([*_\\])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts FAQ entries from Markdown: each `### ` heading is a question,
 * the text until the next `### ` heading is the answer
 */
export function faqFromMarkdown(markdown: string): FaqEntry[] {
  return markdown
    .replace(/<!--[\s\S]*?-->/g, '')
    .split(/^### /m)
    .slice(1)
    .map((section) => {
      const [question = '', ...lines] = section.split('\n');
      return {
        question: question.trim(),
        answer: markdownToText(lines.join('\n')),
      };
    })
    .filter((entry) => entry.question && entry.answer);
}
