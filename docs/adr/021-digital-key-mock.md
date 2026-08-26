# ADR 021: Digital key mock (BLE/NFC credential, no real radios)

- **Status**: Accepted
- **Date**: 2026-08-26
- **Owners**: @Architect
- **Deciders**: @Architect, @PM
- **Related**:
  - `docs/planning/prd.md` § Digital key / mobile key
  - `packages/database/prisma/schema.prisma` (`DigitalKey`)
  - `apps/api/src/digital-keys/`
  - `apps/web/src/app/[locale]/digital-keys/`, `apps/web/src/components/digital-key-panel.tsx`
  - ADR 007 (Hardware Bridge — BLE digital keys explicitly out of scope)
  - ADR 017 (Kiosk check-in — unauthenticated public access rejected for v1)

## Context

Guests increasingly expect a mobile room key instead of (or alongside) a
plastic key card. Real BLE/NFC mobile-key integration requires a vendor SDK
(lock manufacturer mobile-key API, e.g. Salto KS, Assa Abloy Vostio, dormakaba)
and a phone-side BLE/NFC stack — neither of which exists in this repo. ADR 007
already scoped BLE digital keys out of the Hardware Bridge because that module
solves USB/loopback hardware on the front-desk PC, not phone-to-lock radios.

Phase 7G needs a demoable digital-key flow: front desk issues a mobile key for
a reservation, the guest sees/holds a credential, and staff can revoke it —
all without pretending to talk to real hardware. This is analogous to how
`hb-adapters.ts` mocks printer/encoder/scanner responses for Hardware Bridge
jobs, but digital keys are not encoder jobs (a real mobile-key SDK issues a
signed credential to a phone app; it does not "encode" a physical card), so
overloading `HardwareJob.type = 'KEYCARD_ENCODE'` would be semantically wrong
and would block a future real BLE/NFC integration from having its own audit
trail.

## Decision

1. **New `DigitalKey` Prisma model** (additive only, no changes to existing
   tables): `propertyId`, `reservationId`, `roomNumber`, `token` (unique mock
   credential), `transport` (`BLE` | `NFC`), `status`
   (`ACTIVE` | `REVOKED` | `EXPIRED`), `issuedBy`, `issuedAt`, `expiresAt`
   (defaults to the reservation's `checkOut`), `revokedAt`, `revokedBy`,
   `revokedReason`. This is a dedicated model, not a new `HardwareJobType`,
   because a digital key is a standing credential with its own lifecycle
   (issue → revoke/expire), not a one-shot hardware job.
2. **New NestJS module** `apps/api/src/digital-keys/` (sibling of
   `hardware-bridge/`, same layering: `dk-rules.ts` for pure business rules,
   `digital-keys.service.ts` for Prisma access, thin controller):
   - `POST /digital-keys/issue` — body `{ reservationId, issuedBy, transport? }`,
     returns the mock credential `{ token, roomNumber, expiresAt, transport,
reservationId }` (plus id/status/audit fields). Reservation must be
     `CONFIRMED` or `CHECKED_IN` and have a room assigned.
   - `POST /digital-keys/issue-by-confirm` — same contract, looked up by
     `confirmNumber` instead of `reservationId`. Staff-guarded (see rationale)
     rather than a public guest-portal endpoint, mirroring the confirmNumber
     lookup pattern from `kiosk.service.ts`.
   - `GET /digital-keys?propertyId=&reservationId=` and `GET /digital-keys/:id`.
   - `POST /digital-keys/:id/revoke` — body `{ revokedBy, revokedReason? }`.
   - All routes sit behind `JwtAuthGuard` (staff/demo), consistent with every
     other module in this repo; there is no unauthenticated guest portal on
     `main`/`dev` yet (ADR 017 explicitly rejected that for kiosk v1), so a
     truly public guest-facing issue endpoint is deferred until that portal
     exists.
3. **Mock credential generation** (`generateMockToken` in `dk-rules.ts`):
   a random `DK-MOCK-<hex>` string. This stands in for whatever payload a
   real BLE/NFC mobile-key SDK would return; it is not cryptographically
   bound to any lock and cannot open a real door.
4. **Web**: staff page `/digital-keys` (issue by confirmation number, list
   all issued keys for the property, copy token, revoke) plus a
   `DigitalKeyPanel` on `/reservations/[id]` for issuing/revoking in the
   reservation context (same dual-surface pattern as wake-up calls:
   `wake-up-calls-client.tsx` + `wake-up-call-panel.tsx`). Mock API router
   (`apps/web/src/lib/api/mock/router.ts`) gets a matching `handleDigitalKeys`
   so the demo/mock mode works without the Nest API.
5. **i18n**: `digitalKey.*` (en/th) for the standalone page and shared status
   labels, `reservations.digitalKey.*` for the reservation-detail panel
   heading/action, following the existing `wakeUpCalls` / `reservations.wakeUpCall`
   split.

## Rationale

- **Correctness / future-proofing**: keeping `DigitalKey` separate from
  `HardwareJob` means a later real BLE/NFC integration (vendor SDK, phone app
  deep link, lock gateway) can extend this model without retrofitting
  Hardware Bridge's one-shot job semantics or breaking `KEYCARD_ENCODE`.
- **Consistency**: reuses the exact module layout (`*-rules.ts` pure helpers,
  thin service/controller, `JwtAuthGuard`) already established by
  `hardware-bridge/` and `guest-messages/`.
- **Security**: no unauthenticated route is added. `issue-by-confirm` still
  requires staff auth even though the lookup key (confirmNumber) is
  guest-known, because ADR 017 already decided public unauthenticated access
  is out of scope until a real guest portal auth story exists.
- **YAGNI**: no BLE/NFC stack, no phone SDK, no push-to-phone delivery — just
  a mock credential and a lifecycle (issue/revoke/expire) good enough to demo
  and to give a real integration a schema to plug into later.

## Consequences

### Positive

- Front desk can demo "digital key" without any hardware or phone app.
- Clean separation from Hardware Bridge keeps `KEYCARD_ENCODE` (physical card
  encoders) semantically intact.
- `DigitalKey.expiresAt` defaulting to `reservation.checkOut` gives a
  sensible automatic lifetime without extra input.

### Negative / risks

- The mock token is not a real credential; it must never be treated as
  proof of lock access in any downstream integration.
- No push notification / deep link to an actual guest phone app exists yet —
  staff must relay or display the token manually (e.g. via the copyable
  field in the UI).
- `status: EXPIRED` is not actively swept by a background job in v1; a key
  past `expiresAt` still reads as `ACTIVE` until explicitly revoked or a
  future job marks it expired.

### Mitigations

- UI labels this as a mock/demo credential; ADR called out explicitly here
  and cross-referenced from ADR 007.
- Revoke endpoint lets staff immediately invalidate a key regardless of
  `expiresAt` (e.g. early checkout, lost phone).
- Follow-up: a Night Audit or scheduled job could flip `ACTIVE` keys past
  `expiresAt` to `EXPIRED`; out of scope for this mock slice.

## Alternatives considered

1. **Reuse `HardwareJob` with `type: 'KEYCARD_ENCODE'`** — rejected; a
   digital key is a standing credential with its own status lifecycle, not a
   one-shot encode job, and conflating them would make future physical vs.
   mobile key reporting ambiguous.
2. **In-memory only, no Prisma model** — rejected; staff need to list/revoke
   keys across page loads and reservations, and every comparable feature in
   this repo (`RegistrationCard`, `WakeUpCall`, `HardwareJob`) persists to
   Postgres for the same reason.
3. **Public unauthenticated `issue-by-confirm` for a guest portal** —
   rejected for this slice; no guest portal auth exists yet (ADR 017), so the
   endpoint stays behind `JwtAuthGuard` until that groundwork lands.

## Implementation notes

- **Files**:
  - `packages/database/prisma/schema.prisma` (`DigitalKey`,
    `DigitalKeyTransport`, `DigitalKeyStatus`)
  - `packages/database/prisma/migrations/20260826040000_add_digital_key/`
  - `apps/api/src/digital-keys/**`
  - `apps/web/src/lib/api/digital-keys.ts`, `apps/web/src/hooks/use-digital-keys.ts`
  - `apps/web/src/app/[locale]/digital-keys/**`, `apps/web/src/components/digital-key-panel.tsx`
  - `apps/web/src/lib/api/mock/router.ts` (`handleDigitalKeys`),
    `apps/web/src/lib/api/mock/data.ts` (`digitalKeys` collection)
  - `apps/web/src/messages/en.json`, `apps/web/src/messages/th.json`
    (`digitalKey.*`, `reservations.digitalKey.*`)
- **Test plan**:
  - `pnpm --filter api exec vitest run src/digital-keys`
  - `pnpm --filter web exec vitest run src/lib/api/digital-keys.test.ts src/components/digital-key-panel.test.tsx "src/app/[locale]/digital-keys/page.test.tsx" "src/app/[locale]/reservations/[id]/page.test.tsx"`
