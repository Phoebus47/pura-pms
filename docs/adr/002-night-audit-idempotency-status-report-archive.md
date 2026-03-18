# ADR 002: Night audit idempotency, status API, and report archive

- **Status**: Accepted
- **Date**: 2026-03-18
- **Owners**: @team
- **Deciders**: @team
- **Related**: `docs/planning/current-sprint.md`, `ARCHITECTURE.md`, `apps/api/src/night-audit/*`, `packages/database/prisma/schema.prisma`

## Context

Night Audit must be safe to run in real hotel operations:

- **Idempotent**: retries must not double-post (e.g., room charges) for the same property/businessDate.
- **Observable**: UI needs to trigger a run and poll progress reliably.
- **Auditable**: failures should persist with enough detail for operators to act.
- **Archivable**: a summary report should be stored as an immutable snapshot (`ReportArchive`).

Technical constraints:

- Backend uses NestJS + Prisma + BullMQ for async work.
- Data is stored in PostgreSQL (Supabase/Render environments).
- Frontend uses Next.js + TanStack Query for polling.

Key code paths:

- `apps/api/src/night-audit/night-audit.controller.ts` (run + status endpoints)
- `apps/api/src/night-audit/night-audit.service.ts` (state, progress, report archive, date roll)
- `apps/api/src/night-audit/night-audit.processor.ts` (BullMQ worker)
- `packages/database/prisma/schema.prisma` (`NightAudit`, `AuditError`, `ReportArchive`, `Property.businessDate`)
- `apps/web/src/app/night-audit/page.tsx` (trigger + poll + status UI)

## Decision

### Data model

- Introduce `NightAudit` as the authoritative state machine for a given:
  - `propertyId` + `businessDate` (unique)
  - fields: `status` (`PENDING`/`IN_PROGRESS`/`COMPLETED`/`FAILED`), timestamps, counters
- Persist failures in `AuditError` linked to `NightAudit`:
  - `errorType`, `description`, `resolved` tracking
- Persist a run summary in `ReportArchive` linked to `NightAudit` and `Property`:
  - `reportType`, `reportName`, `businessDate`, `summary`, `data`, `generatedBy`
- Store the current hotel date on `Property.businessDate` to support date roll.

### Idempotency strategy

We apply idempotency at two layers:

1. **Queue-level**: use a deterministic BullMQ `jobId`:
   - `night-audit:${propertyId}:${YYYY-MM-DD}`
   - prevents double-enqueue for the same property/date
2. **Posting-level**: for each room posting, check for an existing `FolioTransaction`:
   - same `windowId`, `trxCodeId`, `businessDate`, and `isVoid=false`
   - if present, skip posting (safe on retry)

### API contract

- `POST /night-audit/run`
  - input: `{ propertyId, businessDate }`
  - behavior:
    - if `COMPLETED` → return `ALREADY_COMPLETED`
    - if `IN_PROGRESS` → return `ALREADY_IN_PROGRESS`
    - otherwise upsert `NightAudit` to `IN_PROGRESS` and enqueue job
- `GET /night-audit/status/:propertyId/:businessDate`
  - returns `NOT_STARTED` if no audit exists
  - otherwise returns audit with `errors` and `reports`

### Processing pipeline

BullMQ worker (`NightAuditProcessor`) executes:

- room posting (idempotent)
- generate report archive snapshot
- mark audit as `COMPLETED`
- roll `Property.businessDate` forward by 1 day

On any exception:

- write `AuditError`
- set audit to `FAILED`
- rethrow to allow queue retry policy if configured

### Web integration

- Provide a `/night-audit` UI that:
  - triggers `start`
  - polls `getStatus` while `IN_PROGRESS`
  - surfaces summary stats, errors, and archived reports

## Rationale

- **Correctness**: double-run safety is mandatory for revenue posting.
- **Operator UX**: status polling lets staff see progress and failures without logs.
- **Auditability**: `AuditError` + `ReportArchive` preserve evidence of what happened.
- **Extensibility**: pipeline can add more steps (fixed charges, reconciliations, exports) without changing the core model.

## Consequences

### Positive

- Safe retries without double-charging.
- Centralized view of audit state and artifacts.
- Reports are immutable snapshots suitable for later reconciliation.

### Negative / risks

- Requires schema alignment/migrations discipline (drift will break deploy).
- Queue idempotency alone is not enough if jobs are forced; posting-level checks must remain.
- If multiple properties are supported, defaults must not assume a single property.

### Mitigations

- Enforce unique `(propertyId, businessDate)` and index access paths.
- Keep posting-level idempotency checks in the service as a hard guard.
- Add tests for:
  - start behavior (`ALREADY_IN_PROGRESS` / `ALREADY_COMPLETED`)
  - processor error path persists `AuditError`
  - posting idempotency skip on retry

## Alternatives considered

1. **Only DB-level uniqueness guards for postings**
   - Rejected: uniqueness definitions are complex; idempotency needs explicit semantics and logging.
2. **State machine library with persisted transitions**
   - Deferred: current `status` + timestamps is enough for WP5 scope.
3. **Synchronous night audit (no queue)**
   - Rejected: long-running tasks are better suited to background processing; UI needs polling anyway.

## Implementation notes

- **Files changed**:
  - `packages/database/prisma/schema.prisma`
  - `apps/api/src/night-audit/night-audit.controller.ts`
  - `apps/api/src/night-audit/night-audit.service.ts`
  - `apps/api/src/night-audit/night-audit.processor.ts`
  - `apps/web/src/app/night-audit/page.tsx`
- **Test plan**:
  - `pnpm --filter api test`
  - `pnpm --filter web test`
