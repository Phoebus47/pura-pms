# ADR 020: Guest self-service portal (confirm-number + last-name gate, v1)

- **Status**: Accepted
- **Date**: 2026-08-26
- **Owners**: @Architect
- **Deciders**: @Architect, @PM
- **Related**:
  - `docs/adr/017-kiosk-checkin.md` (listed guest portal as a follow-up)
  - `apps/api/src/reservations/` (`findByConfirmNumber`)
  - `apps/api/src/folios/` (`FoliosService.findByReservationId`)
  - `apps/api/src/guest-messages/` (`GuestMessagesService.create`)
  - `apps/api/src/portal/`
  - `apps/web/src/app/[locale]/portal/`

## Context

Phase 7F asks for a guest-facing self-service portal: guests should be able
to view their folio balance and send a service request without staff
assistance. Unlike kiosk check-in (ADR 017), the portal has no logged-in
staff device in front of it — the guest's own phone or laptop calls the API
directly, so there is no `JwtAuthGuard` session to lean on.

A full identity solution (magic-link email, OTP, guest accounts) is out of
scope for an MVP: it needs an email/SMS provider, token storage, and expiry
handling that this phase does not require. We need _some_ gate so a guest
can only see and act on their own reservation, without inventing new
infrastructure.

## Decision

1. **Auth gate: confirm-number + last-name**, not a new session/token model.
   - Every portal route takes the reservation `confirmNumber` (path) and the
     guest's `lastName` (query for GETs, body for the POST) and only returns
     data when `guest.lastName` (trimmed, case-insensitive) matches.
   - Mismatch and "reservation not found" return the **same** `404` with a
     generic message (`portal-auth.ts` → `PORTAL_NOT_FOUND`) — no enumeration
     signal about whether the confirm number exists.
2. **No new Prisma model.** `PortalModule` is a thin orchestration layer over
   existing `ReservationsService`, `FoliosService`, and `GuestMessagesService`
   — the same reuse pattern as kiosk (ADR 017).
3. **API contract** — public, unguarded (`apps/api/src/portal/`):
   - `GET /portal/reservations/:confirmNumber?lastName=...` → limited
     reservation summary (status, dates, room number, guest name). No
     internal IDs beyond what the guest already has (their own reservation
     id) and no other guests' data.
   - `GET /portal/reservations/:confirmNumber/folio?lastName=...` → folio
     balance plus a **flattened, read-only** transaction list (date,
     description, total, sign). Voided transactions are filtered out.
     `postTransaction` / `voidTransaction` / `checkout` are intentionally
     **not** exposed.
   - `POST /portal/reservations/:confirmNumber/messages` body
     `{ lastName, content }` → creates an inbound `GuestMessage`
     (`direction: INBOUND`, `channel: IN_APP`) scoped to the reservation's
     guest and property. This is the only write the portal can perform.
4. **Web**: `/[locale]/portal` — guest-facing, no staff sidebar.
   - `AppLayout` now also bypasses the staff shell for any `/portal*` path
     (same early-return used for `/login`), matching the "outside the staff
     sidebar" requirement.
   - Single-page client component (`portal-client.tsx`): unlock form → stay
     details + folio balance/transactions (read-only) → request textarea.
     No nested `/portal/[reservationId]` route was needed for v1 — the
     confirm-number + last-name pair _is_ the navigation state, kept in
     component state after unlock (KISS/YAGNI, mirrors the kiosk page shape).
5. **Mock API**: `apps/web/src/lib/api/mock/router.ts` gets a `handlePortal`
   handler that mirrors the real service's flattened folio shape exactly, so
   `NEXT_PUBLIC_USE_MOCK_API=true` and the real API return the same contract
   to the web client.

## Rationale

- Confirm number + last name is what guests already have on their booking
  confirmation — no new delivery channel (email/SMS) needed for v1.
- Reusing `ReservationsService.findByConfirmNumber`, `FoliosService`, and
  `GuestMessagesService` keeps a single source of truth for reservation
  lookup, folio shape, and message creation rules (e.g. `IN_APP`-only
  channel enforcement already lives in `guest-message-rules.ts`).
- Read-only folio + single inbound-message write keeps the blast radius of
  an unauthenticated endpoint small: nothing here can post a charge, void a
  transaction, or close a folio.
- Generic 404 on mismatch avoids leaking whether a confirm number is valid,
  reducing enumeration risk for an endpoint with no rate limiting yet.

## Consequences

### Positive

- Guests get self-service billing visibility and a request channel with no
  new infrastructure (no email/SMS provider, no token store).
- Staff-only mutations (post/void/checkout) remain entirely inaccessible from
  this surface.

### Negative / risks

- Last name is not a strong secret — a guest's confirm number plus a common
  surname is a moderate (not high) security bar. Acceptable for a v1 mock
  per the task scope, but not sufficient for a production launch without
  rate limiting and/or a stronger secret.
- No session: every portal action re-sends `confirmNumber` + `lastName`;
  fine for a single-page flow, awkward if the portal grows multi-page.

### Mitigations

- Same generic error for "not found" and "last name mismatch" limits
  enumeration.
- Content length is capped (`@MaxLength(2000)`) on the service-request DTO.

## Alternatives considered

1. **Magic-link / email OTP** — rejected for v1: requires an email/SMS
   provider integration and token expiry/storage that the task explicitly
   allows deferring ("do NOT require real magic-link infra if too heavy").
2. **Reuse `JwtAuthGuard` with a guest-scoped JWT** — rejected: still needs an
   issuance step (email/SMS or QR at checkout) that doesn't exist yet;
   deferred to a future phase alongside real magic links.
3. **Expose `FoliosController` / `GuestMessagesController` directly to the
   internet** — rejected: those controllers assume a staff caller (full
   folio detail, void/checkout/credit-limit writes, `propertyId`-scoped
   listing) and `GuestMessagesController` requires `JwtAuthGuard`. A
   dedicated `PortalModule` keeps the guest-safe surface explicit and small.

## Implementation notes

- **Files**:
  - `apps/api/src/portal/portal-auth.ts`, `portal.service.ts`,
    `portal.controller.ts`, `portal.module.ts`, `dto/portal.dto.ts`
  - `apps/api/src/app.module.ts` (registers `PortalModule`)
  - `apps/web/src/app/[locale]/portal/page.tsx`, `portal-client.tsx`
  - `apps/web/src/lib/api/portal.ts`
  - `apps/web/src/lib/api/mock/router.ts` (`handlePortal`)
  - `apps/web/src/components/layout/app-layout.tsx` (bypass sidebar for
    `/portal*`)
  - `apps/web/src/messages/en.json`, `th.json` (`portal.*` keys)
- **Test plan**:
  - `pnpm --filter api exec vitest run src/portal`
  - `pnpm --filter web exec vitest run src/app/[locale]/portal src/lib/api/portal.test.ts src/components/layout/app-layout.test.tsx`
  - `pnpm --filter api type-check`, `pnpm --filter web type-check`

## Follow-ups

- Real magic-link or OTP delivery to replace the last-name gate.
- Rate limiting / throttling on `PortalController` routes.
- Guest-portal message thread view (currently write-only from the guest's
  side; staff already see it via `/messages`).
