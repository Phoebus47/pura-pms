# AGENTS.md

## Cursor Cloud specific instructions

This section captures non-obvious, durable context for running PURA PMS in the Cursor Cloud VM. Standard commands live in `README.md` and each `package.json`; only the caveats below are specific to this environment.

### Services & how to run them

PURA is a pnpm/Turborepo monorepo. The end-to-end product needs four things running:

| Service        | Command                                    | Port | Depends on        |
| -------------- | ------------------------------------------ | ---- | ----------------- |
| Web (Next.js)  | `pnpm dev:web` (or `pnpm dev` for all)     | 3000 | API               |
| API (NestJS)   | `pnpm dev:api` (or `pnpm dev` for all)     | 3001 | PostgreSQL, Redis |
| PostgreSQL     | `sudo pg_ctlcluster 16 main start`         | 5432 | —                 |
| Redis (BullMQ) | `redis-server --daemonize yes --port 6379` | 6379 | —                 |

`pnpm dev` (root, `turbo dev`) starts web + api + hardware-bridge together. The `hardware-bridge` app (port 9247, mock adapters) is optional and only needed for print/keycard/scan flows.

### Startup caveats (important)

- PostgreSQL and Redis are NOT started automatically on VM boot. Start them first with the two commands above before running `pnpm dev`, or the API will fail to connect. Verify with `redis-cli ping` (expect `PONG`) and `pg_isready`.
- PostgreSQL uses the Debian cluster layout: use `sudo pg_ctlcluster 16 main start`, NOT `pg_ctl` against `/var/lib/postgresql/16/main` (that path has no `postgresql.conf` and will fail).
- The NestJS API does NOT auto-load any `.env` file (no `ConfigModule.forRoot`); it reads `process.env` directly. Runtime env vars (`DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `JWT_SECRET`, `CORS_ORIGIN`, `NEXT_PUBLIC_*`) are exported from `~/.bashrc`, so run the API from a login shell (tmux sessions started with `bash -l`, or `bash -lc '...'`). The gitignored `apps/api/.env` mirrors these values for reference only.
- Next.js (web) DOES auto-load `apps/web/.env.local`, and Prisma CLI loads `packages/database/.env` via `prisma.config.ts`. Both files are gitignored and already created in the VM snapshot.

### Database

- Local DB: `postgresql://postgres:postgres@localhost:5432/pura` (test DB: `pura_test`).
- Seeded login: `admin@pura.com` / `admin123`.
- To (re)create schema and seed data: `pnpm --filter database db:push` then `pnpm --filter database db:seed`. Prisma client is regenerated automatically by the `postinstall` hook during `pnpm install`.
- There is no committed `.env.example` despite the README mentioning one; the env files above are the source of truth for local dev.

### Lint / test / build

- Lint: `pnpm lint` — Test: `pnpm test` (Vitest across all packages; web suite alone is ~1000 tests) — Type-check: `pnpm type-check`.
- Tests need `DATABASE_URL` / `TEST_DATABASE_URL` in the environment (provided by `~/.bashrc`) and a running PostgreSQL.
