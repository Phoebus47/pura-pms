# ADR 015: Post-stay guest feedback (manual v1)

- **Status**: Accepted
- **Date**: 2026-08-20
- **Owners**: @Architect
- **Deciders**: @Architect, @PM
- **Related**:
  - `docs/planning/prd.md` § Post-stay feedback
  - `packages/database/prisma/schema.prisma` (`GuestFeedback`)
  - `apps/api/src/guest-feedback/`
  - `apps/web/src/app/feedback/`

## Context

Hotels need to capture post-stay satisfaction scores and comments. PRD lists
auto-survey after checkout, OTA review sync, and email campaigns. Those require
guest-facing channels and integrations we do not have in v1.

## Decision

1. **`GuestFeedback`** scoped by `propertyId`, required `guestId`, optional
   `reservationId`.
2. **Score** integer 1–5 with optional `comment`.
3. **Status** `OPEN` | `REVIEWED` | `ARCHIVED` (default `OPEN`). Staff mark
   reviewed via `POST :id/review { reviewedBy }`.
4. **Timestamps**: `submittedAt` for when feedback was recorded;
   `reviewedAt`/`reviewedBy` when staff acknowledges.
5. **Web**: `/feedback` list + manual entry form (desk logs phone/web feedback).
   No auto email survey or OTA sync.
6. **Migration**: `20260820110000_add_guest_feedback`.

## Rationale

- Unblocks FO satisfaction tracking without survey vendors or guest portal.
- `propertyId` matches other Phase 6 FO boards (Messages, Lost & Found).
- YAGNI: automation and review aggregation wait for later phases.

## Consequences

### Positive

- Staff can log and triage guest satisfaction from one board.

### Negative / Trade-offs

- Feedback is staff-entered only; no guest self-service channel.

### Follow-ups

- Auto-survey email after checkout.
- OTA review import (Booking.com, Agoda).
- Analytics dashboard (NPS, trend by room type).

## Alternatives considered

1. Full survey platform now — rejected (no email provider / guest app).
2. Store scores on guest profile JSON — rejected (no status/review workflow).

## Implementation notes

- **Files**: schema, `apps/api/src/guest-feedback/`, `apps/web/src/app/feedback/`
- **Tests**: rules/service/controller specs; web page + API client tests
