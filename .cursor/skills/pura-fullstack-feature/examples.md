# PURA Full‑Stack Feature — Examples

## Example 1: Add a new field to Guest and show it in UI

**Trigger**: “Add `vipLevel` badge to Guest detail and ensure API validates it.”

- DB: add/confirm `Guest.vipLevel` in `schema.prisma` (already exists in current schema)
- API:
  - Add `vipLevel` to create/update DTOs
  - Ensure service enforces bounds (e.g., 0–5) if business requires
  - Add service/controller tests for validation and persistence
- Web:
  - Add field rendering in `apps/web/src/app/guests/[id]/page.tsx`
  - Add a small UI component/badge under `apps/web/src/components/`
  - Add `page.test.tsx` assertions (role/text)

## Example 2: Add a “Void transaction” action (financial safe)

**Trigger**: “Allow voiding a folio transaction with mandatory reason code.”

- DB:
  - Ensure `FolioTransaction` has `isVoid`, `voidedAt`, `voidedBy`, `reasonCodeId`, `relatedTrxId`
  - Ensure `ReasonCode` exists (it does in current schema)
- API:
  - Create endpoint like `POST /folios/transactions/:id/void`
  - DTO requires `reasonCodeId` and `remark`
  - Service creates a **new** correcting transaction and marks linkage fields appropriately
  - Tests verify:
    - cannot void already-night-audited transaction (if rule exists)
    - reason code is required
    - totals/balances remain consistent
- Web:
  - Add confirm dialog + reason dropdown
  - On success, invalidate folio queries and show toast
  - Add component tests for dialog flow

## Example 3: Night audit run as background job

**Trigger**: “Run night audit without blocking request, show status in UI.”

- API:
  - Controller enqueues BullMQ job and returns job id/status
  - Processor performs posting and writes `NightAudit` + `ReportArchive`
  - Tests cover enqueue and processor behavior (idempotent)
- Web:
  - Page polls status endpoint with TanStack Query
  - UI shows progress and completion summary
