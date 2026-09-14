#!/usr/bin/env bash

set -euo pipefail
source "$(dirname "$0")/lib.sh"

cd "$REPO_ROOT"
"${COMPOSE[@]}" stop nginx frontend backend db redis
