# btree_sites

Static websites monorepo for the [btree](https://www.btree.at) ecosystem. Related repositories: [HannesOberreiter/btree_vue](https://github.com/HannesOberreiter/btree_vue) (frontend), [HannesOberreiter/btree_server](https://github.com/HannesOberreiter/btree_server) (backend), and [HannesOberreiter/btree_database](https://github.com/HannesOberreiter/btree_database) (database infrastructure).

## Packages

| Package | Domain | Description |
|---------|--------|-------------|
| `packages/btree_info` | btree.at | Main btree info & documentation site |
| `packages/wizbee_info` | wiz-bee.com | WizBee AI assistant landing page |
| `packages/btree_tv` | btree.tv | btree.tv static site |

## Stack

- [Astro 6](https://astro.build) — static site generator for all packages
- [pnpm workspaces](https://pnpm.io/workspaces) — monorepo management
- [Bunny CDN / Storage](https://bunny.net) — deployment target for all sites
- GitHub Actions — CI/CD with per-package path-filtered workflows

## Development

```bash
# Install all dependencies
pnpm install

# Dev server for a specific package
pnpm dev:btree-info
pnpm dev:wizbee-info

# Build a specific package
pnpm build:btree-info

# Build all packages
pnpm build
```

## Deployment

Each package is deployed independently via GitHub Actions.
Workflows are path-filtered — a push to `packages/btree_info/**` only triggers
the `deploy-btree-info` workflow, and so on.

All sites deploy to Bunny Storage and are served via BunnyCDN pull zones.

The btree_info and wizbee_info GitHub workflows serialize deployments per site and use `scripts/upload-bunny.sh`. Non-HTML files are uploaded first, HTML pages next, and the root `index.html` last. Existing storage files are retained so open clients can finish loading older assets. A failed upload stops the deployment before the CDN purge. Removed pages and obsolete assets require deliberate cleanup; these workflows do not prune storage.

Cache rules are managed in the separate `infra` repository under `bunny/sites/`. Successful hashed `/_astro/*` assets use one-year immutable caching. HTML and mutable files, including Pagefind search files and news/changelog JSON, revalidate. The existing site redirects and real 404 behavior are preserved.
