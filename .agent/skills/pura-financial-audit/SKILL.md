---
name: pura-financial-audit
description: Builds and modifies PURA financial/audit features safely (folios, transaction codes, reason codes, shifts, night audit, report archive). Enforces businessDate rules, immutable transactions (void/corrections), USALI mappings, and uses BullMQ for long-running jobs. Use when working on apps/api financial/folios/night-audit, packages/database financial models, or web billing/reporting UI.
---

# PURA Financial & Audit Skill (Safety-Critical)

Use this skill whenever a change impacts money, audit trails, day close, or historical reporting.

## Non‑negotiables

- **Immutability**: never delete or edit posted financial facts. Use **void/correction** records.
- **Reason codes**: void/adjust/transfer actions must capture a reason (and who/when).
- **Business date**: accounting day is not server time. Carry `businessDate` explicitly.
- **Idempotency**: Night Audit and bulk posting must be safe to re-run without double posting.
- **USALI mapping**: posting must map to appropriate `TransactionCode` → GL account fields where required.

## Canonical data structures (current repo)

Source of truth: `packages/database/prisma/schema.prisma`

Key entities (current schema names):

- `TransactionCode` (classification + GL mapping)
- `Folio`, `FolioWindow`, `FolioTransaction`
- `ReasonCode`
- `Shift`
- `NightAudit`, `ReportArchive`, `AuditError`, `AuditLog`
- `GLAccount`, `JournalEntry`, `JournalLine`, `ARAccount`, `Invoice`, `TaxInvoice`, `Deposit`, `FixedCharge`, `ExchangeRate`

## Workflow (end‑to‑end)

### 1) Database layer

- Prefer additive schema changes (new fields/models/indexes).
- Ensure invariants:
  - uniqueness of running numbers where required
  - indexes on `businessDate` and linkage keys
  - linkage fields for audit (userId, shiftId, nightAuditId, relatedTrxId)
- Add/adjust DB tests in `packages/database/prisma/*.test.ts` proving constraints.

### 2) API layer (NestJS)

**Design endpoints as workflows**, not “CRUD everything”:

- Example actions:
  - post charge/payment: `POST /folios/:id/transactions`
  - void transaction: `POST /folios/transactions/:id/void`
  - close folio/day: `POST /folios/:id/close`
  - run night audit: `POST /night-audit/run` (enqueue job)

**Service rules**

- All posting logic lives in service.
- Multi-step postings use `prisma.$transaction()`.
- Enforce:
  - cannot change a transaction linked to a completed night audit (if business rule applies)
  - void/correction creates new records and links to original (do not rewrite)
  - balances are derived consistently (either recompute or update cached balance atomically)

**BullMQ jobs**

- Use BullMQ for Night Audit / batch report archive generation.
- Store job progress/status in DB (`NightAudit.status`, `AuditError`, `ReportArchive`).
- Ensure idempotency via:
  - uniqueness keys per (businessDate, postingType)
  - “already posted” markers

### 3) Web layer (Next.js)

- Use typed API client functions in `apps/web/src/lib/api/folios.ts` / `reservations.ts` / `auth.ts` etc.
- For posting/void flows:
  - require confirm dialogs
  - require reason selection when applicable
  - invalidate queries after mutation (React Query)
  - show clear toast feedback

## Test requirements (minimum)

For any financial/audit change, add tests proving:

- **immutability**: original record is unchanged; correction/void is additive
- **businessDate correctness**: postings land on intended businessDate
- **idempotency** (for jobs): re-run does not double-post

Where to test:

- API service specs: `apps/api/src/**/**.service.spec.ts`
- Processor specs (night audit): `apps/api/src/night-audit/*.spec.ts`
- DB package tests: `packages/database/prisma/*.test.ts`

## “Done” criteria

- [ ] No delete/update of posted financial facts
- [ ] businessDate explicitly handled
- [ ] reason codes enforced for sensitive actions
- [ ] job flows are idempotent (or explicitly prevented from re-run)
- [ ] tests exist for invariants
