import type { APIRoute } from 'astro';

// Import raw content of documentation files at build time
import apiContent from './doc-api.md?raw';
import faqsContent from './doc-faqs.md?raw';
import firstStepsContent from './doc-first-steps.md?raw';
import otherContent from './doc-other.md?raw';
import indexContent from './index.mdx?raw';
import priceContent from './price.md?raw';

interface DocFile {
  rawContent: string
  title: string
}

const SYSTEM_MESSAGE = `# b.tree Beekeeping App Documentation

> This document contains the complete documentation for the b.tree beekeeping web application (https://www.btree.at). b.tree is a cloud-based beekeeping management software that has been proudly serving beekeepers since 2014. It helps beekeepers efficiently manage their apiaries, colonies, feeding schedules, harvests, treatments, and more.

---

`;

const DOC_FILES: DocFile[] = [
  { rawContent: indexContent, title: 'Introduction' },
  { rawContent: priceContent, title: 'Costs & Price' },
  { rawContent: faqsContent, title: 'FAQs' },
  { rawContent: firstStepsContent, title: 'First Steps' },
  { rawContent: apiContent, title: 'API (Premium Feature)' },
  { rawContent: otherContent, title: 'Other Features' },
];

/**
 * Extracts content from a markdown/mdx string, removing frontmatter and imports.
 * Note: This uses simple regex-based cleanup which handles the current doc structure.
 * The output is a plain text file served as text/plain, not rendered as HTML.
 */
function extractContent(content: string): string {
  // Remove frontmatter (content between --- markers at the start of the file)
  const frontmatterRegex = /^---[\s\S]*?---\n*/;
  let cleanContent = content.replace(frontmatterRegex, '');

  // Remove import statements
  cleanContent = cleanContent.replace(/^import\s[^\n]+\n/gm, '');

  // Remove Astro Image components (self-closing and regular)
  cleanContent = cleanContent.replace(/<Image[^>]*\/>/g, '');
  cleanContent = cleanContent.replace(/<Image[^>]*>[\s\S]*?<\/Image>/g, '');

  // Remove section elements (non-greedy match for nested content)
  cleanContent = cleanContent.replace(/<section[^>]*>[\s\S]*?<\/section>/g, '');

  // Convert HTML list items to plain text
  // First remove ul tags, then convert li tags (nested HTML within li is cleaned up later)
  cleanContent = cleanContent.replace(/<ul[^>]*>/g, '');
  cleanContent = cleanContent.replace(/<\/ul>/g, '');
  cleanContent = cleanContent.replace(/<li>([\s\S]*?)<\/li>/g, '- $1');

  // Remove remaining HTML tags (including any nested tags from list items)
  cleanContent = cleanContent.replace(/<hr\s*\/?>/g, '---');
  cleanContent = cleanContent.replace(/<[^>]+>/g, '');

  // Clean up multiple consecutive newlines
  cleanContent = cleanContent.replace(/\n{3,}/g, '\n\n');

  return cleanContent.trim();
}

/**
 * Generates the full LLMs text file content
 */
function generateLlmsFullTxt(): string {
  let output = SYSTEM_MESSAGE;

  for (const doc of DOC_FILES) {
    const content = extractContent(doc.rawContent);
    output += `## ${doc.title}\n\n`;
    output += content;
    output += '\n\n---\n\n';
  }

  // Remove trailing separator
  output = output.replace(/\n---\n\n$/, '\n');

  return output;
}

export const GET: APIRoute = async () => {
  const content = generateLlmsFullTxt();
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
