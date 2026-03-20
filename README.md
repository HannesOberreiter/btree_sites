# btree_sites

Static websites monorepo for the [btree](https://www.btree.at) ecosystem.

## Packages

| Package | Domain | Description |
|---------|--------|-------------|
| `packages/btree_info` | btree.at | Main btree info & documentation site |
| `packages/wizbee_info` | wiz-bee.com | WizBee AI assistant landing page |

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
