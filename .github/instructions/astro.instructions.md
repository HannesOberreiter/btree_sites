---
applyTo: "packages/**/*.astro,packages/**/*.ts,packages/**/astro.config.mjs"
---

# Astro conventions for btree_sites

All packages use **Astro** static output. Keep these conventions when editing Astro files.

## Output and TypeScript

- Keep all sites statically generated; do not switch to server output.
- Preserve each package's TypeScript configuration: `btree_info` extends Astro's `base`, while `wizbee_info` and `btree_tv` extend `strict`.

## btree_info (packages/btree_info)

- **i18n**: `defaultLocale: 'en'`, `prefixDefaultLocale: false` — English URLs have no prefix, German is `/de/*`
- To add a bilingual page: create `src/pages/example.md` (EN) and `src/pages/de/example.md` (DE)
- Layouts: `MainLayout.astro` (docs/content pages), `IndexLayout.astro` (landing pages)
- `src/config.ts` holds site config, OG meta, and sidebar navigation — update it when adding pages
- Keep TailwindCSS limited to btree_info. Use TailwindCSS 4 via the Vite plugin (`@tailwindcss/vite`), with utility classes directly rather than `@tailwind` directives.
- Use Astro components for layout and structure; this package no longer has a Vue integration.

## wizbee_info (packages/wizbee_info)

- Single page, plain CSS, no frameworks — keep it minimal
- All styles are in `<style>` blocks in `src/pages/index.astro`
- Use the existing CSS custom properties, such as `var(--bg)` and `var(--amber)`, for theming.

## Images

- Place images in `src/assets/` (processed by Astro with Sharp) or `public/` (copied as-is)
- Always use Astro's `<Image>` component for images in `src/assets/` to get WebP optimization
- Keep `sharp` declared directly in every package that builds images; pnpm requires an explicit package dependency, whether in `dependencies` or `devDependencies`.

## Pagefind (btree_info only)

- Mark searchable content with `data-pagefind-body` on the `<article>` element
- Mark page title with `data-pagefind-meta="title"` on `<title>`
