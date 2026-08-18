# Current Sprint — Phase 5 Allotment & Blocks

**Status:** In progress  
**Branch:** `cursor/feat-allotment-blocks-6a5d`  
**Depends on:** Yield (`cursor/feat-yield-pricing-6a5d`)

## Goal

Agent/OTA allotments and group blocks with cutoff release and pickup reporting.

## Schema

- `RoomBlock` (`ALLOTMENT` | `GROUP`, `GENERAL` | `DEDICATED`)
- `Reservation.blockId` optional
- Migration: `20260818040000_add_room_blocks`

## API

1. `POST/GET/PATCH /blocks`
2. `GET /blocks/:id/pickup`
3. `POST /blocks/:id/reservations` — attach pickup
4. `POST /blocks/:id/release` — return unused rooms after cutoff (also auto on read when cutoff ≤ businessDate)

## Web

- `/blocks` catalog, pickup panel, attach + release
- Nav: Blocks
- i18n `blocks.*`
