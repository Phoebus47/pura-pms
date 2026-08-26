# ADR 022: Guest mobile check-in (pre-arrival, digital key stub)

- **Status**: Accepted
- **Date**: 2026-08-26
- **Owners**: @Architect
- **Deciders**: @Architect, @PM
- **Related**:
  - `docs/adr/017-kiosk-checkin.md` (lobby kiosk precedent)
  - `docs/adr/018-next-intl-foundation.md` (i18n bridge)
  - `apps/api/src/reservations/` (`findByConfirmNumber`, `update`, `checkIn`)
  - `apps/api/src/rooms/` (`getAvailability`)
  - `apps/api/src/mobile-check-in/`
  - `apps/web/src/app/[locale]/mobile-check-in/`

## Context

Phase 7H requires a **guest-facing, pre-arrival mobile check-in** flow: a
guest opens a link on their phone (no staff involved, no login), confirms
their reservation, optionally picks a different room of the same type, checks
in, and sees a placeholder for a digital key. This differs from the Phase 6
kiosk (ADR 017), which is a **staff-authenticated** lobby tablet flow behind
`JwtAuthGuard`.

Constraints:

- No digital-key/encoder module exists yet (Phase 7G not merged onto this
  branch) — the response must be a clearly-labelled stub, not a real key.
- `Reservation.roomId` is a required, non-nullable field
  (`packages/database/prisma/schema.prisma`), so "room selection" here means
  **changing** the already-assigned room, not assigning a first room. Demo
  mock data (`CN-DEMO-002`) additionally exercises an "unassigned room"
  display state for UI robustness.
- `findByConfirmNumber`, `RoomsService.getAvailability`, and
  `ReservationsService.update` are only reachable via controllers gated by
  `JwtAuthGuard` (staff JWT). A guest has no staff session.
- `ReservationsService.findByConfirmNumber` includes the full `Guest` record
  and all folio transactions (`reservation-include.ts`) — unsafe to expose
  verbatim to an unauthenticated caller.
- `UpdateReservationDto` is a `PartialType` of `CreateReservationDto` and can
  change almost any reservation field (status, tax exemption, billing cycle,
  etc.). Exposing it directly as a public PATCH would let anyone holding a
  confirmation number rewrite arbitrary reservation state.

## Decision

1. **New, unauthenticated module**: `apps/api/src/mobile-check-in/` —
   `MobileCheckInController` has **no** `JwtAuthGuard`. A guest is instead
   authenticated implicitly by knowing the `confirmNumber` plus an
   **optional** `lastName` factor (`guest-identity.ts` ➜
   `assertLastNameMatches`, case-insensitive, only checked when provided).
2. **Reuse existing service methods, never widen their public surface**:
   - Lookup delegates to `ReservationsService.findByConfirmNumber`.
   - Room change delegates to `ReservationsService.update(id, { roomId })`
     — the mobile DTO (`SelectRoomDto`) only ever accepts `roomId` (+
     optional `lastName`), so the full `UpdateReservationDto` surface is
     never exposed publicly. Existing guards inside `update` (room lock,
     availability conflicts) apply unchanged.
   - Room availability delegates to `RoomsService.getAvailability`, scoped
     to the reservation's own property, dates, and room type.
   - Check-in delegates to `ReservationsService.checkIn`, exactly like the
     kiosk facade in ADR 017.
   - Room changes and check-in are only allowed while the reservation is
     `CONFIRMED` (`assertRoomChangeEligible`); `checkIn` itself already
     enforces this for the check-in step.
3. **Guest-safe response shape**: `mobile-check-in-view.ts` maps the full
   Prisma reservation (guest PII, folio transactions, etc.) down to a
   minimal `MobileCheckInReservationView` (confirm number, status, dates,
   guest first/last name, assigned room + room type, property id). No
   folio, financial, or contact-detail fields are ever serialized to the
   public endpoint.
4. **Digital key stub**: `digital-key-stub.ts` returns
   `{ status: 'UNAVAILABLE', message: '...front desk...' }` on successful
   check-in. This is swappable for a real digital-key issuance call once
   that module exists (Phase 7G), without changing the controller contract.
5. **Web**: `apps/web/src/app/[locale]/mobile-check-in/` — guest-facing
   client component with **no staff sidebar**. `AppLayout` now bypasses the
   sidebar/header/bottom-nav chrome for `/mobile-check-in` the same way it
   already does for `/login`. Steps: lookup ➜ (optional) room selection ➜
   check-in ➜ success screen with the digital-key placeholder card.
6. **i18n**: all copy lives under `mobileCheckIn.*` in
   `apps/web/src/messages/en.json` and `th.json`, following the existing
   `t()` bridge used by the kiosk page (ADR 018).
7. **Mock router**: `apps/web/src/lib/api/mock/router.ts` gets a
   `handleMobileCheckIn` handler so the demo (`NEXT_PUBLIC_USE_MOCK_API`)
   works end-to-end against `mockDb`, including the existing "unassigned
   room" demo reservation (`CN-DEMO-002`).

## Rationale

- **Reuse over reinvention**: every mutation goes through the same,
  already-tested `ReservationsService`/`RoomsService` methods used by staff
  flows — no parallel business logic to keep in sync.
- **Minimal public surface**: a dedicated `SelectRoomDto` (just `roomId` +
  optional `lastName`) instead of exposing `UpdateReservationDto` publicly
  avoids an "unsafe public PATCH of everything" while still reusing the
  vetted `update()` validation (availability, room lock, split-stay guards).
- **Defense in depth without new infra**: the confirmation number is already
  a private, unguessable-enough token (used unauthenticated at the door for
  physical check-in); the optional last-name check adds a second factor
  without requiring a new auth/session system for Phase 7H's MVP scope.
- **Explicit stub over silent no-op**: returning a typed `DigitalKeyStub`
  object (rather than omitting the field) keeps the web UI and future
  Phase 7G integration contract explicit.

## Consequences

### Positive

- Guests can confirm, adjust room, and check in from their own device before
  arrival, reducing lobby queue time.
- No new Prisma models; no risk to financial/audit tables.
- Staff-facing kiosk (ADR 017) and reservation CRUD are untouched.

### Negative / risks

- Confirmation number + optional last name is a weaker guarantee than a real
  guest login; a guest who never supplies a last name relies solely on the
  confirmation number's obscurity. Acceptable for MVP (mirrors the kiosk's
  no-lastName-check precedent) but should be revisited before wider rollout.
- Digital key is a stub; guests still need a physical key at the desk.

### Mitigations

- `assertLastNameMatches` is opt-in but recommended in the UI copy
  (`mobileCheckIn.lastNameHint`).
- Room and check-in mutations are re-validated server-side on every call
  (status checks, `ReservationsService.update` availability/room-lock
  guards) — the client never trusts local state for authorization.

## Alternatives considered

1. **Extend `KioskController` to drop `JwtAuthGuard` conditionally** —
   rejected; kiosk intentionally stays staff-only per ADR 017, and mixing
   guarded/unguarded routes on one controller is error-prone.
2. **Expose `UpdateReservationDto` directly on a public route** — rejected
   per task constraints; far too large a mutation surface for an
   unauthenticated endpoint.
3. **Require full guest login/session before check-in** — rejected as
   out of scope for Phase 7H MVP (no guest auth system exists yet); revisit
   if abuse is observed in production.

## Implementation notes

- **Files**:
  - `apps/api/src/mobile-check-in/` (controller, service, DTOs,
    `guest-identity.ts`, `digital-key-stub.ts`, `mobile-check-in-view.ts`)
  - `apps/api/src/app.module.ts` (registers `MobileCheckInModule`)
  - `apps/web/src/app/[locale]/mobile-check-in/`
  - `apps/web/src/lib/api/mobile-check-in.ts`
  - `apps/web/src/lib/api/mock/router.ts` (`handleMobileCheckIn`)
  - `apps/web/src/components/layout/app-layout.tsx` (chrome bypass)
  - `apps/web/src/messages/en.json`, `th.json` (`mobileCheckIn.*`)
- **Test plan**:
  - `pnpm --filter api test -- mobile-check-in`
  - `pnpm --filter web test -- mobile-check-in`
  - `pnpm --filter web test -- src/lib/api/mock/router.test.ts`
  - `pnpm --filter api type-check && pnpm --filter web type-check`
