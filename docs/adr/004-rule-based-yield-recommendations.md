# ADR 004: Rule-based yield recommendations (not ML)

- **Status**: Accepted
- **Date**: 2026-08-18
- **Owners**: @Architect
- **Deciders**: @Architect, @PM
- **Related**:
  - `docs/planning/prd.md` §4.23 Yield Management
  - `docs/planning/roadmap.md` Phase 5 item 2
  - `packages/database/prisma/schema.prisma` (`CompetitorRate`, `YieldRecommendation`)
  - `apps/api/src/yield/yield-recommend.ts`
  - `apps/api/src/yield/yield-pace.ts`

## Context

PRD 4.23 lists demand forecasting, competitor monitoring, automated rate recommendations, and pace alerts. A true forecasting/ML stack would add training data, a model runtime, and a job that is not justified while occupancy history is still thin.

Rate Derivation already cascades child amounts when a parent `Rate.amount` changes (`apps/api/src/rates/rates-ops.ts`). Yield should write through that path so COMP/HOUSE zero rates and derived children stay consistent.

## Decision

1. **Pace** is on-books occupancy versus the same weekday 364 days earlier. Out-of-order rooms are excluded from capacity. Tentative, cancelled, no-show, and walked reservations do not occupy.
2. **Forecast** for this slice is on-books occupancy over the next 14 business-date days. No unconstrained-demand model.
3. **Competitor rates** are captured by staff. No scraping or third-party rate shop.
4. **Recommendations** are deterministic rules in `recommendAmount` (`HIGH_DEMAND`, `SLOW_PACE`, `COMP_UNDERCUT`). Apply calls `updateRate` so derived children cascade.
5. Recommendations persist as `PENDING` until apply or dismiss so the front desk can review.

## Rationale

- Correctness: never auto-post folio money; only propose and optionally update catalog rates.
- Maintainability: rules are unit-tested without a model server.
- Performance: pace is a date-window query with indexes on stay date.

## Consequences

### Positive

- Revenue managers can act on pace and competitor gaps without waiting for ML.
- Apply reuses Rate Derivation cascade.

### Negative / risks

- Rules will miss market-specific seasonality. Historical pickup curves are not stored yet.

### Mitigations

- Keep thresholds as named constants (`HIGH_OCCUPANCY_PCT`, `PACE_BEHIND_PP`) so they can be property-configured later.
- A later ADR can add a forecast job without changing the recommendation table.

## Alternatives considered

1. Train a demand model now — rejected; insufficient history and extra runtime.
2. Auto-apply recommendations during Night Audit — rejected; rate changes need a human confirm.
3. Compute recommendations only in the UI — rejected; rules must be shared with tests and mock API.

## Implementation notes

- **Files to change**:
  - `packages/database/prisma/schema.prisma`
  - `apps/api/src/yield/**`
  - `apps/web/src/app/yield/**`
- **Test plan**:
  - `pnpm --filter api exec vitest run src/yield`
  - `pnpm --filter web exec vitest run src/app/yield src/lib/api/yield.test.ts`
