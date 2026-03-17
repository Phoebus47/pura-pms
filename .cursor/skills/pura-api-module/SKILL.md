---
name: pura-api-module
description: Implements or changes NestJS API modules in PURA (DTO validation, services, controllers, Prisma access, tests, and REST semantics). Use when adding endpoints, changing business rules, touching auth/guards, or updating modules under apps/api/src/**.
---

# PURA API Module (NestJS) Skill

Use this when working in `apps/api` (NestJS 11 + Prisma via `@pura/database`).

## Golden rules (PURA)

- **DTO-first**: every request body/query/params is defined and validated via DTOs (`class-validator`).
- **Service owns logic**: controllers are thin (routing + auth + calling service).
- **ValidationPipe is global**: whitelist + transform already enabled in `apps/api/src/main.ts`. Lean on it.
- **No console in server**: use the project logger (Pino / Nest logger module) when adding logging.
- **Financial immutability**: never delete or mutate posted financial transactions; use void/correction patterns.
- **Business date**: treat `businessDate` (accounting day) separately from `createdAt` (system time) for audit/financial flows.

## Project paths & patterns

- Module folder: `apps/api/src/<module>/`
- DTOs: `apps/api/src/<module>/dto/*.dto.ts`
- Controller: `apps/api/src/<module>/<module>.controller.ts`
- Service: `apps/api/src/<module>/<module>.service.ts`
- Tests (co-located): `*.controller.spec.ts`, `*.service.spec.ts`

Current module wiring: `apps/api/src/app.module.ts`

## Implementation workflow

### 1) Define the contract

- **Endpoint**: path + method + auth requirement
- **DTOs**:
  - `CreateXDto`, `UpdateXDto`, `FilterXDto` (as needed)
  - Keep optional vs required fields explicit
- **Errors**:
  - Decide on `400` vs `404` vs `409` vs `401/403`

### 2) Implement service (business logic)

- Put _all_ domain rules in the service.
- Use Prisma via injected `PrismaService`.
- Use `prisma.$transaction()` for multi-step writes where consistency matters.
- Guardrails to include when relevant:
  - **Uniqueness**: map Prisma unique constraint errors → user-friendly HTTP errors
  - **Conflicts**: availability/date overlaps → `409 Conflict`
  - **Not found**: missing foreign keys → `404 Not Found`

### 3) Implement controller (thin)

- Map routes to service methods.
- Apply guards (`JwtAuthGuard`) when required.
- Return consistent shapes; avoid leaking internal error details.

### 4) Tests (required for changes)

Create/extend co-located specs:

- `*.service.spec.ts`:
  - happy path
  - validation edge cases (via DTO/service boundary)
  - conflict/not-found branches
- `*.controller.spec.ts`:
  - verifies routing + status codes (mock service)

For flows that must work end-to-end, add/extend e2e under `apps/api/test/**`.

## REST & status code quick reference

- **GET**: 200
- **POST create**: 201
- **PATCH update**: 200
- **Validation**: 400
- **Auth**: 401/403
- **Not found**: 404
- **Domain conflict** (availability, invariants): 409

## BullMQ (async jobs) trigger

If an operation can be slow (night audit, report generation, bulk posting):

- enqueue a job in service
- process in a processor (`apps/api/src/night-audit/*` or module-local processor)
- ensure idempotency (re-run should not double-post)

## “Done” criteria

- [ ] DTOs exist and validate correctly
- [ ] Business rules live in service (not controller)
- [ ] Correct status codes for success and failure paths
- [ ] Tests updated/added and pass for the touched module
