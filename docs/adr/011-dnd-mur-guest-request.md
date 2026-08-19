# ADR 011: DND / MUR guest-request indicators on Room

- **Status**: Accepted
- **Date**: 2026-08-19
- **Owners**: @Architect
- **Deciders**: @Architect, @PM
- **Related**:
  - `docs/planning/prd.md` § Housekeeping (DND/MUR)
  - `packages/database/prisma/schema.prisma` (`Room.guestRequest`)
  - `apps/api/src/housekeeping/`
  - `apps/web/src/app/housekeeping/`

## Context

PRD requires Do Not Disturb (DND) and Make Up Room (MUR) status indicators for
housekeeping. These are guest requests, not HK cleaning stages (`DIRTY` /
`CLEAN` / `READY`). They must be mutually exclusive and visible on the HK board.

## Decision

1. **`GuestRoomRequest` enum** on `Room`: `NONE` | `DND` | `MUR` (default
   `NONE`). Light audit: `guestRequestNote`, `guestRequestUpdatedAt`,
   `guestRequestUpdatedBy`.
2. **API** under housekeeping: `POST /housekeeping/rooms/:id/guest-request`
   with `{ request, updatedBy, note? }`.
3. **Rule**: cannot mark a room clean while `guestRequest === DND` (clear DND
   first). MUR is display-only for priority; it does not auto-change `hkStage`.
4. **Web**: badges + set/clear actions on the HK board card.
5. **Migration**: `20260819090000_add_guest_room_request`.

## Rationale

- One enum enforces mutual exclusion (DND vs MUR).
- Extends existing HK module instead of a new domain.
- YAGNI: no door-sensor / PBX / auto-clear on checkout in v1.

## Consequences

### Positive

- Desk and HK see the same guest request on the board.
- Cleaning is blocked while DND is active.

### Negative / Trade-offs

- Checkout does not auto-clear the flag yet (manual clear or later hook).

### Follow-ups

- Clear `guestRequest` on check-out / room move.
- Optional MUR → suggest DIRTY workflow later.
