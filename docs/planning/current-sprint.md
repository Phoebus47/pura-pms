# Current Sprint — Phase 5 Housekeeping Inspection

**Status:** In progress
**Branch:** `cursor/feat-hk-inspection-6a5d`
**Depends on:** Allotment (`cursor/feat-allotment-blocks-6a5d`)
**Roles:** @PM → @Architect → @Backend → @Frontend → @QA

## Goal

Dirty → Clean → Inspected → Ready with a supervisor checklist. Do not add
`INSPECTED` to `RoomStatus` (occupancy stays on that enum).

## Database

- `Room.hkStage`: `DIRTY` | `CLEAN` | `READY` (default `READY`)
- `HousekeepingInspection` + `HousekeepingInspectionLine`
- Migration: `20260818050000_add_housekeeping_inspection`
- Checkout / room-move to dirty also sets `hkStage = DIRTY`

## API

1. `GET /housekeeping/board?propertyId=`
2. `GET /housekeeping/checklist`
3. `POST /housekeeping/rooms/:id/clean`
4. `POST /housekeeping/rooms/:id/inspections`
5. `GET /housekeeping/rooms/:id/inspections`

Pass → `READY`. Fail required item → `DIRTY` + dirty room status.

## Web

- `/housekeeping` board by stage, mark clean, inspect checklist
- Nav: Housekeeping
- i18n `housekeeping.*` (EN + TH)

## Wait

- Photo evidence
- Gate FO assignment on `READY` (availability still uses `RoomStatus`)
