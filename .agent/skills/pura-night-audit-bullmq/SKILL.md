---
name: pura-night-audit-bullmq
description: Implements and evolves the PURA Night Audit workflow using BullMQ/Redis safely (businessDate rollover, room/fixed charge posting, discrepancy tracking, report archiving, idempotency, retries). Use when editing apps/api/src/night-audit/**, financial posting logic, or web UI that triggers/polls night audit.
---

# PURA Night Audit + BullMQ Skill

Night Audit is a **safety-critical batch workflow**. This skill is a playbook for adding/changing it without breaking accounting correctness.

## Where it lives (current repo)

- API wiring + Redis config: `apps/api/src/app.module.ts` (BullModule.forRoot)
- Night Audit implementation:
  - `apps/api/src/night-audit/night-audit.service.ts`
  - `apps/api/src/night-audit/night-audit.processor.ts`
- Data model: `packages/database/prisma/schema.prisma` (`NightAudit`, `AuditError`, `ReportArchive`, financial tables)

## Core invariants

- **Business date is the primary key** for the night audit run.
- **Idempotent posting**: re-running should not double-post room charges/fixed charges.
- **Immutable financial facts**: night audit posts by _adding_ transactions, never rewriting prior facts.
- **Auditability**:
  - record who triggered the run
  - record start/end timestamps
  - capture errors/discrepancies
  - archive reports for historical lookup

## Recommended API contract

Even if endpoints differ today, prefer this shape when adding new ones:

- `POST /night-audit/run` with `{ businessDate }`
  - enqueues BullMQ job
  - returns `{ nightAuditId | businessDate, status }`
- `GET /night-audit/:businessDate/status`
  - returns status + progress summary + errors count

## Processor design (BullMQ)

### Job payload

Minimum:

- `businessDate` (date-only semantics)
- `triggeredBy` (user id)
- optional flags (dry-run, reports-only) if needed

### Steps (typical)

1. **Pre-checks** (fast fail)
   - detect already completed run for businessDate
   - ensure required configs exist (rates, transaction codes)
2. **Posting**
   - room charges
   - fixed/recurring charges
   - deposits transfers (if applicable)
3. **Reconciliation**
   - compute totals
   - detect discrepancies
4. **Report generation + archive**
   - write `ReportArchive` records with data + summary
5. **Close day**
   - mark `NightAudit.status = COMPLETED`

### Idempotency strategies (pick at least one)

- **DB uniqueness guard**:
  - per businessDate + postingType, record “posted marker”
  - or ensure transaction reference keys are unique for that businessDate
- **NightAudit state machine**:
  - if `COMPLETED`, block re-run or run in “correction mode” only
- **Deterministic transaction references**:
  - references include `(businessDate, roomId, postingKind)` so duplicates are detectable

## Error handling & retries

- Prefer capturing failures into `AuditError` (persisted) and marking status `FAILED` with details.
- Retries:
  - safe only if idempotency is enforced
  - otherwise disable retries or scope retries to safe steps

## Web UI integration

When adding the UI:

- Trigger run with a confirm dialog (include businessDate).
- Poll status endpoint with React Query until completed/failed.
- Display:
  - progress state
  - summary totals
  - link to archived reports by businessDate

## Test requirements (minimum)

- Processor spec proves:
  - idempotency (run twice → no double posting)
  - failure path writes `AuditError` and status transitions correctly
- Service/controller specs prove:
  - enqueue called with correct payload
  - status endpoint returns stable schema

## Done checklist

- [ ] BusinessDate handled as date-only (no timezone drift)
- [ ] Idempotency strategy implemented and tested
- [ ] ReportArchive is populated
- [ ] Errors are persisted (AuditError) and visible via status endpoint
