# ADR 001: Posting model with tax/service split and balance strategy

- **Status**: Accepted
- **Date**: 2026-03-18
- **Owners**: @team
- **Deciders**: @team
- **Related**: `docs/planning/current-sprint.md`, `ARCHITECTURE.md`, `apps/api/src/folios/folios.service.ts`

## Context

We need a posting model that:

- preserves **financial immutability** (auditable corrections rather than edits)
- supports **hotel accounting requirements** (USALI-friendly grouping, audit trail)
- separates **net / service charge / tax** amounts deterministically
- uses **businessDate** (hotel accounting date) distinct from system timestamps
- updates folio/window balances safely and consistently

Current state:

- Financial postings live in the Folio domain.
- Posting is done via `FoliosService.postTransaction(...)` and persisted as `FolioTransaction`.
- UI uses posting dialogs and shows per-window balances and transactions.

Key code paths:

- `apps/api/src/folios/folios.service.ts` (posting calculations, balance updates)
- `packages/database/prisma/schema.prisma` (`FolioTransaction`, `TransactionCode`, balances)
- `apps/web/src/components/post-charge-dialog.tsx`, `post-payment-dialog.tsx`, `folio-detail.tsx`

## Decision

### Data model

- Persist each posting as an immutable `FolioTransaction` record with:
  - `businessDate` (required) and `createdAt` (system timestamp)
  - monetary split fields: `amountNet`, `amountService`, `amountTax`, `amountTotal`
  - `sign` derived from `TransactionCode.type` (charge \(+\), payment \(-\))
  - optional metadata: `reference`, `remark`, `userId`, `shiftId`
  - void/correction linkage: `isVoid`, `relatedTrxId`, `reasonCodeId`, `voidedAt`, `voidedBy`

- Use `TransactionCode` configuration for tax/service behavior:
  - `hasTax`, `hasService`, `taxRate`, `serviceRate` (and related GL mapping)

- Maintain balances redundantly for fast reads:
  - `Folio.balance` and `FolioWindow.balance` are updated on each posting/void.

### Posting calculation

- Compute service and tax from `amountNet` and the selected `TransactionCode`:
  - service applies if `hasService`
  - tax applies if `hasTax` and should be based on \((net + service)\)
- Round to 2 decimals consistently (avoid float drift).
- Compute totals deterministically:

\[
\text{total} = (\text{net} + \text{service} + \text{tax}) \times \text{sign}
\]

### Balance strategy

- Update window and folio balances **atomically** with the transaction create to keep invariants:
  - `FolioWindow.balance` changes by `amountTotal`
  - `Folio.balance` changes by `amountTotal`
- For voids, do not edit the monetary split of the original record; create a correcting record with inverted sign and adjust balances accordingly.

### API contract

- Posting endpoint requires `businessDate` and a target `windowNumber`:
  - bad requests reject missing/invalid `businessDate`
- Void requires a `reasonCodeId` and creates a correcting transaction rather than mutating the original facts.

### Web integration

- UI posting dialogs collect `businessDate`, select codes/windows, and display split totals (service/tax/total).
- Client-side helpers centralize submission logic to keep behavior consistent across dialogs.

## Rationale

- **Correctness**: Splitting amounts and using `businessDate` makes audit and reporting consistent with hotel operations.
- **Immutability**: Corrections/voids preserve original facts; auditors can trace intent and outcomes.
- **Performance**: Denormalized balances reduce query cost for dashboards and folio views.
- **Maintainability**: Centralizing split logic and DTO requirements reduces duplication and accidental divergence.

## Consequences

### Positive

- Transactions are fully auditable with clear linkage and reason codes.
- Reporting can reliably aggregate by business date and code groups.
- UI can show correct totals without recomputing from raw postings.

### Negative / risks

- Balance denormalization requires strict transactional updates to avoid drift.
- Rounding/decimal handling must be consistent across all posting paths.
- If tax/service rules evolve (inclusive taxes, compound rules), model may need extensions.

### Mitigations

- Keep posting logic server-side in one place (`FoliosService.postTransaction`).
- Add unit tests covering rounding/sign conventions and void/correction effects.
- Use database decimals for persisted amounts; avoid JS float accumulation.

## Alternatives considered

1. **Store only amountTotal** and compute splits on the fly
   - Rejected: reporting/auditing becomes ambiguous; re-computation rules can change over time.
2. **Allow updating transactions in place**
   - Rejected: breaks immutability; loses original facts and auditability.
3. **Event-sourcing full ledger**
   - Deferred: higher complexity; current approach is simpler while preserving key invariants.

## Implementation notes

- **Files changed**:
  - `packages/database/prisma/schema.prisma`
  - `apps/api/src/folios/folios.service.ts`
  - `apps/web/src/components/post-charge-dialog.tsx`
  - `apps/web/src/components/post-payment-dialog.tsx`
  - `apps/web/src/lib/posting.ts`
- **Test plan**:
  - `pnpm --filter api test`
  - `pnpm --filter web test`
