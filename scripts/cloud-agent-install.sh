#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

prefer_ubuntu_mirror() {
  local sources=/etc/apt/sources.list.d/ubuntu.sources
  if [[ -f "$sources" ]] && grep -q 'archive.ubuntu.com' "$sources"; then
    # archive.ubuntu.com can return Cloudflare 400s in Cloud Agent builds.
    sudo sed -i \
      's|http://archive.ubuntu.com/ubuntu/|http://azure.archive.ubuntu.com/ubuntu/|g' \
      "$sources"
  fi
}

repair_apt() {
  sudo dpkg --configure -a || true
  sudo DEBIAN_FRONTEND=noninteractive apt-get -f install -y || true
}

install_postgres_redis() {
  if command -v psql >/dev/null 2>&1 && command -v redis-server >/dev/null 2>&1; then
    return 0
  fi
  prefer_ubuntu_mirror
  local attempt
  for attempt in 1 2 3 4 5; do
    sudo apt-get update -y
    repair_apt
    if sudo DEBIAN_FRONTEND=noninteractive apt-get install -y --fix-missing \
      --no-install-recommends ssl-cert postgresql postgresql-contrib redis-server; then
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
