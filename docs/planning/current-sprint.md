# Current Sprint — Phase 4 Room Move Mid-stay

**Theme:** Move a checked-in guest to another room without rewriting folio money  
**Goal:** Front desk can move a `CHECKED_IN` stay to a vacant room on the same property, flip housekeeping status, record history, and flag key-card reissue. Folio stays on the reservation (no posted-row edits).  
**Branch:** `cursor/feat-room-move-6a5d`  
**Base:** `dev`  
**Source:** `docs/planning/prd.md` § Room Move Process + §12  
**Depends on:** Day-use (#33) and Split Stay (#39) — both shipped. Do not reopen them. Do not mix other Phase 4 epics.

## Working agreements

- **One epic, one PR.** Conventional Commits (`feat(reservations): …`). Tests co-located. No `any`, no `console.log`. Prisma **^6.19.2**.
- Additive `RoomMove` only. Do not mutate `FolioTransaction` rows. Updating `reservation.roomId` is the folio transfer.
- Key card is a boolean trigger (`keyCardReissued`). No encoder / hardware (Phase 5).
- Housekeeping uses `Room.status` only (same as check-in/out). No `HousekeepingTask` in this PR.
- Split-stay automatic room change at the split date stays later.
- No hardcoded UI copy. New strings in `apps/web/src/messages/en.json` + `th.json` via `t()`.

## Invariants

| Rule    | Constraint                                                                                                                                      |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Status  | Only `CHECKED_IN` reservations can move. Else 400.                                                                                              |
| Target  | `toRoomId !== fromRoomId`. Same `propertyId`. Else 400.                                                                                         |
| Vacancy | Reject `OUT_OF_ORDER`, `OUT_OF_SERVICE`, `OCCUPIED_*`. Allow `VACANT_CLEAN` and `VACANT_DIRTY`.                                                 |
| Dates   | Reuse reservation availability with `excludeReservationId`. Window = current stay covering now, else stay matching `roomId`, else header dates. |
| Rooms   | Old room → `VACANT_DIRTY`. New room → `OCCUPIED_CLEAN` or `OCCUPIED_DIRTY` if it was vacant dirty.                                              |
| Stay    | If a current `ReservationStay` exists, update that stay’s `roomId` + `roomTypeId` only.                                                         |
| History | Insert `RoomMove` with `folioTransferred=true` and `keyCardReissued=true`.                                                                      |
| Money   | Do not rewrite or delete folio transactions.                                                                                                    |

## Already done (do not redo)

- [x] Check-in / check-out room status flips
- [x] Folio on reservation (not room)
- [x] Split Stay segments (`ReservationStay`)
- [x] Labeled `EntitySelect` + `t()` i18n helper

## This PR

1. **DB** `RoomMove` + relations + migration + generate (Prisma 6).
2. **API** `POST /reservations/:id/room-move` (201) and `GET /reservations/:id/room-moves`.
3. **Web** `RoomMovePanel` on reservation detail when `CHECKED_IN`; mock router; i18n.
4. **Docs** PRD §12, roadmap, this sprint. Leave Phase 3 wait items alone.

## Out of scope

- Automatic split-stay room change at the split date
- VIP lock, walk, no-show, complimentary, extended stay, tax exemption
- Key encoder / hardware bridge
- AP, RD e-Tax, card gateway, P&L / bank rec
