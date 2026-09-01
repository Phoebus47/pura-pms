# AGENTS.md

## Cursor Cloud

Non-obvious context for Cloud Agents. Standard commands live in `README.md`
and each `package.json`.

Environment config is `.cursor/environment.json`:

- `install`: `scripts/cloud-agent-install.sh` — install PostgreSQL/Redis if
  missing, `pnpm install`, Prisma generate/build
- `start`: `scripts/cloud-agent-start.sh` — start PostgreSQL + Redis, write
  gitignored env files, `prisma db push` + seed
- Terminals then start API (3001) and web (3000) after root `.env` exists

### Services

| Service    | How it starts                                    | Port |
| ---------- | ------------------------------------------------ | ---- |
| Web        | environment terminal `web`                       | 3000 |
| API        | environment terminal `api`                       | 3001 |
| PostgreSQL | `scripts/cloud-agent-start.sh` (`pg_ctlcluster`) | 5432 |
| Redis      | same script (`redis-server --daemonize yes`)     | 6379 |

Use `sudo pg_ctlcluster <ver> main start`, not `pg_ctl` against
`/var/lib/postgresql/*/main` (that path has no `postgresql.conf`).

### Env

The NestJS API does not load a `.env` file (`ConfigModule.forRoot` is not
used); it reads `process.env`. Cloud terminals source root `.env` before
starting. The start script writes `.env`, `packages/database/.env`,
`apps/api/.env`, and `apps/web/.env.local`.

- Local DB: `postgresql://pura:pura@127.0.0.1:5432/pura`
- Seeded login: `admin@pura.com` / `admin123`

### Commands

- Lint: `pnpm lint`
- Test: `pnpm test`
- Type-check: `pnpm type-check`
