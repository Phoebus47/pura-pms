# ADR 014: In-app guest messaging hub (no SMS/push)

- **Status**: Accepted
- **Date**: 2026-08-20
- **Owners**: @Architect
- **Deciders**: @Architect, @PM
- **Related**:
  - `docs/planning/prd.md` § 4.21 Guest Communication Hub
  - `packages/database/prisma/schema.prisma` (`GuestMessage`)
  - `apps/api/src/guest-messages/`
  - `apps/web/src/app/messages/`

## Context

Front office needs a log of guest ↔ staff communication. PRD lists SMS,
email, WhatsApp, pre-arrival automation, and push. Those channels need
providers and a guest app we do not have yet.

## Decision

1. **`GuestMessage`** scoped by `propertyId`, required `guestId`, optional
   `reservationId`.
2. **Direction** `INBOUND` | `OUTBOUND`. Staff compose is `OUTBOUND` with
   `sentBy`. Desk can also log `INBOUND` when a guest called/spoke.
3. **Channel** enum includes SMS/EMAIL/WHATSAPP for forward-compat, but v1
   API only accepts `IN_APP` (default).
4. **Read**: `POST :id/read` sets `readAt` once (idempotent if already set).
5. **Web**: `/messages` list + compose form. No guest portal.
6. **Migration**: `20260820100000_add_guest_message`.

## Rationale

- Unblocks FO messaging history without vendor APIs.
- `propertyId` matches other FO boards (TM.30, Lost & Found).
- YAGNI: external channels and automation wait for later phases.

## Consequences

### Positive

- Staff can track conversation threads per guest without spreadsheets.

### Negative / Trade-offs

- Guests cannot reply in-app; inbound is staff-logged only.

### Follow-ups

- Wire SMS/Email providers.
- Guest portal / pre-arrival templates.
- Push via PWA.

## Alternatives considered

1. Full multi-channel hub now — rejected (no providers).
2. Store messages as guest notes JSON — rejected (no direction/read/query).

## Implementation notes

- **Files**: schema, `apps/api/src/guest-messages/`, `apps/web/src/app/messages/`
- **Tests**: rules/service/controller specs; web page + API client tests
