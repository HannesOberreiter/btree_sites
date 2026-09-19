<!-- bmad:context -->
<!-- Verified 2026-09-14 against f31dc9a08e7580ebb6a65a2bbb8976d349627f95. Managed by bmad-project-context; refreshes reconcile existing instructions before replacing this block. -->

## btree_sites

Static documentation and marketing websites for the b.tree ecosystem.
The pnpm workspace contains three Astro sites deployed to Bunny Storage/CDN.
Development and deployment documentation lives in `README.md`.

## Policy

- Work on `main`; do not introduce the application's beta promotion workflow.
- Use pnpm, not npm, and run commands from the workspace root.
- Keep sites separate; introduce a shared package only when a concrete need arises.

## Where things are

- Use `packages/btree_info` (`@btree/info`) for btree.at documentation, `packages/wizbee_info` (`wizbee_info`) for wiz-bee.com, and `packages/btree_tv` (`btree_tv`) for btree.tv.
- Keep GitHub Actions workflows under `.github/workflows/`, not inside packages.
- For btree_info redirects, check `packages/btree_info/astro.config.mjs` and `packages/btree_info/edge-script.ts`. The edge script is deployed separately to Bunny Edge Scripting, not by the static-site upload.
- Coordinate application documentation with `HannesOberreiter/btree_vue` and `HannesOberreiter/btree_server`; coordinate database infrastructure documentation with `HannesOberreiter/btree_database`.

## Site conventions

- Keep all sites statically generated. Use Astro components for layout and structure.
- For btree_info documentation, keep English and German pages paired: English URLs have no locale prefix; German URLs use `/de/`.
- Keep TailwindCSS limited to btree_info. Use its existing TailwindCSS 4 Vite integration and utility classes.
- Keep wizbee_info minimal: plain CSS in Astro `<style>` blocks, using the existing CSS custom properties rather than adding a framework.
- Use Astro's `<Image>` component for processed images in `src/assets/`; files in `public/` are copied as-is. Each package that builds images needs its own direct `sharp` dependency for pnpm resolution.
- Preserve Pagefind indexing in btree_info: searchable content belongs inside an `<article data-pagefind-body>`, and page titles use `<title data-pagefind-meta="title">`.

## Deployment safety

- Keep site deployments independently path-filtered, with pushes to `main` and manual `workflow_dispatch` triggers.
- Preserve the order: checkout, pnpm setup/install, package build, Bunny Storage upload, then cache purge. Upload failures must prevent cache purge.
- For btree_info and wizbee_info, retain per-site concurrency groups and `scripts/upload-bunny.sh`. Upload non-HTML files first, HTML next, and root `index.html` last. Retain existing storage files for open clients.
- The btree_tv workflow and `scripts/bunny.sh upload` / `deploy` delete existing storage files before uploading. Treat these as destructive operations, not as the non-pruning info/WizBee deployment path.
- Read the relevant workflow and `README.md` for current actions, secrets, variables, and deployment commands.

## Running and verifying

- Use Node `>=22.12.0` and pinned pnpm `10.32.1` from `package.json`; deployment workflows use Node 24.
- Build btree_info through `pnpm --filter @btree/info build`; bare `astro build` skips its Pagefind indexing step.
- Use `pnpm test` for the repository's script tests; it does not build the sites.
- For local Bunny operations, use the root `.env` configuration described by `.env.example`.
- For release-news changes, inspect `scripts/generate-news.mjs` and `.github/workflows/generate-news.yml`; they consume frontend/backend releases and publish `packages/btree_info/public/news.json` and `packages/btree_info/public/changelog.json`.

<!-- /bmad:context -->
