# Current Sprint — Phase 4 No-show (usable slice)

**Theme:** Charge a confirmed arrival that never checked in  
**Goal:** Front desk can mark no-show; Night Audit auto-marks leftover confirmed arrivals and posts one night of room rate. Folio money stays append-only.  
**Branch:** `cursor/feat-no-show-6a5d`  
**Base:** `dev`  
**Source:** `docs/planning/prd.md` § No-show & Cancellation Policy + §12  
**Depends on:** Folio posting + Night Audit. Do not reopen Room Move, Day-use, or Split Stay.

## Working agreements

- **One epic, one PR.** Conventional Commits (`feat(reservations): …` / `feat(night-audit): …` only if NA hook lives in the same PR). Prisma **^6.19.2**.
- **Usable first.** One-night `roomRate` charge. No `CancellationPolicy` model. No late-cancel timeline. No waitlist.
- Seed trx code **`1006` No-Show Charge** (`ROOM` / `CHARGE`). Do not change Night Audit’s room-charge lookup.
- Night Audit still posts room revenue only for `CHECKED_IN`. `NO_SHOW` is already excluded from occupancy conflicts.
- No hardcoded UI copy. New strings in `en.json` + `th.json` via `t()`. New UI uses design tokens (no new hex).
- Tests with the change. Do not mutate posted `FolioTransaction` rows.

## Invariants

| Rule        | Constraint                                                                                                                                    |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Status      | Only `CONFIRMED` can become `NO_SHOW`. Else 400.                                                                                              |
| Arrival     | `checkIn` calendar date must be ≤ as-of date (property `businessDate` or Night Audit date). Else 400.                                         |
| Amount      | One night: `Number(roomRate)`. Day-use uses the same header rate.                                                                             |
| Folio       | Create a guest folio if none exists (same as check-in). Post window 1.                                                                        |
| Code        | Trx code `1006`. Idempotent: skip post if a non-void `1006` already exists on the reservation. Then set status.                               |
| Actor       | Manual `userId` from the cashier. Night Audit uses `userId: 'SYSTEM'` (no open shift required).                                               |
| Night Audit | Before room posting, mark `CONFIRMED` arrivals with `checkIn ≤ businessDate`. Per-reservation errors are recorded; do not fail the whole run. |
| Money       | Append-only post. Never rewrite folio rows.                                                                                                   |

## Out of scope

- `CancellationPolicy` model and rate-code linkage
- Late cancellation fee tiers
- Auto-charge from deposit ledger
- Waitlist notify / walk / complimentary / tax exemption
- Rewriting reservation detail hardcoded English
