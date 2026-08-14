# Current Sprint — Phase 3 Shift Management (PR 1)

**Theme:** Cashier shift open/close, drawer recon, handover  
**Goal:** Front-desk can open a shift, post folio cash onto that shift, close with counted cash, record variance, get manager approval, and hand over the drawer. Night Audit refuses to start while any shift for that property + businessDate is still `OPEN`.  
**Branch:** `cursor/feat-shift-management-6a5d`  
**Base:** `dev`  
**Source:** `docs/planning/prd.md` §4.6 + §12; `docs/planning/phase-3-closeout.md` P3-PR1  
**Depends on:** Folio posting (WP4) and Night Audit (WP5) — both shipped. Do not reopen Day-use (#33) or Split Stay (#39). Do not mix Phase 4 epics.

## Working agreements

- **One epic, one PR.** Conventional Commits (`feat(shifts): …`). Tests co-located. No `any`, no `console.log`. Prisma **^6.19.2** (do not bump to v7).
- **Schema already has** `Shift` (`openingCash`, `closingCash`, `cashVariance`, `ShiftStatus` `OPEN` / `CLOSED` / `BALANCED`) and `FolioTransaction.shiftId`. There is **no** Shift NestJS module today (grep is zero under `apps/api/src`).
- **Additive schema only.** Do not delete legacy `Transaction` / `Payment`. Do not drop `Shift.transactions`.
- Cash drawer expected amount uses seeded trx code **`9000` Cash Payment** (`packages/database/prisma/seed-data.json`). Do not add a new `isCash` flag on `TransactionCode` in this PR.
- Night Audit stays idempotent (same BullMQ `jobId`, same posting-level skip). The only NA change is a **pre-enqueue gate**.
- Night Audit / `userId: 'SYSTEM'` posts **must not** require or attach a shift.
- A user may have **at most one `OPEN` shift**. A property may have several open shifts (multiple cashiers).
- Manager approval: `User.role.permissions` includes `'ALL'` (seeded Super Admin). Do **not** invent a new RBAC module; optional additive permission `'SHIFT_APPROVE'` on Super Admin is allowed if it keeps the check explicit.
- No hardcoded UI copy. New strings in `apps/web/src/messages/en.json` + `th.json` (e.g. `shifts.*`). Consume via existing `t()` in `apps/web/src/lib/i18n.ts` (same Split Stay pattern). Do not build next-intl locale routing.
- Tests with the change; >80% on new critical paths.

## Invariants (do not reopen)

| Rule            | Constraint                                                                                                                                                                                                                                                                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Open            | `POST /shifts` creates `status=OPEN`, `startTime=now`, `endTime=null`. Reject if the same `userId` already has an `OPEN` shift (409).                                                                                                                                                                                                                     |
| Identity        | `propertyId` + `businessDate` required. `businessDate` = that property’s `Property.businessDate` unless the DTO sends an explicit date (must match property current date — do not open onto a past audited date).                                                                                                                                         |
| Posting         | Cashier `FoliosService.postTransaction` / `voidTransaction` set `shiftId` to the caller’s `OPEN` shift for that property. If none → 400. Skip when `userId === 'SYSTEM'`.                                                                                                                                                                                 |
| Expected cash   | `openingCash + Σ amountTotal` of non-void `FolioTransaction` on this shift where `trxCode.code === '9000'` and `type === PAYMENT`.                                                                                                                                                                                                                        |
| Variance        | `cashVariance = closingCash - expectedCash` (counted minus expected). Persist `expectedCash`.                                                                                                                                                                                                                                                             |
| Close           | `closingCash` required. `endTime=now`. If `cashVariance === 0` → `BALANCED`. If ≠ 0 → `CLOSED` (awaiting approval). Cannot close twice. Cannot post to `CLOSED`/`BALANCED`.                                                                                                                                                                               |
| Approve         | Only `CLOSED` with nonzero variance. Sets `managerApprovedBy`, `managerApprovedAt`, `status=BALANCED`. Approver ≠ shift owner unless that user has `'ALL'` **and** no other manager exists — prefer **reject self-approval** (403) except Super Admin in single-user demo (document in spec: Super Admin **may** self-approve so local seed still works). |
| Handover        | Close current (same variance rules) then open a new `OPEN` shift for `toUserId` with `openingCash = countedCash`, same `propertyId`/`businessDate`, `handoverFromShiftId` set. Target user must not already have an `OPEN` shift.                                                                                                                         |
| Night Audit     | `startAudit`: if any `Shift` for `{ propertyId, businessDate }` has `status=OPEN` → 400, **do not** enqueue. `CLOSED` (unapproved variance) does **not** block NA (variance is a manager problem, not a room-posting problem). Idempotency unchanged.                                                                                                     |
| Immutable money | Folio posts remain append-only. Shift close never updates `FolioTransaction` rows.                                                                                                                                                                                                                                                                        |

**Status machine**

```
OPEN ──close variance=0──► BALANCED
OPEN ──close variance≠0──► CLOSED ──manager approve──► BALANCED
OPEN ──handover──► (this shift CLOSED or BALANCED) + new OPEN for other user
```

No reopen. No delete.

---

## Already done (do not redo)

- [x] Prisma `Shift` + `ShiftStatus` + `User.shifts` + `FolioTransaction.shiftId` + legacy `Transaction.shiftId`
- [x] Folio posting / void (`apps/api/src/folios/folios.service.ts`) — **does not set `shiftId` yet**
- [x] Night Audit WP5 idempotent run/status/archive
- [x] Seed trx code `9000` Cash Payment
- [x] Web `t()` helper + `messages/en.json` + `th.json`
- [x] `/billing`, `/night-audit` pages

---

## 1. Step-by-step implementation order (this PR only)

1. **DB-1** Additive `Shift` fields + `Property.shifts` + `FolioTransaction` `@@index([shiftId])`. Migration. Do not bump Prisma major.
2. **DB-2** `prisma generate`.
3. **DB-3** Relations tests (open shift, folio trx → shift, cascade/restrict).
4. **BE-1** New `shifts` NestJS module: open, current, list, get-by-id (with cash summary).
5. **BE-2** Close + expected cash + variance + status.
6. **BE-3** Manager approve.
7. **BE-4** Handover.
8. **BE-5** Attach `shiftId` on folio post/void; SYSTEM skip; 400 if no open shift.
9. **BE-6** Night Audit `startAudit` OPEN-shift gate only.
10. **BE-7** Register `ShiftsModule` in `AppModule`; JwtAuthGuard on shift routes.
11. **FE-1** Types + API client + mock router.
12. **FE-2** i18n keys.
13. **FE-3** `/shifts` page: open, drawer summary, close, handover, approve.
14. **FE-4** Nav link (desktop + more-menu; do not steal primary bottom slots).
15. **FE-5** Billing: surface missing open shift on post failure (toast from messages).
16. **QA-1..QA-4** Specs per layer; type-check + lint.

---

## 2. Tasks by layer

### Database

| ID       | Task                                                                                                                                                                                                                                                                                                              | Files                                                                                                | Complexity | Status      |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------- | ----------- |
| **DB-1** | Additive fields on `Shift` (all nullable except `propertyId` + `businessDate` — table has no API writers today, so required FKs are safe). Add `Property.shifts Shift[]`. Add `@@index([shiftId])` on `FolioTransaction`. Keep `shiftNumber String @unique`. Keep `transactions Transaction[]`. Prisma `^6.19.2`. | `packages/database/prisma/schema.prisma`; new migration under `packages/database/prisma/migrations/` | Medium     | Not started |
| **DB-2** | `pnpm --filter database exec prisma generate` (and API generate if separate). Confirm client includes new Shift scalars.                                                                                                                                                                                          | `@pura/database`                                                                                     | Low        | Not started |
| **DB-3** | Relations: User → shifts; Property → shifts; Shift → folioTransactions; unique one OPEN per user (enforce in service; optional partial unique **not** required if Postgres partial unique is extra — service 409 is enough).                                                                                      | `packages/database/prisma/relations.test.ts` (or new `shift.test.ts` co-located)                     | Medium     | Not started |

**Additive `Shift` fields (this PR):**

| Field                 | Type                           | Purpose                                                                                                 |
| --------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `propertyId`          | `String` + `Property` relation | Scope to hotel; NA gate                                                                                 |
| `businessDate`        | `DateTime @db.Date`            | Cashier date ≠ system timestamp                                                                         |
| `expectedCash`        | `Decimal? @db.Decimal(12, 2)`  | Computed on close                                                                                       |
| `closedBy`            | `String?`                      | User id (string, same pattern as `FolioTransaction.userId`)                                             |
| `managerApprovedBy`   | `String?`                      | Approver user id                                                                                        |
| `managerApprovedAt`   | `DateTime?`                    | Approval time                                                                                           |
| `varianceReason`      | `String?`                      | Cashier note when variance ≠ 0                                                                          |
| `handoverToUserId`    | `String?`                      | Intended successor                                                                                      |
| `handoverFromShiftId` | `String?`                      | Prior shift id (no Prisma self-relation required if it keeps the diff small — a plain string is enough) |

Indexes: `@@index([propertyId, businessDate, status])`, `@@index([userId, status])`.

**Do not add:** payment-gateway columns, e-Tax, GL journal links, `creditLimit` on Shift.

### Backend

Proposed **new** routes (none of these exist today). Mirror existing Nest module layout (`apps/api/src/folios/`, `apps/api/src/night-audit/`).

| Method | Path                   | Behavior                                                                                            |
| ------ | ---------------------- | --------------------------------------------------------------------------------------------------- |
| `POST` | `/shifts`              | Open. Body: `propertyId`, `userId`, `openingCash`, optional `businessDate`. 201.                    |
| `GET`  | `/shifts/current`      | Query `propertyId`, `userId`. Current `OPEN` shift or 404.                                          |
| `GET`  | `/shifts`              | Query `propertyId`, `businessDate`. List for the day (handover report).                             |
| `GET`  | `/shifts/:id`          | Shift + expected/counted/variance + cash `FolioTransaction`s (`9000`) + all trx counts.             |
| `POST` | `/shifts/:id/close`    | Body: `closingCash`, `userId`, optional `varianceReason` / `notes`.                                 |
| `POST` | `/shifts/:id/approve`  | Body: `userId` (manager), optional `notes`.                                                         |
| `POST` | `/shifts/:id/handover` | Body: `toUserId`, `countedCash` (= closing of current / opening of next), `userId`, optional notes. |

| ID       | Task                                                                                                                                                                                                                                                                                                                                                                                                       | Files                                                                                                                                                                                                        | Complexity | Status      |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ----------- |
| **BE-1** | Scaffold `ShiftsModule` / controller / service / DTOs. Open: generate `shiftNumber` (`SH-{YYYYMMDD}-{n}` unique). Load `Property.businessDate`. 409 if user already `OPEN`. JwtAuthGuard on controller (same as `reservations.controller.ts`).                                                                                                                                                             | `apps/api/src/shifts/shifts.module.ts`, `shifts.controller.ts`, `shifts.service.ts`, `dto/open-shift.dto.ts`, `dto/close-shift.dto.ts`, `dto/approve-shift.dto.ts`, `dto/handover-shift.dto.ts`, `*.spec.ts` | Medium     | Not started |
| **BE-2** | Close: compute `expectedCash` from `9000` PAYMENT posts on `shiftId`; `cashVariance`; set `CLOSED` vs `BALANCED`; write `closingCash`, `endTime`, `closedBy`, `varianceReason`. Reject if not `OPEN`. Require `varianceReason` when variance ≠ 0.                                                                                                                                                          | `shifts.service.ts`                                                                                                                                                                                          | High       | Not started |
| **BE-3** | Approve: `CLOSED` → `BALANCED`; persist `managerApprovedBy` / `managerApprovedAt`. 403 if caller lacks `'ALL'` (or `'SHIFT_APPROVE'`). 400 if already `BALANCED` or still `OPEN`.                                                                                                                                                                                                                          | `shifts.service.ts`                                                                                                                                                                                          | Medium     | Not started |
| **BE-4** | Handover: single Prisma `$transaction` — close current (BE-2 rules) + create next shift for `toUserId`. Set `handoverToUserId` / `handoverFromShiftId`.                                                                                                                                                                                                                                                    | `shifts.service.ts`                                                                                                                                                                                          | High       | Not started |
| **BE-5** | `postTransaction`: after resolving folio, resolve property via `folio → reservation → room.propertyId` (same path DRR uses). Find `OPEN` shift for `dto.userId` + that `propertyId`. Set `shiftId`. If `userId === 'SYSTEM'`, leave `shiftId` null. If no open shift → `BadRequestException`. Same for `voidTransaction` correction row. Optional DTO `shiftId` is **YAGNI** — always resolve server-side. | `apps/api/src/folios/folios.service.ts`, `apps/api/src/folios/dto/post-transaction.dto.ts` (no new field unless tests need it), `folios.service.spec.ts`                                                     | High       | Not started |
| **BE-6** | `NightAuditService.startAudit`: `shift.count({ where: { propertyId, businessDate, status: 'OPEN' } })`. If > 0, throw `BadRequestException` **before** upsert/enqueue. Do not change `jobId`, processor, room posting, or date roll. `userId: 'SYSTEM'` posts remain shiftless.                                                                                                                            | `apps/api/src/night-audit/night-audit.service.ts`, `night-audit.service.spec.ts` (extend `mockPrismaService` with `shift.count`)                                                                             | Medium     | Not started |
| **BE-7** | Import `ShiftsModule` in `apps/api/src/app.module.ts`. Export `ShiftsService` only if another module needs it (folios can query Prisma directly — prefer that to avoid a circular `FoliosModule` ↔ `ShiftsModule`).                                                                                                                                                                                        | `apps/api/src/app.module.ts`, `apps/api/src/shifts/shifts.module.ts`                                                                                                                                         | Low        | Not started |
| **BE-8** | Controller + service specs: open duplicate 409; close zero vs nonzero variance; approve happy/403; handover two shifts; post attaches `shiftId`; post without shift 400; SYSTEM post null `shiftId`; NA blocked when OPEN, allowed when all CLOSED/BALANCED; NA still `ALREADY_COMPLETED` / idempotent skip.                                                                                               | `shifts.service.spec.ts`, `shifts.controller.spec.ts`, `folios.service.spec.ts`, `night-audit.service.spec.ts`                                                                                               | High       | Not started |

### Frontend

| ID       | Task                                                                                                                                                                                                                                                                                                                        | Files                                                                                                                                         | Complexity | Status      |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------- |
| **FE-1** | `Shift` types + `shiftsAPI` (open/current/list/get/close/approve/handover). Export from `apps/web/src/lib/api/index.ts`. Mock router: in-memory shifts; folio POST fails without open shift for that user.                                                                                                                  | `apps/web/src/lib/api/shifts.ts`, `shifts.test.ts`, `apps/web/src/lib/api/index.ts`, `apps/web/src/lib/api/mock/router.ts`, `mock/data.ts`    | Medium     | Not started |
| **FE-2** | Copy only: open/close/handover/approve labels, variance, no-open-shift toast, NA blocked reason — `shifts.*` in `messages/en.json` + `th.json`. Use `t()`.                                                                                                                                                                  | `apps/web/src/messages/en.json`, `th.json`, `apps/web/src/lib/i18n.ts` (no API change if `t()` already walks nested keys)                     | Low        | Not started |
| **FE-3** | Page `/shifts`: current shift card (opening, expected, status); open form (`openingCash`); close form (`closingCash`, `varianceReason`); handover (`toUserId` + counted cash); list of today’s shifts; approve button when `CLOSED` and user is admin. Inputs: `id` + `name`, labels `htmlFor`, 44px targets. Mobile-first. | `apps/web/src/app/shifts/page.tsx`, `page.test.tsx`; optional `apps/web/src/app/shifts/shifts-client.tsx`; `apps/web/src/hooks/use-shifts.ts` | High       | Not started |
| **FE-4** | Add Shifts to `navigationItems` + `moreBottomNavItems` (not `primaryBottomNavItems`). Update `navigation.test.ts`. Icon: e.g. lucide `Clock` or `Wallet`.                                                                                                                                                                   | `apps/web/src/config/navigation.ts`, `navigation.test.ts`                                                                                     | Low        | Not started |
| **FE-5** | Billing post: if API 400 no-open-shift, `toast.error(t('shifts.noOpenShift'))`. Do not auto-open a shift from billing (YAGNI). Optional small “Shift: OPEN” chip if `getCurrent` succeeds.                                                                                                                                  | `apps/web/src/app/billing/billing-client.tsx` (and folio post UI), `apps/web/src/components/folio-detail.tsx` if that is the poster           | Medium     | Not started |
| **FE-6** | Co-located RTL: open/close/variance display; approve disabled for staff; handover; a11y labels. Hook tests if non-trivial.                                                                                                                                                                                                  | `*.test.tsx`, `use-shifts.test.ts`                                                                                                            | Medium     | Not started |

### QA

| ID       | Task                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Complexity | Status      |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------- |
| **QA-1** | DB: Shift ↔ Property/User/FolioTransaction; new columns present; legacy `Transaction` relation still compiles.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Medium     | Not started |
| **QA-2** | Service matrix: open; duplicate open; close 0 variance → BALANCED; close ≠0 without reason → 400; close ≠0 with reason → CLOSED; approve → BALANCED; handover chain; post 9000 updates expected on subsequent GET; non-9000 (e.g. room charge) does not change expected cash; SYSTEM NA post has null `shiftId`; NA 400 while OPEN; NA starts when shifts BALANCED/CLOSED; existing NA `ALREADY_COMPLETED` still short-circuits **after** the gate (if OPEN, OPEN wins even if audit COMPLETED — document: gate runs first; COMPLETED+OPEN is a data bug, still refuse). Prefer: if audit `COMPLETED`, keep today’s `ALREADY_COMPLETED` **before** shift gate so retries stay idempotent. **Decision: COMPLETED check stays first (current code); then OPEN-shift gate; then enqueue.** | High       | Not started |
| **QA-3** | Web RTL + mock router. Nav includes `/shifts`. Reports page **unchanged** (still stub).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Medium     | Not started |
| **QA-4** | Gate: `pnpm --filter database test`, `pnpm --filter api test`, `pnpm --filter web test`, type-check, lint. No `any`, no `console.log`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Low        | Not started |

---

## 3. Dependencies

```
DB-1 (additive schema)
  ├─ DB-2 generate
  └─ DB-3 relations
DB-2 ──► BE-1 (open/list/get)
BE-1 ──► BE-2 (close) ──► BE-3 (approve)
BE-2 ──► BE-4 (handover)
BE-1 ──► BE-5 (folio attach shiftId)
BE-1 ──► BE-6 (NA gate uses same Shift rows)
BE-1 ──► BE-7 AppModule
BE-5 / BE-6 / BE-2 / BE-3 / BE-4 ──► BE-8 / QA-2
BE-1 ──► FE-1 ──► FE-3, FE-5
FE-2 ──► FE-3, FE-5 (copy)
FE-4 nav ──► FE-3 discoverable
FE-3 / FE-5 / FE-6 ──► QA-3
QA-4 after all of the above
```

**Blocked on DB-1:** TypeScript that reads `propertyId` / `businessDate` on `Shift`.  
**Blocked on BE-1:** Folio attach (needs an OPEN shift to point at) and NA gate.  
**Blocked on BE-5:** Honest expected cash (otherwise close always variance = −opening or 0).  
**Do not block on:** `/reports` DRR UI, GL, TaxInvoice, ExchangeRate APIs.

---

## 4. Explicit out of scope (this PR)

- e-Tax / Revenue Department API / QR generation
- Payment gateway, credit-card pre-auth, incremental bank holds
- AP / vendor PO / commissions
- GL journals, Trial Balance, P&L, bank rec
- DRR web page, Daily Flash, cashier PDF (DRR **API** already exists — do not rebuild it; do not wire `/reports` here)
- Currency exchange rates UI
- Package USALI split
- Credit limit alerts / auto-settlement
- Deleting or migrating off legacy `Transaction` / `Payment`
- Redesigning Night Audit (new jobs, new queues, changing idempotency keys, posting covering-stay logic)
- Requiring `BALANCED` (approved) before NA — only `OPEN` blocks
- Full RBAC / new Manager role seed beyond `'ALL'` / optional `'SHIFT_APPROVE'`
- next-intl app-wide locale routing
- Phase 4: Room Move, no-show, walk, complimentary, extended stay, tax exemption, VIP lock
- Reopening Day-use or Split Stay

---

## Acceptance criteria (PR 1)

- [ ] Cashier can open a shift for a property + current `businessDate` with `openingCash`.
- [ ] Second open for the same user → 409; two different users may both be `OPEN` on one property.
- [ ] Folio cashier post/void stores `shiftId`; `userId === 'SYSTEM'` (Night Audit room post) leaves `shiftId` null.
- [ ] Post without an open shift → 400; billing shows i18n toast, not a hardcoded string.
- [ ] Close computes `expectedCash` from trx code `9000` only; `cashVariance = closingCash - expectedCash`; zero → `BALANCED`, nonzero → `CLOSED` and requires `varianceReason`.
- [ ] Manager with `'ALL'` (or `'SHIFT_APPROVE'`) can approve `CLOSED` → `BALANCED`; staff cannot.
- [ ] Handover closes current and opens successor with `openingCash = countedCash` in one transaction.
- [ ] `POST /night-audit/run` returns 400 while any shift is `OPEN` for that property/date; does not enqueue; completed-audit short-circuit and posting idempotency unchanged.
- [ ] Web `/shifts` supports open / close / handover / approve / today’s list; copy from `messages/*.json`; nav link present.
- [ ] `/reports` still stub; no GL/tax/FX/CC/AP code.
- [ ] Tests + type-check + lint green. Prisma still ^6.19.2.
