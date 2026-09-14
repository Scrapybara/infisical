#!/usr/bin/env bash

set -euo pipefail
source "$(dirname "$0")/lib.sh"

ensure_local_config
cd "$REPO_ROOT"

expected=$(preview_input_hash)
actual=$(cat "$PREVIEW_STAMP" 2>/dev/null || true)
if [[ "$actual" != "$expected" ]]; then
  printf 'Docker preview inputs changed (built=%s current=%s). Run .capy/preview/rebuild.sh first.\n' "${actual:-missing}" "$expected" >&2
  exit 1
fi

before=$(date +%s)
"${COMPOSE[@]}" up -d --no-build db redis backend frontend nginx
wait_for_url http://127.0.0.1:8080/api/status 120
wait_for_url http://127.0.0.1:8080/ 30
"${COMPOSE[@]}" ps db redis backend frontend nginx
printf 'Preview healthy in %ss: http://127.0.0.1:8080\n' "$(( $(date +%s) - before ))"
