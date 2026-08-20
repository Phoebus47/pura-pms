# ADR 017: Self-service kiosk check-in (lobby mock v1)

- **Status**: Accepted
- **Date**: 2026-08-20
- **Owners**: @Architect
- **Deciders**: @Architect, @PM
- **Related**:
  - `docs/planning/prd.md` § Self-service kiosk integration
  - `apps/api/src/reservations/` (`findByConfirmNumber`, `checkIn`)
  - `apps/api/src/kiosk/`
  - `apps/web/src/app/kiosk/`

## Context

Phase 6 requires a lobby kiosk flow for guest self check-in. Full kiosk
products include ID scan, payment capture, and digital key issuance — out of
scope for v1. Staff-assisted lobby tablets should reuse existing reservation
lookup and check-in logic without a new Prisma model.

## Decision

1. **No new Prisma model** — kiosk is a thin orchestration layer over
   `Reservation`.
2. **API**: `POST /kiosk/check-in` body `{ confirmNumber, propertyId? }`:
   - finds reservation via `ReservationsService.findByConfirmNumber`
   - when `propertyId` is supplied, verifies `reservation.room.propertyId`
     matches
   - delegates to `ReservationsService.checkIn(reservation.id)`
3. **Web**: `/kiosk` staff-authenticated lobby UI (not public):
   - large confirmation-number input
   - lookup via existing `GET /reservations/confirm/:confirmNumber`
   - confirm check-in when status is `CONFIRMED`
   - `propertyId` from first property (`propertiesAPI.getAll()`)
4. **Out of scope v1**: ID scan, payment, digital key, guest portal auth,
   unauthenticated public access.

## Rationale

- Reuses proven check-in side effects (room status, folio creation).
- Dedicated endpoint keeps kiosk contract stable if reservation routes evolve.
- Staff auth matches current FO deployment (lobby tablet logged in as FO user).
- YAGNI: no kiosk session, queue, or hardware bridge until hardware phase.

## Consequences

### Positive

- Lobby staff can run a touch-friendly check-in without opening reservation detail.

### Negative / Trade-offs

- Lookup still requires staff JWT; not a guest-facing portal.
- Property guard relies on assigned room; unassigned rooms skip property match.

### Follow-ups

- Guest-facing portal with magic-link or QR confirm number.
- ID verification and payment capture integration.
- Digital key / key-card encoder via hardware bridge.

## Alternatives considered

1. **UI-only** calling existing reservation endpoints — rejected; thin kiosk
   module documents intent and centralizes property guard.
2. **New `KioskSession` model** — rejected (YAGNI for mock v1).
3. **Public unauthenticated endpoint** — rejected (security; staff-assisted v1).

## Implementation notes

- **Files**: `apps/api/src/kiosk/`, `apps/web/src/app/kiosk/`,
  `apps/web/src/lib/api/kiosk.ts`, mock router confirm + kiosk routes
- **Tests**: kiosk service/controller specs; web page + API client tests
