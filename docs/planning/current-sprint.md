# Current Sprint — Phase 4 VIP Room Lock

**Status:** Complete  
**Branch:** `cursor/feat-vip-room-lock-6a5d`  
**Depends on:** Tax Exemption (merged to `dev`)

## Goal

Lock a specific room assignment for VIP reservations. Prevent room changes and mid-stay moves while locked. Require a lock note for audit trail.

## Schema

- `Reservation.isRoomLocked` (default false), `roomLockNote`
- Migration: `20260817090000_add_reservation_room_lock`

## API

1. Create/update: locked reservations require `roomLockNote`. Incompatible with split stays.
2. Block room assignment changes while locked (unless unlocking).
3. Block room-move endpoint when locked.
4. `GET /reservations?isRoomLocked=true`

## Web

- Room lock checkbox + note on new reservation (split stay disabled when locked)
- `RoomLockBadge` on list/detail
- Lock note on reservation detail
- Room move panel disabled when locked
- i18n `reservations.roomLock.*`

## Deploy

Migration applied to Supabase (`add_reservation_room_lock`).
