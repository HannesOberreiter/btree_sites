---
applyTo: ".github/workflows/*.yml"
---

# GitHub Actions workflow conventions for btree_sites

Use the [root instructions](../../AGENTS.md) for package filters, workspace commands, and workflow location.

## Deployment pattern

- Keep deployments independently path-filtered for each site, with `push` to `main` and `workflow_dispatch` triggers.
- Preserve checkout, pnpm setup/install, package build, Bunny Storage upload, and cache purge ordering. Read the workflow for the current action versions.

## Secrets & variables

- `BUNNY_API_KEY` — shared secret for CDN cache purge
- `<SITE>_STORAGE_PASSWORD` — per-site Bunny Storage secret
- `<SITE>_STORAGE_ZONE_NAME` — per-site variable
- `<SITE>_PULL_ZONE_ID` — per-site variable

## Bunny upload behavior

- For btree_info and wizbee_info, retain the per-site deployment concurrency groups and `scripts/upload-bunny.sh`. The script uploads non-HTML files first, HTML next, and root `index.html` last; it retains existing storage files for open clients. Upload failures must stop the workflow before cache purge.
- Treat the btree_tv workflow separately: it still deletes existing storage files before uploading. Do not describe it as using the shared non-pruning uploader.
- Preserve cache purge through `POST https://api.bunny.net/pullzone/{PULL_ZONE_ID}/purgeCache` after a successful upload.
