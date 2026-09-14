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
- When editing site pages, Astro components, TypeScript, images, or Astro configuration, read `.github/instructions/astro.instructions.md`.
- When editing GitHub Actions, read `.github/instructions/workflows.instructions.md`; keep workflows under `.github/workflows/`, not inside packages.
- For btree_info redirects, check `packages/btree_info/astro.config.mjs` and `packages/btree_info/edge-script.ts`. The edge script is deployed separately to Bunny Edge Scripting, not by the static-site upload.
- Coordinate application documentation with `HannesOberreiter/btree_vue` and `HannesOberreiter/btree_server`; coordinate database infrastructure documentation with `HannesOberreiter/btree_database`.

## Running and verifying

- Use Node `>=22.12.0` and pinned pnpm `10.32.1` from `package.json`; deployment workflows use Node 24.
- Build btree_info through `pnpm --filter @btree/info build`; bare `astro build` skips its Pagefind indexing step.
- Use `pnpm test` for the repository's script tests; it does not build the sites.
- For local Bunny operations, use the root `.env` configuration described by `.env.example`.
- Treat `scripts/bunny.sh upload` and `deploy` as destructive storage replacement operations. They delete existing files before uploading, unlike the btree_info and wizbee_info deployment workflows.
- For release-news changes, inspect `scripts/generate-news.mjs` and `.github/workflows/generate-news.yml`; they consume frontend/backend releases and publish `packages/btree_info/public/news.json` and `packages/btree_info/public/changelog.json`.

<!-- /bmad:context -->
