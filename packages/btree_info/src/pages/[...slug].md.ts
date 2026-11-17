import type { APIRoute, GetStaticPaths } from 'astro';

import { MARKDOWN_PAGES, toMarkdown } from '../markdown-pages';

/* Writes `<page URL>index.md` for each content page. */
export const getStaticPaths = (() =>
  MARKDOWN_PAGES.map((page) => ({
    // `/features/index.md` has the slug `features/index`.
    params: { slug: page.markdownPath.replace(/^\//, '').replace(/\.md$/, '') },
    props: { raw: page.raw },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(toMarkdown(props.raw as string), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
