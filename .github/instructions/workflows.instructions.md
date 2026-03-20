---
applyTo: ".github/workflows/*.yml"
---

# GitHub Actions workflow conventions for btree_sites

## Pattern all deploy workflows follow

1. Trigger: `push` to `main` + `workflow_dispatch`, path-filtered to `packages/<name>/**`
2. Steps: `actions/checkout@v6` → `pnpm/action-setup@v4` (v10) → `actions/setup-node@v6` (Node 24, pnpm cache) → `pnpm install` → `pnpm --filter <name> build` → Bunny Storage upload → Bunny cache purge

## Package filter names

| Package | `--filter` value |
|---------|-----------------|
| btree_info | `@btree/info` |
| wizbee_info | `wizbee_info` |

## Secrets & variables

- `BUNNY_API_KEY` — shared secret for CDN cache purge
- `<SITE>_STORAGE_PASSWORD` — per-site Bunny Storage secret
- `<SITE>_STORAGE_ZONE_NAME` — per-site variable
- `<SITE>_PULL_ZONE_ID` — per-site variable

## Bunny deploy script pattern

The deploy step lists existing storage files, deletes them, then uploads `dist/` recursively via `curl PUT`.
Cache purge uses `POST https://api.bunny.net/pullzone/{PULL_ZONE_ID}/purgeCache`.

## Do not

- Do not change `actions/checkout` or `actions/setup-node` to versions below v6
- Do not use `npm` in workflows — always use `pnpm`
- Do not add per-package CI files inside `packages/*/` — all workflows live in `.github/workflows/`
