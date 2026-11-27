#!/usr/bin/env bash
set -euo pipefail

: "${STORAGE_ZONE_NAME:?STORAGE_ZONE_NAME is required}"
: "${STORAGE_PASSWORD:?STORAGE_PASSWORD is required}"
: "${SITE_PUBLIC_HOST:?SITE_PUBLIC_HOST is required}"

cd "${1:?Pass the built site directory}"
test -s index.html

assets="$(mktemp)"
html="$(mktemp)"
trap 'rm -f "$assets" "$html"' EXIT

# Retain old files for open clients. Publish HTML only after its assets are
# uploaded and verified on the public host.
find . -type f ! -name '*.html' -print0 > "$assets"
find . -type f -name '*.html' ! -path './index.html' -print0 > "$html"
printf './index.html\0' >> "$html"

encode_path() {
  python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1], safe="/"))' "$1"
}

upload_file() {
  local file="$1" encoded_path="$2"
  printf 'Uploading %s\n' "${file#./}"
  curl --fail --show-error --silent \
    --retry 3 --connect-timeout 15 --max-time 120 \
    --request PUT "https://storage.bunnycdn.com/${STORAGE_ZONE_NAME}/${encoded_path}" \
    --header "AccessKey: ${STORAGE_PASSWORD}" \
    --data-binary "@${file}"
}

check_file() {
  local encoded_path="$1"
  curl --fail --show-error --silent \
    --head --connect-timeout 15 --max-time 60 \
    "https://${SITE_PUBLIC_HOST}/${encoded_path}"
}

# Bunny can accept an upload without serving it (storage replication issue).
# Re-upload a missing file, wait, and check again; stop after 3 failed checks.
verify_file() {
  local file="$1" path="$2" encoded_path="$3" checks=0
  while ! check_file "$encoded_path"; do
    checks=$((checks + 1))
    if [ "$checks" -ge 3 ]; then
      printf 'Not served on %s after %d checks, stopping before HTML: %s\n' \
        "$SITE_PUBLIC_HOST" "$checks" "$path" >&2
      return 1
    fi
    printf 'Re-uploading %s (check %d failed)\n' "$path" "$checks"
    upload_file "$file" "$encoded_path"
    sleep "${UPLOAD_RETRY_WAIT:-5}"
  done
}

while IFS= read -r -d '' file; do
  upload_file "$file" "$(encode_path "${file#./}")"
done < "$assets"

while IFS= read -r -d '' file; do
  path="${file#./}"
  verify_file "$file" "$path" "$(encode_path "$path")"
done < "$assets"

while IFS= read -r -d '' file; do
  upload_file "$file" "$(encode_path "${file#./}")"
done < "$html"
