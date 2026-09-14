#!/usr/bin/env bash

set -euo pipefail
source "$(dirname "$0")/lib.sh"

ensure_local_config
cd "$REPO_ROOT"
"${COMPOSE[@]}" up -d --no-build --wait db redis
"${COMPOSE[@]}" ps db redis
