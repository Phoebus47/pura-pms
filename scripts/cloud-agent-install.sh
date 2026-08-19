#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

install_postgres_redis() {
  if command -v psql >/dev/null 2>&1 && command -v redis-server >/dev/null 2>&1; then
    return 0
  fi
  local attempt
  for attempt in 1 2 3 4 5; do
    sudo apt-get update -y
    if sudo DEBIAN_FRONTEND=noninteractive apt-get install -y --fix-missing \
      --no-install-recommends postgresql postgresql-contrib redis-server; then
      return 0
    fi
    echo "apt install failed (attempt ${attempt}), retrying..." >&2
    sleep $((attempt * 5))
  done
  echo "Failed to install PostgreSQL and Redis" >&2
  return 1
}

install_postgres_redis

corepack enable
corepack prepare pnpm@10.0.0 --activate
pnpm install --frozen-lockfile
pnpm rebuild @prisma/client @prisma/engines prisma @swc/core esbuild \
  msgpackr-extract unrs-resolver || true
pnpm --filter @pura/database exec prisma generate
pnpm --filter @pura/database build
