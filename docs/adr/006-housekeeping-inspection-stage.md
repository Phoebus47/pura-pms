# ADR 006: Housekeeping inspection as Room.hkStage, not RoomStatus

- **Status**: Accepted
- **Date**: 2026-08-18
- **Owners**: @Architect
- **Deciders**: @Architect, @PM
- **Related**:
  - `docs/planning/prd.md` §4.7 Housekeeping
  - `packages/database/prisma/schema.prisma` (`Room.hkStage`, `HousekeepingInspection`)
  - `apps/api/src/housekeeping/hk-ops.ts`

## Context

PRD wants Dirty → Clean → Inspected → Ready plus a supervisor checklist.
The roadmap suggested adding `INSPECTED` to `RoomStatus`. That enum already
encodes occupancy and dirtiness (`VACANT_*`, `OCCUPIED_*`, OOO/OOS). Adding
inspection there would multiply statuses (`OCCUPIED_INSPECTED`, …) and break
room-move, yield occupancy, and availability filters.

## Decision

1. Keep `RoomStatus` as occupancy + dirtiness.
2. Add `Room.hkStage`: `DIRTY` → `CLEAN` → `READY`.
3. Passing a checklist writes `HousekeepingInspection` (`PASSED`) and sets
   `READY` (Inspected and Ready in one supervisor action).
4. Failing a required item writes `FAILED`, sets `hkStage = DIRTY`, and flips
   the room to the matching dirty `RoomStatus`.
5. Checklist codes live in API constants (`BED`, `BATH`, `LINEN`, `AMENITIES`
   required; `MINIBAR` optional). Lines are stored per inspection.
6. This slice does **not** block free-sell on `READY`. Front office still
   assigns from `RoomStatus`. Photo evidence waits.

## Rationale

- Correctness: occupancy math stays on `RoomStatus`.
- Maintainability: one stage field, one inspection log, no RoomStatus explosion.
- Thai-first HK UI can show the four-step labels without new occupancy values.

## Consequences

### Positive

- Supervisors get a durable checklist. Checkout already marks rooms dirty.

### Negative / risks

- A `VACANT_CLEAN` room can still be assigned before `READY`.

### Mitigations

- Show `hkStage` on `/housekeeping`. A later ADR can require `READY` for
  assignment.

## Alternatives considered

1. Add `INSPECTED` to `RoomStatus` — rejected; occupancy combinatorics.
2. Reuse `HousekeepingTask` as the inspection — rejected; taskType is a free
   string and has no checklist lines.
3. Separate Inspected vs Ready clicks — rejected for v1 (YAGNI).

## Implementation notes

- **Files**: `apps/api/src/housekeeping/**`, `apps/web/src/app/housekeeping/**`
- **Tests**: `pnpm --filter api exec vitest run src/housekeeping` and web
  `src/app/housekeeping`
