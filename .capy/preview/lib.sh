#!/usr/bin/env bash

set -euo pipefail

readonly PREVIEW_PROJECT=infisical-preview
readonly PREVIEW_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "$PREVIEW_DIR/../.." && pwd)"
readonly PREVIEW_STAMP="$REPO_ROOT/.capy/preview/.docker-inputs.sha256"
readonly COMPOSE=(docker compose -p "$PREVIEW_PROJECT" -f "$REPO_ROOT/docker-compose.dev.yml" -f "$PREVIEW_DIR/docker-compose.preview.yml")

preview_input_hash() {
  (
    cd "$REPO_ROOT"
    {
      git ls-files -s -- \
        docker-compose.dev.yml \
        build-versions.env \
        backend \
        frontend \
        .capy/preview/docker-compose.preview.yml \
        | awk '$4 !~ /^backend\/src\// && $4 !~ /^frontend\/src\// && $4 !~ /^frontend\/public\// && $4 != "frontend/index.html"'
      git diff --no-ext-diff --binary -- \
        docker-compose.dev.yml \
        build-versions.env \
        backend \
        frontend \
        .capy/preview/docker-compose.preview.yml \
        ':(exclude)backend/src/**' \
        ':(exclude)frontend/src/**' \
        ':(exclude)frontend/public/**' \
        ':(exclude)frontend/index.html'
      while IFS= read -r -d '' path; do
        case "$path" in
          backend/src/*|frontend/src/*|frontend/public/*|frontend/index.html) continue ;;
        esac
        printf '%s\0' "$path"
        sha256sum "$path"
      done < <(git ls-files --others --exclude-standard -z -- backend frontend)
    } | sha256sum | awk '{print $1}'
  )
}

ensure_local_config() {
  cd "$REPO_ROOT"
  cp .env.dev.example .env
  cp .env.dev.example "$PREVIEW_DIR/.env"
}

wait_for_url() {
  local url=$1
  local attempts=${2:-90}
  local i
  for ((i = 1; i <= attempts; i++)); do
    if curl --fail --silent --show-error --max-time 5 "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done
  printf 'Timed out waiting for %s\n' "$url" >&2
  return 1
}
