#!/usr/bin/env bash

set -euo pipefail
source "$(dirname "$0")/lib.sh"

cd "$REPO_ROOT"
"$PREVIEW_DIR/start.sh"
"${COMPOSE[@]}" exec -T backend npm run seed-dev
