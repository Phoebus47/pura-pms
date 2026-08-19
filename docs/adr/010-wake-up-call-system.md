# ADR 010: Manual wake-up call board (no PBX)

- **Status**: Accepted
- **Date**: 2026-08-19
- **Owners**: @Architect
- **Deciders**: @Architect, @PM
- **Related**:
  - `docs/planning/prd.md` § Wake-up call system
  - `packages/database/prisma/schema.prisma` (`WakeUpCall`)
  - `apps/api/src/wake-up-calls/`
  - `apps/web/src/app/wake-up-calls/`

## Context

Front desk must schedule guest wake-up times and confirm delivery. PRD allows
manual or PBX integration. This repo has no PBX adapter. Night Audit BullMQ is
the wrong queue for desk-side confirmation.

## Decision

1. **`WakeUpCall` model** links `propertyId`, `reservationId`, and `roomId`
   (denormalized at create). Status: `SCHEDULED` → `COMPLETED` | `MISSED` |
   `CANCELLED`. `scheduledDate` (`@db.Date`) supports FO board filters.
2. **Manual FO actions only** — complete / miss / cancel. No PBX, no Hardware
   Bridge, no auto-miss cron in v1.
3. **Nest module** `wake-up-calls` with list (property+date or reservation),
   schedule, complete, miss, cancel.
4. **Web**: `/wake-up-calls` board + panel on `/reservations/[id]` for
   `CONFIRMED` / `CHECKED_IN`.
5. **Migration**: `20260819080000_add_wake_up_call`.

## Rationale

- Unblocks FO ops without vendor PBX.
- Status audit fields mirror registration-card void/sign patterns.
- YAGNI: PBX and auto-miss wait until a property needs them.

## Consequences

### Positive

- Desk can schedule and confirm wake-ups in PURA.

### Negative / risks

- Missed calls rely on FO diligence until automation lands.

### Mitigations

- Board defaults to `Property.businessDate` so overdue SCHEDULED rows stay visible.

## Alternatives considered

1. PBX-first — rejected; no adapter in repo.
2. Store only on reservation JSON notes — rejected; no status/queryability.

## Implementation notes

- **Files**: `apps/api/src/wake-up-calls/**`, `apps/web/src/app/wake-up-calls/**`,
  `apps/web/src/components/wake-up-call-panel.tsx`
- **Tests**: API service/controller specs; web page + panel tests
