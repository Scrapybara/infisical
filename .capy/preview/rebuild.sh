#!/usr/bin/env bash

set -euo pipefail
source "$(dirname "$0")/lib.sh"

ensure_local_config
cd "$REPO_ROOT"

if [[ "${1:-}" == "--if-needed" ]]; then
  expected=$(preview_input_hash)
  actual=$(cat "$PREVIEW_STAMP" 2>/dev/null || true)
  if [[ "$actual" == "$expected" ]]; then
    printf 'Docker preview inputs unchanged; using images for %s.\n' "$expected"
    exit 0
  fi
fi

before=$(date +%s)
"${COMPOSE[@]}" pull db redis nginx
"${COMPOSE[@]}" build backend frontend
preview_input_hash >"$PREVIEW_STAMP"
printf 'Built preview images in %ss (inputs %s).\n' "$(( $(date +%s) - before ))" "$(cat "$PREVIEW_STAMP")"
