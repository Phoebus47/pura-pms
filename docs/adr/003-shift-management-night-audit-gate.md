# ADR 003: Shift management (property + businessDate) and Night Audit OPEN gate

- **Status**: Accepted
- **Date**: 2026-08-14
- **Owners**: @Architect
- **Deciders**: @Architect, @PM
- **Related**:
  - `docs/planning/current-sprint.md` (P3-PR1)
  - `docs/planning/phase-3-closeout.md` (P3-PR1)
  - `docs/adr/001-posting-model-tax-service-split.md`
  - `docs/adr/002-night-audit-idempotency-status-report-archive.md`
  - `packages/database/prisma/schema.prisma` (`Shift`, `FolioTransaction.shiftId`, `Property.businessDate`)
  - `apps/api/src/folios/folios.service.ts` (`postTransaction` / `voidTransaction`)
  - `apps/api/src/night-audit/night-audit.service.ts` (`startAudit`)

## Context

Phase 3 WP4 posting and WP5 Night Audit are live. Cashiers still cannot open, close, or reconcile a drawer. The Prisma `Shift` model exists but has **no Nest module**, **no `propertyId`**, **no `businessDate`**, and `FoliosService.postTransaction` / `voidTransaction` do **not** set `FolioTransaction.shiftId`.

Night Audit `startAudit` today (ADR 002, still the code):

1. If `NightAudit.status === COMPLETED` → `ALREADY_COMPLETED` (no enqueue)
2. If `IN_PROGRESS` → `ALREADY_IN_PROGRESS` (no enqueue)
3. Else upsert `IN_PROGRESS` and enqueue BullMQ `jobId` `night-audit:${propertyId}:${YYYY-MM-DD}`

Room posts use `userId: 'SYSTEM'` and must stay shiftless.

Constraints:

- Folio money is immutable (ADR 001): void/correction rows, never rewrite amounts.
- Hotel accounting date is `Property.businessDate`, not system `createdAt` / `startTime`.
- `User` has **no** `propertyId`. Shift cannot inherit property from the cashier user.
- `amountTotal` is a positive magnitude; `sign` is `+1` (charge) or `-1` (payment/deposit/refund).
- Seed cash code is `9000` Cash Payment (`packages/database/prisma/seed-data.json`). Do not add `isCash` on `TransactionCode`.
- Prisma stays `^6.19.2`. No `ShiftsModule` in `apps/api/src/app.module.ts` today.
- `NightAuditModule` already imports `FoliosModule`. `PrismaModule` is `@Global()`.

## Decision

### 1. Shift is scoped to property + businessDate

Additive fields on `Shift` (this PR):

| Field                                                                  | Persistence                  | Notes                               |
| ---------------------------------------------------------------------- | ---------------------------- | ----------------------------------- |
| `propertyId`                                                           | **required** FK → `Property` | NA gate + posting attach            |
| `businessDate`                                                         | **required** `@db.Date`      | Cashier hotel date, not `startTime` |
| `expectedCash`                                                         | nullable until close         | Snapshot on close only              |
| `closedBy`, `managerApprovedBy`, `managerApprovedAt`, `varianceReason` | optional                     | Close / approve audit               |
| `handoverToUserId`, `handoverFromShiftId`                              | optional strings             | No Prisma self-relation (YAGNI)     |

Keep: `shiftNumber @unique`, `openingCash`, `closingCash`, `cashVariance`, `ShiftStatus` (`OPEN` / `CLOSED` / `BALANCED`), `transactions Transaction[]` (legacy — do not drop), `folioTransactions`.

Indexes: `@@index([propertyId, businessDate, status])`, `@@index([userId, status])`, `FolioTransaction @@index([shiftId])`.

`Property.shifts Shift[]`. FK `onDelete: Restrict` (do not cascade-delete cashier history).

**Open identity:** `businessDate` = `Property.businessDate`. Optional DTO date is allowed only when it **equals** the property’s current date (reject opening onto a past audited date). `startTime` / `endTime` remain system timestamps.

**One OPEN per user (global).** A property may have several OPEN shifts (multiple cashiers). Enforce in service (409); partial unique index is optional.

**`shiftNumber`:** generate globally unique values that include a property fragment, e.g. `SH-{YYYYMMDD}-{propertyIdSuffix}-{n}`, so two hotels cannot collide on `SH-20260814-1`.

### 2. Migration: required FKs without failing on orphan rows

The `Shift` table has no API writers; production is expected empty. `User` still has no `propertyId`, so existing rows (dev/seed leftovers) cannot be mapped user→property.

SQL strategy (Prisma `^6.19.2` migration under `packages/database/prisma/migrations/`):

1. Add `propertyId` and `businessDate` **nullable**, plus the other additive columns.
2. Backfill `propertyId` from `(SELECT id FROM "Property" ORDER BY "createdAt" ASC LIMIT 1)` for any remaining nulls.
3. Backfill `businessDate` from that property’s `businessDate`, else `"startTime"::date`.
4. `DELETE FROM "Shift" WHERE "propertyId" IS NULL` (no Property rows at all — those shifts cannot be valid).
5. `SET NOT NULL` on `propertyId` and `businessDate`, then add FK + indexes.

If multiple properties exist and orphan shifts are present, they land on the oldest property. That is a one-time data repair, not a reason to keep the columns optional. Operators with leftover rows must verify after migrate.

Do **not** add `User.propertyId` in this PR.

### 3. Cashier posts attach `shiftId`; SYSTEM posts stay null

In `FoliosService.postTransaction` / `voidTransaction` (correction **row only** — do not change the original’s `shiftId`):

- If `dto.userId === 'SYSTEM'` → leave `shiftId` null (Night Audit room post in `night-audit.service.ts`).
- Else resolve `propertyId` via `folio → reservation → room.propertyId` (same path as DRR in `apps/api/src/financial/reports.service.ts`). For void, walk `original.window → folio → reservation → room`.
- Find the caller’s `OPEN` shift for `{ userId, propertyId }`. Do **not** require `shift.businessDate === FolioTransaction.businessDate` (drawer = who was on duty; folio date remains ADR 001).
- If none → `400 BadRequest`. Optional DTO `shiftId` is YAGNI — always resolve server-side.
- All cashier posts/voids attach (not only `9000`). Expected cash still uses `9000` only.

Shift close / approve / handover **never** `UPDATE` `FolioTransaction` monetary fields or `shiftId`. Folio remains append-only (void flags + correction rows per ADR 001).

### 4. Expected cash (drawer direction, not folio sign)

Seed code `9000` is `PAYMENT`. `postTransaction` stores **positive** `amountTotal` and `sign = -1`.

Drawer cash-in is `+amountTotal`, **not** `amountTotal * sign` (that would subtract cash received and break recon).

Void of a payment creates a correction with **inverted** `sign` (`+1`) on the **voiding cashier’s** OPEN shift. The original row stays on the posting shift (and may later have `isVoid=true`). Therefore **do not** filter `isVoid` when summing a shift’s drawer, and **do not** sum “all non-void 9000 PAYMENT `amountTotal`” (that would include the correction as cash-in).

```
cashIn  = Σ amountTotal  where trxCode.code = '9000' AND sign = -1  (this shiftId)
cashOut = Σ amountTotal  where trxCode.code = '9000' AND sign = +1  (this shiftId)
expectedCash = openingCash + cashIn - cashOut
```

Equivalent: `openingCash + Σ (amountTotal * -sign)` for `9000` rows on this shift. Use one form only; do not apply `sign` twice.

Ignore other codes (`9001` card, room `1000`, …). They do not hit the cash drawer.

**When to persist:** compute live on `GET /shifts/:id` and `GET /shifts/current` while `OPEN`. On close, persist `expectedCash`, `closingCash`, `cashVariance = closingCash - expectedCash` (compare at 2 decimal places, same `round2` as posting). After close, GET returns the snapshot — do not recompute into a different answer.

### 5. Status machine and approval

```
OPEN ──close variance=0──► BALANCED
OPEN ──close variance≠0──► CLOSED ──manager approve──► BALANCED
OPEN ──handover──► (this shift CLOSED or BALANCED) + new OPEN for toUserId
```

- Close requires `closingCash`. Nonzero variance requires `varianceReason`. Cannot close twice. Cannot post to `CLOSED` / `BALANCED`.
- Handover is one Prisma `$transaction`: close current (same variance rules) then open successor with `openingCash = countedCash`, same `propertyId` / `businessDate`, `handoverFromShiftId` set. Target user must not already have an OPEN shift. Nonzero variance on the outgoing shift does **not** block opening the successor (approval is a manager problem).
- **No reopen. No delete.**
- Approve: only `CLOSED` with nonzero variance → `BALANCED`. Caller needs `User.role.permissions` includes `'ALL'` or optional `'SHIFT_APPROVE'`.
- **Self-approve:** reject (403) when approver `userId === shift.userId`, **except** Super Admin (`permissions` includes `'ALL'`). Super Admin **may** always self-approve so the single-user seed (`admin@pura.com` / Super Admin) works. Do **not** count “other managers” — `User` is not property-scoped; a global count is fragile and YAGNI. `'SHIFT_APPROVE'` without `'ALL'` cannot self-approve.

### 6. Night Audit OPEN gate — after ADR 002 short-circuits

`startAudit` order (this is compatible with ADR 002; it only adds a check on the enqueue path):

1. If audit `COMPLETED` → return `ALREADY_COMPLETED`. **Do not** inspect shifts. **Do not** enqueue.
2. If audit `IN_PROGRESS` → return `ALREADY_IN_PROGRESS`. **Do not** inspect shifts. **Do not** enqueue.
3. If `shift.count({ propertyId, businessDate, status: OPEN }) > 0` → `400 BadRequest`. **Do not** upsert. **Do not** enqueue.
4. Else upsert `IN_PROGRESS` and enqueue with the same deterministic `jobId`.

`CLOSED` (unapproved variance) and `BALANCED` do **not** block Night Audit.

`COMPLETED` + leftover `OPEN` on that date is a **data bug**. Retries must still return `ALREADY_COMPLETED` (idempotent). Putting the OPEN gate first would 400 a completed date and break ADR 002. Putting it before `IN_PROGRESS` would 400 an already-queued run instead of `ALREADY_IN_PROGRESS`.

Do not change posting-level skip, `jobId`, processor, room posting, or date roll. SYSTEM posts remain `shiftId` null.

Query `prisma.shift.count` inside `NightAuditService` — do not inject `ShiftsService`.

### 7. Module boundaries — no Folios ↔ Shifts cycle

- New `ShiftsModule` registered in `AppModule`. JwtAuthGuard on shift routes (same as reservations).
- `FoliosService` and `NightAuditService` look up OPEN shifts / counts via **Prisma**, not `ShiftsService`.
- Do **not** import `ShiftsModule` into `FoliosModule` or `NightAuditModule`.
- `ShiftsService` is exported only if a future module needs it; P3-PR1 does not.

### 8. HTTP contract and Nest routing

| Method | Path                   | Notes                                         |
| ------ | ---------------------- | --------------------------------------------- |
| `POST` | `/shifts`              | Open. 201. 409 if user already OPEN.          |
| `GET`  | `/shifts/current`      | Query `propertyId`, `userId`. OPEN or 404.    |
| `GET`  | `/shifts`              | Query `propertyId`, `businessDate`. Day list. |
| `GET`  | `/shifts/:id`          | Shift + cash summary (`9000` lines + counts). |
| `POST` | `/shifts/:id/close`    | `closingCash` + optional reason.              |
| `POST` | `/shifts/:id/approve`  | Manager `userId`.                             |
| `POST` | `/shifts/:id/handover` | `toUserId`, `countedCash`.                    |

**Nest declaration order:** `@Get('current')` **must** be registered **before** `@Get(':id')`. Otherwise `current` is captured as `id` (same pattern as `reservations.controller.ts` `@Get('calendar')` before `@Get(':id')`).

## Rationale

- **Correctness:** Drawer math follows cash in/out, not folio balance sign. Close snapshots expected cash and never mutates posts (USALI / ADR 001).
- **businessDate:** Shifts and Night Audit share the hotel date. System clocks do not define the cashier day.
- **Idempotency:** OPEN gate is a pre-enqueue operator check. ADR 002 short-circuits stay first so retries and in-flight jobs do not change meaning.
- **Maintainability:** Prisma lookups avoid a Nest circular import (`NightAuditModule` → `FoliosModule` already exists).
- **Operability:** Super Admin self-approve unblocks the seeded single user without a fake second manager.

## Consequences

### Positive

- Cashiers can recon against live Night Audit.
- Folio immutability and NA idempotency stay intact.
- Expected cash is testable from `9000` rows + `sign` without a new flag.

### Negative / risks

- Orphan `Shift` rows in a multi-property DB backfill onto the oldest property.
- `COMPLETED`+`OPEN` is not auto-repaired (operational close on the old date, or leave it; NA retry stays completed).
- Requiring an OPEN shift for **all** cashier posts (not only cash) will 400 billing until a shift is opened — intentional.

### Mitigations

- Migration backfill + delete-if-no-property so `NOT NULL` cannot fail the deploy.
- Tests: COMPLETED short-circuit does not call `shift.count`; OPEN gate prevents enqueue; `IN_PROGRESS` unchanged.
- i18n toast `shifts.noOpenShift` on billing 400 (no auto-open).

## Alternatives considered

1. **Inject `ShiftsService` into `FoliosService`** — Rejected: circular with any future reverse import; Prisma is already global.
2. **OPEN gate before COMPLETED / IN_PROGRESS** — Rejected: breaks ADR 002 retry semantics.
3. **Require `BALANCED` (approved) before NA** — Rejected: variance is a manager problem; room posting must not wait on approval (PM YAGNI).
4. **`isCash` on `TransactionCode`** — Rejected: seed `9000` is enough for P3-PR1.
5. **Sum `amountTotal * sign` for expected cash** — Rejected: PAYMENT sign is `-1`; that empties the drawer when cash comes in.
6. **Sum non-void `9000` `amountTotal` only** — Rejected: void corrections (`sign = +1`, `isVoid = false`) would count as cash-in; cross-shift voids would debit the wrong drawer.
7. **Count other managers before allowing Super Admin self-approve** — Rejected: `User` has no property; count is global and races. `'ALL'` exception is enough for seed.
8. **Add `User.propertyId` in this PR** — Rejected: out of epic; open DTO and folio→room already supply property.
9. **Prisma self-relation for handover** — Deferred: string ids keep the diff small.

## Implementation notes

- **Files to change (P3-PR1, not this ADR):**
  - `packages/database/prisma/schema.prisma` + new migration
  - `apps/api/src/shifts/*` (new module)
  - `apps/api/src/app.module.ts` (register `ShiftsModule`)
  - `apps/api/src/folios/folios.service.ts` (attach `shiftId`; no new DTO field)
  - `apps/api/src/night-audit/night-audit.service.ts` (`startAudit` step 3)
  - `apps/web/src/app/shifts/`, `lib/api/shifts.ts`, `messages/en.json` + `th.json`, nav
- **Do not change:** Prisma major, Night Audit `jobId` / processor / date roll, `/reports`, GL/tax/FX, legacy `Transaction` drop.
- **Test plan:**
  - DB: additive columns, FKs, `FolioTransaction.shiftId` index, legacy `Transaction.shift` still compiles
  - API: open 409; expected cash 9000 vs 1000; void correction drawer-out; SYSTEM `shiftId` null; post without OPEN → 400; close 0 → `BALANCED` / ≠0 → `CLOSED`; Super Admin self-approve; staff 403; handover `$transaction`; NA `ALREADY_COMPLETED` before `shift.count`; NA 400 when OPEN and not completed; NA starts when all `CLOSED`/`BALANCED`; `jobId` unchanged
  - Web: `/shifts` open/close/handover/approve; `t('shifts.*')`; nav in more-menu; billing toast; `/reports` still stub
  - `pnpm --filter database test`, `pnpm --filter api test`, `pnpm --filter web test`
