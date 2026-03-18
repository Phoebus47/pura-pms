# Current Sprint (Phase 3 Kickoff) — Financial Foundation & Billing

**Theme:** Financial backbone (USALI-compliant)  
**Goal:** Make Transaction Codes + Posting Engine + Billing UI usable end-to-end with tests.  
**Source:** `docs/planning/prd.md` (Night Audit, Financial Module, Report Archive), `docs/planning/sprints/sprint2/README.md`

## Working agreements (non-negotiables)

- **Immutable financials:** no delete/update of posted financial facts; void/correction only.
- **businessDate:** treat as accounting date (date-only semantics), separate from system timestamps.
- **Idempotency:** night audit / batch posting must be safe to re-run.
- **Testing:** do not skip QA step; cover success + error paths.

## Execution process (Virtual AI Team)

Each “Work Package” below is delivered as a small PR-sized unit.

- **@PM**: owns task breakdown + acceptance criteria + PR slicing.
- **@Architect**: validates schema/invariants/USALI + idempotency design before coding.
- **@Backend**: implements NestJS API (DTO/service/controller) + backend tests.
- **@Frontend**: implements Next.js UI + React Query hooks + web tests.
- **@QA**: adds missing tests + edge cases; verifies critical paths before merge.

## Work Packages (recommended order)

### WP1 — Transaction Codes CRUD (Settings)

**Why first:** unblocks Posting UI dropdowns and consistent GL mapping.

- **@Architect**
  - Confirm `TransactionCode` model fields + constraints match PRD (USALI mapping, tax/service flags).
  - Decide minimal CRUD scope for MVP (create/edit/list; delete policy for financial master data).
- **@Backend**
  - Add CRUD endpoints for `TransactionCode` under `apps/api/src/financial/` (DTO validation, pagination/filter if needed).
  - Add tests: service/controller specs, validation and error paths.
- **@Frontend**
  - Add Settings UI for Transaction Codes (list + create/edit dialog).
  - Use existing UI primitives; hook to API; add component/page tests.
- **@QA**
  - Add edge case tests (duplicate code, invalid GL mapping format, toggles tax/service).

**Acceptance criteria**

- Can list and create/update Transaction Codes securely (JWT-ready).
- UI can select codes reliably for posting.

### WP2 — Posting Engine (Tax/Service split + sign + balances)

- **@Architect**
  - Define posting rules: net/service/tax computation and sign conventions (charge +, payment -).
  - Decide how folio/window balances are computed and cached (recompute vs atomic updates).
- **@Backend**
  - Implement posting logic in `FoliosService.postTransaction` (or a dedicated PostingService).
  - Enforce invariants: businessDate required for posting; reason codes required for sensitive actions.
  - Tests for tax/service calculation + balance updates + invalid inputs.
- **@Frontend**
  - Update post charge/payment dialogs to show totals split (net/service/tax/total).
  - Add tests for posting interactions and error display.
- **@QA**
  - Add integration-style tests for: post charge increases balance, post payment reduces balance.

**Acceptance criteria**

- Posting produces correct split amounts and stable balances.
- Critical logic has tests.

### WP3 — Billing UI (Reservation > Billing)

- **@Architect**
  - Confirm UI flow aligns with PRD: windows 1–4, routing readiness, audit trail visibility.
- **@Backend**
  - Ensure `GET /folios/reservation/:id` returns windows + transactions with needed joins.
  - **Done:** New folios get windows 1–4; legacy folios backfilled via `createMany` + `skipDuplicates`; ordered windows/transactions on read.
- **@Frontend**
  - Replace `apps/web/src/app/billing/page.tsx` “Coming Soon” with usable Billing dashboard:
    - show 4 windows with balances
    - show transaction list
    - post charge/payment dialogs wired to WP2
  - Add page/component tests.
  - **Done:** `/billing` + `?reservationId=` loads guest/room header + `FolioDetail`; reservation page links to full dashboard.
- **@QA**
  - Add smoke test coverage for billing flow (unit/integration now; e2e later if stable).
  - **Done:** `billing/page.test.tsx`, `billing-client.test.tsx`.

**Acceptance criteria**

- From a reservation, user can view windows, post a charge, then post a payment.

### WP4 — Reason Codes + Void/Correction workflow (Audit)

- **@Architect**
  - Decide void strategy: correction transaction linkage + required reason codes.
- **@Backend**
  - Implement void endpoint/workflow (additive correction, no mutation of original).
  - Tests proving immutability + required reasonCode.
- **@Frontend**
  - Add void action with confirm dialog + reason selection.
  - Tests for required reason selection.
- **@QA**
  - Edge cases: void already-voided; void after night audit lock (if rule enforced).

**Acceptance criteria**

- Void creates correcting record and preserves original facts.

### WP5 — Night Audit hardening (Idempotency + status + ReportArchive)

- **@Architect**
  - Choose idempotency mechanism (unique guards / state machine / deterministic references).
  - Define status API shape and report archive expectations.
- **@Backend**
  - Add status endpoint; enforce idempotency; write `ReportArchive` and errors.
  - Processor tests (run twice: no double-post; failures persist `AuditError`).
- **@Frontend**
  - Add UI to trigger and poll status; surface summary and archived reports.
- **@QA**
  - Failure modes: Redis down, partial posting, retry safety.

**Acceptance criteria**

- Night audit can run safely, report progress, and archive results.

## ADRs to write (minimum)

- `ADR: Posting model + tax/service split + balance strategy`
- `ADR: Night audit idempotency + status/report archive design`

Use template: `docs/adr/000-template.md`
