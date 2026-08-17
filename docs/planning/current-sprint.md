# Current Sprint — Phase 4 Complimentary / House Use Rooms

**Theme:** Owner, staff, press, and barter stays occupy a room without posting room revenue
**Goal:** Front desk can book complimentary or house-use reservations that count toward occupancy, stay at rate 0 (COMP / HOUSE), and record who approved them — without inventing a new ledger or reversing posted charges.
**Branch:** `cursor/feat-comp-house-use-6a5d`
**Base:** `dev`
**Source:** `docs/planning/prd.md` §4.3 + §4.15 + §12; `docs/planning/reports-master-list.md` §2.5
**Depends on:** Reservation create/update, Night Audit room posting skip (same pattern as day-use). Do not reopen Walk, Day-use, Split Stay, No-show, Room Move, or Post-departure.

## Working agreements

- **One epic, one PR.** Conventional Commits (`feat(reservations): …`, `feat(night-audit): …`). Prisma **^6.19.2**.
- **Occupancy, not revenue.** COMP / HOUSE stays still occupy the assigned room. Night Audit does **not** post a ROOM charge. Guest `totalRevenue` increments by 0.
- Additive schema only: `StayPurpose` enum + authority fields on `Reservation`. No new ledger tables.
- Stay purpose may change only while the reservation is `TENTATIVE` or `CONFIRMED`.
- No hardcoded UI copy. New strings in `en.json` + `th.json` via `t()`.
- Tests with the change.

## What ships

1. Schema: `StayPurpose` (`STANDARD | COMPLIMENTARY | HOUSE_USE`), `approvedBy`, `stayPurposeNote`, `department`, index on `stayPurpose`.
2. Create/update: COMP and HOUSE force `roomRate` / `totalAmount` (and stay rates) to 0; default `rateCode` to `COMP` / `HOUSE` when unset. Complimentary requires `approvedBy`. House use requires `approvedBy` and `department`.
3. Night Audit `processRoomPosting` skips non-revenue stays the same way it skips day-use (`stayPurpose: STANDARD` in the query).
4. `GET /reservations?stayPurpose=` for the Complimentary & House Use list.
5. Web: stay-type select + authority fields on new reservation; badges on list/detail; detail shows authority / purpose / department; reports panel lists COMP / HOUSE stays overlapping the selected business date.

## Invariants

| Rule           | Constraint                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------- |
| Amount guard   | COMP / HOUSE always persist `roomRate = 0` and `totalAmount = 0`.                                 |
| Authority      | Complimentary requires `approvedBy`. House use requires `approvedBy` and `department`.            |
| Lifecycle      | `stayPurpose` can change only on `TENTATIVE` or `CONFIRMED`.                                      |
| Occupancy      | Rooms stay blocked; Daily Flash occupancy still counts these stays.                               |
| Posted charges | Do not void or reverse already posted ROOM charges. Only prevent future Night Audit room posting. |
| Money          | No GL/AR/AP posting for the complimentary value. Lost revenue on the report uses rack `baseRate`. |

## Out of scope

- Accounts payable / GL posting of complimentary value
- Changing stay purpose after check-in
- VIP room lock / tax exemption (later Phase 4 items)
- Reversing room charges already posted before a stay was marked COMP / HOUSE
