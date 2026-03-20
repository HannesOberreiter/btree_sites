#!/usr/bin/env bash
# =============================================================================
# scripts/bunny.sh — Bunny CDN helper for btree_sites
#
# Reads credentials from .env in the monorepo root (or environment variables).
#
# Usage:
#   ./scripts/bunny.sh purge  <site>   — purge CDN cache
#   ./scripts/bunny.sh deploy <site>   — build + upload to Bunny Storage + purge
#   ./scripts/bunny.sh upload <site>   — upload dist/ (skip build)
#   ./scripts/bunny.sh list   <site>   — list files in storage zone
#
# <site> is one of: btree_info | wizbee_info | btree_tv
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

# ── Load .env ─────────────────────────────────────────────────────────────────
if [[ -f "$ENV_FILE" ]]; then
  set -o allexport
  # shellcheck source=/dev/null
  source "$ENV_FILE"
  set +o allexport
fi

# ── Helpers ───────────────────────────────────────────────────────────────────
usage() {
  sed -n '/^# Usage:/,/^# =====/p' "$0" | sed 's/^# //' | sed 's/^#//'
  exit 1
}

require_var() {
  if [[ -z "${!1:-}" ]]; then
    echo "ERROR: required variable '$1' is not set. Check .env or environment."
    exit 1
  fi
}

resolve_site() {
  local site="$1"
  case "$site" in
    btree_info)
      PKG_DIR="$ROOT_DIR/packages/btree_info"
      PKG_FILTER="@btree/info"
      STORAGE_ZONE_NAME="${BTREE_INFO_STORAGE_ZONE_NAME:-}"
      STORAGE_PASSWORD="${BTREE_INFO_STORAGE_PASSWORD:-}"
      PULL_ZONE_ID="${BTREE_INFO_PULL_ZONE_ID:-}"
      ;;
    wizbee_info)
      PKG_DIR="$ROOT_DIR/packages/wizbee_info"
      PKG_FILTER="wizbee_info"
      STORAGE_ZONE_NAME="${WIZBEE_INFO_STORAGE_ZONE_NAME:-}"
      STORAGE_PASSWORD="${WIZBEE_INFO_STORAGE_PASSWORD:-}"
      PULL_ZONE_ID="${WIZBEE_INFO_PULL_ZONE_ID:-}"
      ;;
    btree_tv)
      PKG_DIR="$ROOT_DIR/packages/btree_tv"
      PKG_FILTER="btree_tv"
      STORAGE_ZONE_NAME="${BTREE_TV_STORAGE_ZONE_NAME:-}"
      STORAGE_PASSWORD="${BTREE_TV_STORAGE_PASSWORD:-}"
      PULL_ZONE_ID="${BTREE_TV_PULL_ZONE_ID:-}"
      ;;
    *)
      echo "ERROR: unknown site '$site'. Choose: btree_info | wizbee_info | btree_tv"
      exit 1
      ;;
  esac
  BASE_URL="https://storage.bunnycdn.com/${STORAGE_ZONE_NAME}/"
}

# ── Commands ──────────────────────────────────────────────────────────────────

cmd_purge() {
  local site="$1"
  resolve_site "$site"
  require_var BUNNY_API_KEY
  require_var PULL_ZONE_ID

  echo "→ Purging CDN cache for $site (pull zone $PULL_ZONE_ID)..."
  curl -s -X POST "https://api.bunny.net/pullzone/${PULL_ZONE_ID}/purgeCache" \
    -H "AccessKey: ${BUNNY_API_KEY}" --fail
  echo "✓ Cache purged."
}

cmd_upload() {
  local site="$1"
  resolve_site "$site"
  require_var STORAGE_ZONE_NAME
  require_var STORAGE_PASSWORD
  require_var BUNNY_API_KEY
  require_var PULL_ZONE_ID

  local dist_dir="$PKG_DIR/dist"
  if [[ ! -d "$dist_dir" ]]; then
    echo "ERROR: dist/ not found at $dist_dir. Run build first."
    exit 1
  fi

  echo "→ Listing existing files in storage zone '$STORAGE_ZONE_NAME'..."
  curl -s -w "\nHTTP_CODE:%{http_code}" \
    -H "AccessKey: ${STORAGE_PASSWORD}" "${BASE_URL}" > /tmp/bunny_response.txt

  local http_code
  http_code=$(grep "HTTP_CODE:" /tmp/bunny_response.txt | cut -d: -f2)
  if [[ "$http_code" != "200" ]]; then
    echo "ERROR: Failed to list storage (HTTP $http_code). Check credentials."
    exit 1
  fi

  echo "→ Deleting existing files..."
  grep -o '"ObjectName":"[^"]*"' /tmp/bunny_response.txt | cut -d'"' -f4 > /tmp/bunny_objects.txt || true
  if [[ -s /tmp/bunny_objects.txt ]]; then
    while IFS= read -r name; do
      local suffix=""
      if grep -q "\"ObjectName\":\"$name\".*\"IsDirectory\":true" /tmp/bunny_response.txt; then
        suffix="/"
      fi
      curl -s -X DELETE -H "AccessKey: ${STORAGE_PASSWORD}" "${BASE_URL}${name}${suffix}"
    done < /tmp/bunny_objects.txt
  fi

  echo "→ Uploading files from $dist_dir..."
  (cd "$dist_dir" && find . -type f) > /tmp/bunny_files.txt
  while IFS= read -r file; do
    local path="${file#./}"
    echo "  ↑ $path"
    curl -s -X PUT "${BASE_URL}${path}" \
      -H "AccessKey: ${STORAGE_PASSWORD}" \
      --data-binary "@${dist_dir}/${path}" --fail
  done < /tmp/bunny_files.txt

  echo "→ Purging CDN cache..."
  curl -s -X POST "https://api.bunny.net/pullzone/${PULL_ZONE_ID}/purgeCache" \
    -H "AccessKey: ${BUNNY_API_KEY}" --fail
  echo "✓ Upload + cache purge complete for $site."
}

cmd_deploy() {
  local site="$1"
  resolve_site "$site"

  echo "→ Building $site..."
  (cd "$ROOT_DIR" && pnpm --filter "$PKG_FILTER" build)

  cmd_upload "$site"
}

cmd_list() {
  local site="$1"
  resolve_site "$site"
  require_var STORAGE_ZONE_NAME
  require_var STORAGE_PASSWORD

  echo "→ Files in storage zone '$STORAGE_ZONE_NAME':"
  curl -s -H "AccessKey: ${STORAGE_PASSWORD}" "${BASE_URL}" \
    | grep -o '"ObjectName":"[^"]*"' | cut -d'"' -f4 | sort
}

# ── Entry point ───────────────────────────────────────────────────────────────
CMD="${1:-}"
SITE="${2:-}"

if [[ -z "$CMD" || -z "$SITE" ]]; then
  usage
fi

case "$CMD" in
  purge)  cmd_purge "$SITE" ;;
  deploy) cmd_deploy "$SITE" ;;
  upload) cmd_upload "$SITE" ;;
  list)   cmd_list "$SITE" ;;
  *)      echo "ERROR: unknown command '$CMD'"; usage ;;
esac
