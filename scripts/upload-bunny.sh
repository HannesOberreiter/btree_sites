#!/usr/bin/env bash
set -euo pipefail

: "${STORAGE_ZONE_NAME:?STORAGE_ZONE_NAME is required}"
: "${STORAGE_PASSWORD:?STORAGE_PASSWORD is required}"

cd "${1:?Pass the built site directory}"
test -s index.html

files="$(mktemp)"
trap 'rm -f "$files"' EXIT

# Retain old files for open clients. Publish HTML only after its assets exist.
find . -type f ! -name '*.html' -print0 > "$files"
find . -type f -name '*.html' ! -path './index.html' -print0 >> "$files"
printf './index.html\0' >> "$files"

while IFS= read -r -d '' file; do
  path="${file#./}"
  encoded_path="$(python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1], safe="/"))' "$path")"
  printf 'Uploading %s\n' "$path"
  curl --fail --show-error --silent \
    --retry 3 --connect-timeout 15 --max-time 120 \
    --request PUT "https://storage.bunnycdn.com/${STORAGE_ZONE_NAME}/${encoded_path}" \
    --header "AccessKey: ${STORAGE_PASSWORD}" \
    --data-binary "@${file}"
done < "$files"
