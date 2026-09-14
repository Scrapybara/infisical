#!/usr/bin/env bash

set -euo pipefail
source "$(dirname "$0")/lib.sh"

ensure_local_config
cd "$REPO_ROOT"

before=$(date +%s)
"${COMPOSE[@]}" pull db redis nginx
"${COMPOSE[@]}" build backend frontend
preview_input_hash >"$PREVIEW_STAMP"
printf 'Built preview images in %ss (inputs %s).\n' "$(( $(date +%s) - before ))" "$(cat "$PREVIEW_STAMP")"
