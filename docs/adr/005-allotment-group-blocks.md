# ADR 005: Allotment and group blocks as one RoomBlock model

- **Status**: Accepted
- **Date**: 2026-08-18
- **Owners**: @Architect
- **Deciders**: @Architect, @PM
- **Related**:
  - `docs/planning/prd.md` §4.16 Allotment & Blocks
  - `packages/database/prisma/schema.prisma` (`RoomBlock`, `Reservation.blockId`)
  - `apps/api/src/blocks/block-ops.ts`

## Context

PRD asks for agent/OTA quotas (allotment) and group blocks, cut from general inventory or a dedicated hold, plus cutoff tracking and pickup reports. House availability is still room-level conflict checks (`buildRoomConflictWhere`). A second inventory engine would duplicate occupancy rules.

## Decision

1. One `RoomBlock` row with `kind` `ALLOTMENT` | `GROUP` and `inventoryMode` `GENERAL` | `DEDICATED`.
2. Contracted size is `allottedRooms` per night between `startDate` (inclusive) and `endDate` (exclusive checkout).
3. Pickup is reservations with `blockId` set and an active status. Attach is an explicit API (`POST /blocks/:id/reservations`), not automatic from `source`.
4. Unused hold (`allottedRooms - pickup - releasedRooms`) returns to the house on `POST /blocks/:id/release`, and automatically when a block is read after `cutoffDate` ≤ `Property.businessDate`.
5. Dedicated mode is stored and shown. This slice does **not** reduce free-sell availability for non-block reservations. That wait item needs a house availability API.

## Rationale

- Correctness: pickup cannot exceed remaining rooms (`409` `BLOCK_OVER_ALLOTMENT_MESSAGE`).
- Maintainability: one table, one ops module, occupancy reuse via `occupiesDate`.
- No folio money is posted by release.

## Consequences

### Positive

- Front office can track OTA quotas and group holds with a pickup report.

### Negative / risks

- Dedicated blocks do not yet withhold rooms from walk-in sell.

### Mitigations

- Show remaining dedicated rooms on `/blocks`. A later ADR can subtract dedicated remaining from sellable capacity.

## Alternatives considered

1. Separate Allotment and GroupBlock tables — rejected; fields overlap.
2. Auto-link reservations by `source` string — rejected; too brittle.
3. Change room conflict checks now — rejected until a property-level availability endpoint exists.

## Implementation notes

- **Files**: `apps/api/src/blocks/**`, `apps/web/src/app/blocks/**`
- **Tests**: `pnpm --filter api exec vitest run src/blocks` and web `src/app/blocks`
