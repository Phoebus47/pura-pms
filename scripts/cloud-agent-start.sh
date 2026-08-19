#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

start_postgres() {
  if pg_isready -q 2>/dev/null; then
    return 0
  fi
  if [[ -d /usr/lib/postgresql ]]; then
    local pg_ver
    pg_ver="$(ls /usr/lib/postgresql | sort -V | tail -1)"
    sudo pg_ctlcluster "$pg_ver" main start
  else
    sudo service postgresql start
  fi
  local i
  for i in $(seq 1 30); do
    if pg_isready -q 2>/dev/null; then
      return 0
    fi
    sleep 1
  done
  echo "PostgreSQL did not become ready" >&2
  return 1
}

start_redis() {
  if redis-cli ping 2>/dev/null | grep -q PONG; then
    return 0
  fi
  sudo redis-server --daemonize yes --bind 127.0.0.1 --port 6379 --protected-mode yes
  local i
  for i in $(seq 1 20); do
    if redis-cli ping 2>/dev/null | grep -q PONG; then
      return 0
    fi
    sleep 1
  done
  echo "Redis did not become ready" >&2
  return 1
}

write_env_file() {
  local path="$1"
  cat >"$path" <<'EOF'
DATABASE_URL=postgresql://pura:pura@127.0.0.1:5432/pura
JWT_SECRET=local-dev-jwt-secret-not-for-production
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
PORT=3001
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
}

start_postgres
start_redis

sudo -u postgres psql -v ON_ERROR_STOP=1 <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'pura') THEN
    CREATE ROLE pura LOGIN PASSWORD 'pura' SUPERUSER;
  END IF;
END
$$;
SELECT 'CREATE DATABASE pura OWNER pura'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'pura')\gexec
GRANT ALL PRIVILEGES ON DATABASE pura TO pura;
SQL

write_env_file "$ROOT/.env"
write_env_file "$ROOT/.env.local"
write_env_file "$ROOT/packages/database/.env"
write_env_file "$ROOT/apps/api/.env"
printf 'NEXT_PUBLIC_API_URL=http://localhost:3001\n' >"$ROOT/apps/web/.env.local"

export DATABASE_URL="postgresql://pura:pura@127.0.0.1:5432/pura"
pnpm --filter @pura/database exec prisma db push
pnpm --filter @pura/database db:seed
