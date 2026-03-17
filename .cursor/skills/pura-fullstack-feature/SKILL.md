---
name: pura-fullstack-feature
description: Implements a PURA PMS feature end-to-end across Prisma (@pura/database), NestJS API (DTO/service/controller/tests), and Next.js Web (pages/components/hooks/api client/tests). Use when adding or changing a domain module like properties/rooms/guests/reservations/folios/financial/night-audit, when the user asks for “end-to-end” changes, or when touching financial/audit flows (businessDate, immutable transactions, USALI).
---

# PURA Full‑Stack Feature Workflow

This skill is a **repeatable workflow** for making correct, consistent changes in this monorepo:

- `packages/database` (Prisma schema + seed/tests)
- `apps/api` (NestJS modules + DTO validation + Prisma access + BullMQ jobs)
- `apps/web` (Next.js pages + TanStack Query + Zustand + API client layer)

Keep changes **small and verifiable**. Prefer reusing existing patterns in the repo over inventing new ones.

## Quick start checklist

Copy/paste this checklist into your scratchpad and check items off while working:

- [ ] Identify the **domain** (properties/rooms/guests/reservations/folios/financial/night-audit/auth/users).
- [ ] Identify whether this is **read-only**, **CRUD**, or **financial posting**.
- [ ] Confirm which **DB models** are involved (`packages/database/prisma/schema.prisma`).
- [ ] Confirm which **API module** owns it (`apps/api/src/<module>`).
- [ ] Confirm which **Web route(s)** and **components** own it (`apps/web/src/app/**`, `apps/web/src/components/**`).
- [ ] Implement changes in this order (default):
  - [ ] Database schema + seed/test (if needed)
  - [ ] API DTO/service/controller + tests
  - [ ] Web API client + hooks + UI + tests
- [ ] Run the narrowest tests that prove correctness (unit/integration first).

## Hard rules (PURA‑specific)

- **No hardcoded user-facing text** in Web UI. Use the project i18n approach (see `docs/guidelines/coding_standards.md §15`).
- **Financial immutability**: never delete or mutate posted financial transactions; void/correction patterns only (see `docs/guidelines/coding_standards.md §1, §14`).
- **Business Date vs System Date**: for audit/financial flows, carry `businessDate` explicitly and treat `createdAt` as system timestamp.
- **API validation**: every write endpoint uses DTOs with `class-validator`, with global ValidationPipe already enabled (`apps/api/src/main.ts`).
- **Jobs**: long-running work (Night Audit, report generation, bulk posting) should be backgrounded via BullMQ/Redis (`apps/api/src/app.module.ts`).
- **Testing conventions**:
  - Web: `*.test.ts(x)` co-located (Vitest + React Testing Library)
  - API: `*.spec.ts` co-located (Vitest + @nestjs/testing)
  - Web e2e: `apps/web/e2e/**/*.spec.ts` (Playwright)

## Step-by-step workflow

### 1) Database (Prisma) changes (only if needed)

1. Edit `packages/database/prisma/schema.prisma`.
2. Prefer **additive, non-destructive** changes:
   - Add new models/fields
   - Add new enums
   - Add indexes for query patterns
3. For financial/audit models:
   - Include `businessDate` where accounting day matters
   - Include linkage fields needed for audit trails (reason codes, related transaction id, user/shift/nightAudit linkage)
4. Update seed if needed:
   - `packages/database/prisma/seed.mts`
   - `packages/database/prisma/seed-financial.ts`
5. Add/adjust database tests (Vitest) near the schema utilities under `packages/database/prisma/*.test.ts`.

### 2) API (NestJS) changes

**Where code lives**

- Module folder: `apps/api/src/<module>/`
- DTOs: `apps/api/src/<module>/dto/*.dto.ts`
- Controller: `apps/api/src/<module>/<module>.controller.ts`
- Service: `apps/api/src/<module>/<module>.service.ts`

**Implementation pattern**

1. **DTOs first** (request/response shapes):
   - Use `class-validator` decorators.
   - Keep DTOs aligned with Prisma model semantics (nullable vs required).
2. **Service**:
   - Business logic here (not controller).
   - Use Prisma via the repo’s PrismaService (from `PrismaModule`).
   - For multi-step writes, use transactions (`prisma.$transaction`) where appropriate.
   - For financial writes, enforce immutability and reason code constraints.
3. **Controller**:
   - Thin layer: routing + auth guard + calling service.
   - Use appropriate HTTP status codes.
4. **Tests**:
   - Add/update `*.service.spec.ts` and `*.controller.spec.ts`.
   - Cover: validation failures, not-found, conflict (availability), and auth where relevant.

**When to use BullMQ**

- If work is heavy or time-consuming (Night Audit, report generation, bulk ledger posting):
  - Enqueue in service.
  - Implement processor in `apps/api/src/night-audit/*` or a new module `*/processor.ts`.

### 3) Web (Next.js) changes

**Where code lives**

- Routes/pages: `apps/web/src/app/**`
- Components: `apps/web/src/components/**`
- Hooks: `apps/web/src/hooks/**`
- API clients: `apps/web/src/lib/api/**` (entry: `client.ts`, barrel: `index.ts`)

**Implementation pattern**

1. Update or add a domain API client:
   - Use `apiClient.get/post/patch/delete` from `apps/web/src/lib/api/client.ts`.
   - Keep endpoints consistent with API controllers.
2. Add/adjust a hook for server state:
   - Use TanStack Query patterns (query keys should be stable and typed).
3. Build UI:
   - Prefer server components by default; use client components for interactivity.
   - Use existing `components/ui/*` primitives and shared layouts (`AppLayout`).
4. Tests:
   - Co-locate `*.test.tsx` with pages/components.
   - Prefer behavior-focused tests (RTL): `getByRole`, `getByLabelText`.
   - Mock API client or use the mock API router when appropriate.

## Validation loop (do this before declaring “done”)

- [ ] Type check relevant package(s): `pnpm type-check` (or `pnpm --filter web type-check`, `pnpm --filter api type-check`)
- [ ] Run narrow tests:
  - Web: `pnpm --filter web test`
  - API: `pnpm --filter api test`
  - Database: `pnpm --filter database test`
- [ ] If you changed financial logic, add at least one test proving:
  - cannot mutate/delete posted transactions
  - businessDate rules enforced
  - void/correction behavior is correct

## Additional resources (read only when needed)

- Detailed checklists and templates: [reference.md](reference.md)
- Examples (mini “recipes”): [examples.md](examples.md)
