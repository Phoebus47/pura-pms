# Current Sprint — Phase 4 Overbooking Recovery (Walk)

**Theme:** A confirmed guest arrives and the property has no room — walk them to a partner hotel
**Goal:** Front desk can walk a confirmed reservation to a partner hotel, recording the cost paid to that hotel and the compensation given to the guest, without inventing a new AP/vendor-payable ledger.
**Branch:** `cursor/feat-overbooking-walk-6a5d`
**Base:** `dev`
**Source:** `docs/planning/prd.md` §4.2 Overbooking recovery + §12
**Depends on:** Reservation lifecycle (CONFIRMED → terminal status), same pattern as No-show. Do not reopen Room Move, Day-use, Split Stay, No-show, or Post-departure Charges.

## Working agreements

- **One epic, one PR.** Conventional Commits (`feat(reservations): …`, `feat(partner-hotels): …`). Prisma **^6.19.2**.
- **Usable first, no new ledger.** `cost` (paid to the partner hotel) and `compensationAmount` (given to the guest) are recorded on the `Walk` row for reporting only — this sprint does **not** post them through GL/AR/AP. Accounts payable to partner hotels is an explicit "wait" item in `phase-3-closeout.md`.
- New minimal directory model `PartnerHotel` (property-scoped, active/inactive) — mirrors `RoomType`'s CRUD shape, not `ARAccount`'s AR machinery.
- New reservation status `WALKED` (schema enum), mirrors how `NO_SHOW` is a terminal status reached only from `CONFIRMED`.
- No hardcoded UI copy. New strings in `en.json` + `th.json` via `t()`.
- Tests with the change.

## What ships

1. Schema: `ReservationStatus.WALKED`, `PartnerHotel` model, `Walk` model (`cost`, `compensationAmount`, `compensationNotes`, `reason`, `walkedBy`, `walkedAt`).
2. `POST /reservations/:id/walk` — only `CONFIRMED` reservations; validates the partner hotel belongs to the same property and is active; sets `status: WALKED`; records the `Walk` row. `GET /reservations/:id/walks` for history.
3. `partner-hotels` module — plain CRUD (`create`, `findAll` by `propertyId`, `findOne`, `update`) guarded by `JwtAuthGuard`, matching `room-types`.
4. Web: `/partner-hotels` admin page (create + activate/deactivate list) and a `WalkPanel` on the reservation detail page, visible only when the reservation is `CONFIRMED`.

## Invariants

| Rule         | Constraint                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| Walk guard   | Only a `CONFIRMED` reservation can be walked. `CHECKED_IN` guests already have a room — use Room Move instead. |
| Hotel guard  | The partner hotel must belong to the same property as the reservation and be `isActive`.                       |
| Amount guard | `cost` and `compensationAmount` must be `>= 0`.                                                                |
| Money        | No folio posting, no GL/AR/AP entry. `cost`/`compensationAmount` are reporting fields only.                    |

## Out of scope

- Accounts payable / vendor commission tracking for partner hotels (wait item)
- Auto-selecting or recommending a partner hotel
- Notifying the guest (email/SMS) about the walk
- Waitlist / auto re-accommodation once a room frees up
