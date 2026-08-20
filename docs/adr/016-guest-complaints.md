# ADR 016: Guest complaints and service recovery (manual v1)

- **Status**: Accepted
- **Date**: 2026-08-20
- **Owners**: @Architect
- **Deciders**: @Architect, @PM
- **Related**:
  - `docs/planning/prd.md` § Guest complaints / Service recovery
  - `packages/database/prisma/schema.prisma` (`GuestComplaint`)
  - `apps/api/src/guest-complaints/`
  - `apps/web/src/app/complaints/`

## Context

Front office must log guest issues, assign follow-up, document resolution, and
close cases. PRD mentions compensation and folio credits; those require
financial posting rules we defer.

## Decision

1. **`GuestComplaint`** scoped by `propertyId`, optional `guestId` and
   `reservationId`.
2. **Severity** `LOW` | `MEDIUM` | `HIGH` | `CRITICAL` (default `MEDIUM`).
3. **Status** `OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED` with strict
   transition rules enforced in `guest-complaints-rules.ts`.
4. **API**: list/get/create plus `POST :id/start`, `resolve`, `close`.
5. **Web**: `/complaints` board with create form and action buttons.
6. **No auto folio credit** or financial posting in v1.
7. **Migration**: `20260820120000_add_guest_complaint`.

## Rationale

- Matches Lost & Found / Guest Feedback FO board patterns.
- Status workflow supports accountability without compensation complexity.
- YAGNI: folio credits wait for reason codes and approval flows.

## Consequences

### Positive

- Staff can track complaints end-to-end from one board.

### Negative / Trade-offs

- Resolution notes are free text; no structured compensation ledger.

### Follow-ups

- Folio credit / comp posting linked to complaint closure.
- SLA timers and escalation by severity.
- Guest portal complaint submission.

## Alternatives considered

1. Extend `GuestFeedback` for complaints — rejected (different lifecycle).
2. Auto-post folio credits on resolve — rejected (needs financial controls).

## Implementation notes

- **Files**: schema, `apps/api/src/guest-complaints/`, `apps/web/src/app/complaints/`
- **Tests**: rules/service/controller specs; web page + API client tests
