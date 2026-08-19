# Current Sprint — Phase 5 DND / MUR

## Goal

Guest-request indicators on rooms: Do Not Disturb (DND) and Make Up Room (MUR),
visible and toggleable from the housekeeping board.

## Scope

- `GuestRoomRequest` on `Room` (`NONE` | `DND` | `MUR`)
- `POST /housekeeping/rooms/:id/guest-request`
- Block mark-clean while DND is active
- HK board badges + actions (en/th)

## Out of scope

- Auto-clear on checkout
- Door sensor / PBX integration
- Separate DND/MUR board page
