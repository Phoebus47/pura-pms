---
name: pura-database-migrations
description: Safely updates PURA database schema and data workflows using Prisma in the monorepo (schema changes, db push/migrate, generate, seed, verification, and tests). Use when editing packages/database/prisma/schema.prisma, adding financial tables, changing indexes/constraints, or when deployments require migration steps.
---

# PURA Database Migrations (Prisma) Skill

Use this for changes in `packages/database` (Prisma + seed + DB tests) and for coordinating API/Web changes that depend on schema updates.

## Source of truth

- Prisma schema: `packages/database/prisma/schema.prisma`
- Database package: `packages/database/package.json` scripts
- API depends on Prisma client via `@pura/database` (workspace dependency)

## Non‑negotiables (PURA)

- Financial correctness first:
  - prefer additive changes
  - preserve historical data
  - enforce immutability patterns in schema where possible (void/correction, audit linkage)
- **businessDate** fields are date-only semantics (`@db.Date`) when used as accounting day.
- Add **indexes** for reporting and night audit workloads (typically `businessDate` + linkage keys).

## Workflow (local dev)

### 1) Design the change

- Identify affected models and relationships.
- Decide if you need:
  - a new model
  - a new field (nullable vs required)
  - a new enum
  - an index or unique constraint

### 2) Edit the schema

Modify `packages/database/prisma/schema.prisma`:

- Prefer additive changes.
- When adding required fields to existing models, consider:
  - default values
  - transitional nullable field + backfill step + follow-up to make required

### 3) Generate client and apply schema to DB (choose method)

PURA has scripts:

- `pnpm db:generate` (root) → `pnpm --filter database db:generate`
- `pnpm db:push` (root) → `pnpm --filter database db:push`
- `pnpm --filter database db:migrate` (dev migrations)

Rules of thumb:

- **Dev iteration / prototype**: `db:push` is fastest.
- **Production deployment**: prefer `prisma migrate` and `prisma migrate deploy` (see `DEPLOYMENT.md`).

### 4) Seed and verify

Use existing scripts (see `packages/database/package.json`):

- `pnpm --filter database db:seed`
- `pnpm --filter database db:seed-financial`
- `pnpm --filter database db:verify-seed`

When changing financial schema, update `seed-financial.ts` and add a verification step (either in `verify-seed.mts` or DB tests).

### 5) Add/adjust database tests

Where:

- `packages/database/prisma/*.test.ts`

Minimum expectations:

- constraints/uniqueness behave as intended
- relationships are correct
- financial invariants (businessDate indexes, void/correction fields exist) are covered where relevant

Run:

- `pnpm --filter database test`

## Workflow (deployment)

Follow `DEPLOYMENT.md`:

- build database package before API (`@pura/database build` generates Prisma client)
- run migrations:
  - `pnpm --filter database prisma migrate deploy`

## “Done” criteria

- [ ] Prisma schema compiles and Prisma client generates
- [ ] DB apply step completed (push/migrate)
- [ ] Seed and verify scripts still pass (when relevant)
- [ ] DB tests updated and passing
- [ ] API/Web code updated to match schema changes (types, DTOs, UI)
