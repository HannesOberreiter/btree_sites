# btree_sites — Agent Instructions

## What this repo is

A **pnpm workspace monorepo** for all static/marketing websites in the btree beekeeping app ecosystem.
All packages are **Astro 6 static sites** deployed to **Bunny CDN** via GitHub Actions.

## Packages

| Package | Filter name | Domain | Description |
|---------|-------------|---------|-------------|
| `packages/btree_info` | `@btree/info` | btree.at | Main info & documentation site. Astro 6 + Vue 3 + TailwindCSS 4. Bilingual EN/DE with Pagefind search. |
| `packages/wizbee_info` | `wizbee_info` | wiz-bee.com | WizBee AI assistant landing page. Minimal Astro 6, plain CSS, single page. |
| `packages/btree_tv` | `btree_tv` | btree.tv | Video funnel site (in development). Minimal Astro 6, plain CSS. |

## Tech stack

- **Astro 6** — static site generator for all packages
- **pnpm workspaces** (v10) — monorepo management; always use `pnpm`, never `npm`
- **TailwindCSS 4** — only in btree_info (via `@tailwindcss/vite`)
- **Vue 3** — only in btree_info for interactive components
- **Pagefind** — search in btree_info; runs as CLI post-build (`astro build && pagefind --site dist`)
- **Bunny CDN / Storage** — deployment target for all packages
- **GitHub Actions** — CI/CD with per-package path-filtered workflows

## Common commands

```bash
pnpm install                          # install all deps from workspace root
pnpm --filter @btree/info dev         # dev server for btree_info
pnpm --filter wizbee_info dev         # dev server for wizbee_info
pnpm --filter btree_tv dev            # dev server for btree_tv
pnpm --filter @btree/info build       # build btree_info
pnpm -r build                         # build all packages
./scripts/bunny.sh purge btree_info   # purge Bunny CDN cache for btree_info
./scripts/bunny.sh deploy btree_info  # build + deploy btree_info to Bunny
```

## Deployment

Each package deploys independently via its own path-filtered GitHub Actions workflow:
- `.github/workflows/deploy-btree-info.yml` — triggers on `packages/btree_info/**`
- `.github/workflows/deploy-wizbee-info.yml` — triggers on `packages/wizbee_info/**`
- `.github/workflows/deploy-btree-tv.yml` — triggers on `packages/btree_tv/**`

All workflows: checkout → pnpm install → pnpm build (package) → upload to Bunny Storage → purge CDN.

### Required secrets / variables (GitHub repo settings)

| Name | Type | Scope |
|------|------|-------|
| `BUNNY_API_KEY` | Secret | shared |
| `BTREE_INFO_STORAGE_PASSWORD` | Secret | btree_info |
| `WIZBEE_INFO_STORAGE_PASSWORD` | Secret | wizbee_info |
| `BTREE_TV_STORAGE_PASSWORD` | Secret | btree_tv |
| `BTREE_INFO_STORAGE_ZONE_NAME` | Variable | btree_info |
| `BTREE_INFO_PULL_ZONE_ID` | Variable | btree_info |
| `WIZBEE_INFO_STORAGE_ZONE_NAME` | Variable | wizbee_info |
| `WIZBEE_INFO_PULL_ZONE_ID` | Variable | wizbee_info |
| `BTREE_TV_STORAGE_ZONE_NAME` | Variable | btree_tv |
| `BTREE_TV_PULL_ZONE_ID` | Variable | btree_tv |

### Local Bunny credentials

Local Bunny operations (via `scripts/bunny.sh`) read from `.env` in the monorepo root.
See `.env.example` for required keys.

## btree_info specifics

- **i18n**: EN (default, no prefix) + DE (`/de/` prefix). Config in `astro.config.mjs` and `src/config.ts`.
- **Search**: Pagefind — runs after `astro build`. Index is in `dist/pagefind/`.
- **Edge Script**: `packages/btree_info/edge-script.ts` — deployed manually to Bunny CDN pull zone Edge Scripting. Handles `/app/*`, `/app/detail/*`, and `/en/*` redirects (pattern redirects not possible via simple Bunny Edge Rules).
- **Redirects** (simple ones): defined in `astro.config.mjs` under `redirects`.
- **`.htaccess`**: removed — Bunny CDN doesn't use Apache. HTTPS, www-redirect, HSTS, caching, and CORS are all configured in the Bunny pull zone settings.

## Code style

- TypeScript strict mode in all packages
- Astro components (`.astro`) for layout/structure; Vue (`.vue`) only in btree_info for interactive components
- Plain CSS in wizbee_info and btree_tv; TailwindCSS only in btree_info
- No shared package between sites (visually too different); add one if a concrete need arises

## Important notes

- Always run commands from the **workspace root** (`btree_sites/`) to benefit from pnpm hoisting
- `sharp` must be listed as an explicit devDependency in each package that builds images (pnpm strict isolation)
- `pnpm.onlyBuiltDependencies` in root `package.json` allows `esbuild` and `sharp` build scripts
- The btree_info package name is `@btree/info` (use this in `--filter` flags)
