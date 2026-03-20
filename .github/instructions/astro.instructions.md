---
applyTo: "packages/**/*.astro,packages/**/*.ts,packages/**/astro.config.mjs"
---

# Astro conventions for btree_sites

All packages use **Astro 6** static output. Keep these conventions when editing Astro files.

## Builds

- Build command for each package: `astro build` (btree_info appends `&& pagefind --site dist`)
- Dev command: `astro dev`
- Never change `output` from `"static"` — all sites are fully static

## btree_info (packages/btree_info)

- **i18n**: `defaultLocale: 'en'`, `prefixDefaultLocale: false` — English URLs have no prefix, German is `/de/*`
- To add a bilingual page: create `src/pages/example.md` (EN) and `src/pages/de/example.md` (DE)
- Layouts: `MainLayout.astro` (docs/content pages), `IndexLayout.astro` (landing pages)
- `src/config.ts` holds site config, OG meta, and sidebar navigation — update it when adding pages
- TailwindCSS 4 via Vite plugin (`@tailwindcss/vite`) — no `@tailwind` directives, use utility classes directly
- Vue components live in `src/components/*.vue` — only use Vue for interactive/stateful UI

## wizbee_info (packages/wizbee_info) & btree_tv (packages/btree_tv)

- Single page, plain CSS, no frameworks — keep it minimal
- All styles are in `<style>` blocks in `src/pages/index.astro`
- Use CSS custom properties (`var(--color-*)`) for theming

## Images

- Place images in `src/assets/` (processed by Astro with Sharp) or `public/` (copied as-is)
- Always use Astro's `<Image>` component for images in `src/assets/` to get WebP optimization
- `sharp` must remain in `devDependencies` of each package — pnpm requires explicit declaration

## Pagefind (btree_info only)

- Mark searchable content with `data-pagefind-body` on the `<article>` element
- Mark page title with `data-pagefind-meta="title"` on `<title>`
- The search index is built automatically by `pagefind --site dist` after `astro build`
