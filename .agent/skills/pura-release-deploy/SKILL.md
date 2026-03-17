---
name: pura-release-deploy
description: Runs a production-ready release/deploy checklist for PURA across Vercel (web), Render (api), Supabase (Postgres), and Redis (BullMQ). Use when preparing a release, deploying to production/staging, changing environment variables, or when migrations must be deployed safely.
---

# PURA Release / Deploy Checklist (Vercel + Render + Supabase + Redis)

This skill is a **pre-flight + deploy + post-verify** checklist aligned with `DEPLOYMENT.md` and the monorepo build order.

## Scope

- Web: `apps/web` → Vercel
- API: `apps/api` → Render
- Database: `packages/database` → Supabase Postgres (Prisma migrations)
- Queue: Redis (BullMQ) for Night Audit / background jobs

## Pre-flight (before merging / tagging)

- [ ] **No secrets in git** (no `.env*` committed, no DSNs/keys in code)
- [ ] **Type-check**: `pnpm type-check`
- [ ] **Lint**: `pnpm lint`
- [ ] **Unit tests**: `pnpm test` (or narrow filters)
- [ ] **Format check** (optional gate): `pnpm format:check`
- [ ] **SonarQube** (if used as a gate): `pnpm sonar`
- [ ] **Docs updated** if behavior changed: `ARCHITECTURE.md` / ADRs

If changes touch financial/audit/night-audit:

- [ ] Idempotency tests exist (night audit re-run safe)
- [ ] businessDate semantics validated
- [ ] No delete/update of posted financial facts

## Build order (monorepo)

The safe order for backend deploy builds:

1. `@pura/database` build (generates Prisma client)
2. `api` build

This is reflected in `DEPLOYMENT.md` Render build command.

## Environment variables checklist

### Web (Vercel)

From `DEPLOYMENT.md`:

- [ ] `NEXT_PUBLIC_API_URL` points to Render API base URL
- [ ] `NEXT_PUBLIC_SENTRY_DSN` (optional)
- [ ] `NEXT_PUBLIC_APP_URL` (recommended for correct metadataBase)

### API (Render)

From `DEPLOYMENT.md`:

- [ ] `DATABASE_URL` points to Supabase Postgres
- [ ] `JWT_SECRET` set and rotated appropriately
- [ ] `CORS_ORIGIN` contains Vercel production + preview URLs (no trailing slash)
- [ ] `PORT` (Render usually sets)
- [ ] `SENTRY_DSN` (optional)
- [ ] `REDIS_HOST` / `REDIS_PORT` set if using managed Redis (or same Render private network)

### Supabase (DB)

- [ ] Connection string is correct and reachable from Render
- [ ] IP allowlist / network access configured as needed

### Redis (BullMQ)

- [ ] Redis reachable from API service
- [ ] Queue-dependent features verified (Night Audit trigger/progress)

## Migration deploy (production-safe)

Use Prisma migrate deploy (not db push) for production:

- [ ] Apply migrations: `pnpm --filter database prisma migrate deploy`
- [ ] Confirm schema compatibility with running API (avoid breaking changes)
- [ ] If adding required fields, use a staged rollout:
  - add nullable field → backfill → enforce required in follow-up

## Deploy steps (recommended sequence)

1. **Deploy DB migrations** (Supabase)
2. **Deploy API** (Render)
3. **Deploy Web** (Vercel)

Rationale: API/web should not run against a DB schema that’s behind (or incompatible).

## Post-deploy verification (minimum)

- [ ] Web loads and can reach API (`NEXT_PUBLIC_API_URL`)
- [ ] Auth works (login, JWT-protected endpoints)
- [ ] Core read paths:
  - properties list/detail
  - rooms list/detail
  - guests list/detail
  - reservations list/detail/calendar
- [ ] Billing paths (if enabled):
  - folio detail loads
  - post charge/payment endpoints respond
- [ ] Night Audit:
  - can enqueue job
  - job processes (Redis OK)
  - status/archives persist
- [ ] CORS: no browser CORS errors for production origin

## Rollback thinking (keep it explicit)

- Prefer **backward-compatible DB migrations** to avoid rollbacks.
- If rollback needed:
  - rollback API/web first to last known good version
  - only rollback DB if you have a tested down-migration strategy (often not worth it)
