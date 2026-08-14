# Current Sprint — Phase 4 Split Stay (PR 1)

**Theme:** Planned room-type segments on one reservation  
**Goal:** Create / update / display split stays (different room types, one confirmation). Automatic room move at split point is **out of scope**.  
**Branch:** `cursor/feat-split-stay-6a5d`  
**Source:** `docs/planning/prd.md` §4.2 + Phase 4; `docs/planning/roadmap.md` Split Stay (room-type slices only)  
**Depends on:** Day-use (shipped). Do not reopen Room Move.

## Working agreements

- **Split stay** = ≥2 planned `ReservationStay` slices on one reservation; ≥2 distinct `roomTypeId`.
- **No backfill.** Header-only reservations stay as today (`stays` empty).
- `Reservation.roomId` = **CURRENT** room (`stays[0].roomId` on create; same after replace-on-update).
- `isDayUse` + `stays` = invalid (400).
- Nested on existing `POST` / `PATCH /reservations` (`stays?: ReservationStayInputDto[]`). No new REST resource.
- Inventory = header-only `buildRoomConflictWhere` (`stays: none`) **UNION** `ReservationStay` overlap. Split headers are not counted on `Reservation.roomId` for the full stay.
- Night Audit PR 1: post **covering stay** rate for `businessDate`. Not a new job.
- No hardcoded UI copy. New strings in `messages/en.json` + `messages/th.json` (camelCase). Do not build full i18n foundation (locale routing) in this PR.
- Tests with the change; >80% on new critical paths.

## Invariants (do not reopen)

When `stays` is present and non-empty:

| Rule           | Constraint                                                     |
| -------------- | -------------------------------------------------------------- |
| Count          | `length ≥ 2`                                                   |
| Types          | ≥ 2 distinct `roomTypeId` (resolved from each `roomId`)        |
| Adjacent rooms | adjacent segments have different `roomId`                      |
| Contiguous     | `stays[i].endDate === stays[i+1].startDate` (no gaps/overlaps) |
| Bounds         | `stays[0].startDate === checkIn`; last `endDate === checkOut`  |
| First room     | `stays[0].roomId === Reservation.roomId`                       |
| Segment dates  | each `startDate < endDate`; overnight only (not day-use)       |

**PATCH `stays` semantics**

- omitted → leave existing stays unchanged
- `length ≥ 2` → **replace** (deleteMany + create); set header `roomId`/`roomRate`/`rateCode` from `stays[0]`; recompute `nights` + `totalAmount`
- `[]` → delete stays; revert to header-only (header room/dates remain)
- `isDayUse: true` with any stays → 400

---

## Already done (do not redo)

- [x] Prisma `ReservationStay` + FKs/indexes + `Room`/`RoomType` reverse relations
- [x] Migration `20260814164000_add_reservation_stay`
- [x] `reservation-stay.util.ts`: `splitStayError`, `calculateSplitStayTotal`, `buildStaySegmentConflictWhere`
- [x] `ReservationStayInputDto` nested on `CreateReservationDto` (inherited by PATCH via `PartialType`)
- [x] `create()` split path: resolve drafts, validate, `assertRoomsAvailable` (header **and** stay overlap), nested `stays.create`
- [x] Service specs: create split stay; reject day-use + stays

---

## 1. Step-by-step implementation order (this PR only)

1. **DB-1** `prisma generate` so `ReservationStay` types compile.
2. **DB-2** Relations test (cascade, unique sequence, header-only empty stays).
3. **BE-1** Util specs + `findStayCoveringBusinessDate`.
4. **BE-2** `update()` replace / clear stays + inventory + day-use guard.
5. **BE-3** `findAll` / `findOne` / `findByConfirmNumber` include ordered `stays`.
6. **BE-4** Calendar occupancy **per segment** (not header `roomId` for the whole stay).
7. **BE-5** `GET /rooms/availability` treats stay overlap as occupied.
8. **BE-6** Night Audit `processRoomPosting`: rate from covering stay.
9. **FE-1** Types + API client `stays`.
10. **FE-2** i18n keys for new Split Stay copy.
11. **FE-3** New-reservation form: add segments; mutually exclusive with day-use.
12. **FE-4** List + detail badge/timeline.
13. **FE-5** Calendar: paint each segment on its room/dates.
14. **QA-1..QA-4** Specs/tests per layer; type-check + lint.

---

## 2. Tasks by layer

### Database

| ID       | Task                                                                                                                                                                                       | Complexity | Status      |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ----------- |
| **DB-1** | Run `pnpm --filter database exec prisma generate` (and API generate if separate). Confirm `@pura/database` exports `ReservationStay`.                                                      | Low        | Not started |
| **DB-2** | `packages/database/prisma/relations.test.ts`: Reservation → stays (ordered, cascade on delete); Room/RoomType reverse; `@@unique([reservationId, sequence])`; header-only has `stays: []`. | Medium     | Not started |

No schema/migration changes expected. No backfill. No seed of historical stays (YAGNI).

### Backend

| ID       | Task                                                                                                                                                                                                                                                                                                                                                                                                                                               | Files                                       | Complexity | Status      |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------- | ----------- |
| **BE-1** | Complete util specs: `splitStayError` (all invariant failures + happy path + empty stays = null), `calculateSplitStayTotal`, `buildStaySegmentConflictWhere`. Add `findStayCoveringBusinessDate(stays, businessDate)` → stay where `startDate ≤ businessDate < endDate`, else null. Specs for covering / checkout-day miss / header-only.                                                                                                          | `reservation-stay.util.ts`, `.spec.ts`      | Medium     | Partial     |
| **BE-2** | `update()`: if `stays` in DTO, validate with `splitStayError`, `assertRoomsAvailable` (exclude self), replace or clear per semantics above. Strip nested `stays` from Prisma `updateData` (not a scalar). Reject day-use + stays. If dates change on an existing split stay and `stays` omitted → 400 (bounds would break) **or** require `stays` in the same PATCH. Prefer: dates+stays must be sent together when reservation already has stays. | `reservations.service.ts`                   | High       | Not started |
| **BE-3** | Reuse `reservationInclude` (or equivalent) on `findAll`, `findOne`, `findByConfirmNumber`, `update`, `cancel`, `checkIn`, `checkOut`. Stays ordered by `sequence`, include `room` + `roomType`.                                                                                                                                                                                                                                                    | `reservations.service.ts`                   | Low        | Not started |
| **BE-4** | `getCalendar`: load overlapping header reservations **or** overlapping stays. For each room row, emit occupancy from (a) header-only on `roomId` for `[checkIn, checkOut)`, **or** (b) segments with `stay.roomId === room.id` for `[startDate, endDate)`. Include stay `roomType` / rates on calendar items.                                                                                                                                      | `reservations.service.ts`                   | High       | Not started |
| **BE-5** | `RoomsService.getAvailability`: room is busy if header overlap **or** `reservationStays` overlap (exclude `CANCELLED`/`NO_SHOW`). Keep day-use occupancy behavior.                                                                                                                                                                                                                                                                                 | `apps/api/src/rooms/rooms.service.ts`       | Medium     | Not started |
| **BE-6** | `NightAuditService.processRoomPosting`: `include: { stays: { orderBy: sequence } }`. If `stays.length > 0`, post `covering.roomRate`; skip if no covering stay. Else post header `roomRate` (today). Still skip `isDayUse`. Same idempotency key (window + trxCode + businessDate). **No new BullMQ job.**                                                                                                                                         | `night-audit.service.ts`                    | Medium     | Not started |
| **BE-7** | Service specs: update replace/clear; inventory conflict via stay overlap; findOne includes stays; calendar paints segment on second room only for those dates; availability hides room on later segment; NA posts segment rate not header. Controller: nested `stays` accepted on POST/PATCH (no new routes).                                                                                                                                      | `*.service.spec.ts`, `*.controller.spec.ts` | High       | Partial     |

### Frontend

| ID       | Task                                                                                                                                                                                                                                                                                                                                                                     | Files                                                                    | Complexity | Status      |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ---------- | ----------- |
| **FE-1** | Add `ReservationStay` + `stays?` on `Reservation` / `CreateReservationDto`. Mock router: persist nested stays on POST/PATCH; list/detail return them.                                                                                                                                                                                                                    | `apps/web/src/lib/api/reservations.ts`, `mock/router.ts`, `mock/data.ts` | Low        | Not started |
| **FE-2** | New copy only (badge, form labels, validation toasts, segment table headers) in `messages/en.json` + `messages/th.json` under e.g. `reservations.splitStay.*`. Consume via `useTranslations`. Do **not** implement locale routing / next-intl app-wide foundation. If `useTranslations` is not wired, add a thin helper that reads those files so copy is not hardcoded. | `messages/*.json`, new/changed UI                                        | Medium     | Not started |
| **FE-3** | New reservation form: optional “add stay segment” (room + dates + rate per slice). Day-use checkbox disables segments and vice versa. Client checks: ≥2 segments, contiguous, ≥2 room types. `roomId` = first segment. Availability lookup per segment dates (`roomsAPI` availability). Submit nested `stays`.                                                           | `apps/web/src/app/reservations/new/page.tsx`                             | High       | Not started |
| **FE-4** | `SplitStayBadge` (pattern: `DayUseBadge`). List: badge when `stays.length ≥ 2`. Detail: read-only segment table (dates, room, type, nights, rate).                                                                                                                                                                                                                       | `components/`, `reservations/page.tsx`, `[id]/page.tsx`                  | Medium     | Not started |
| **FE-5** | Calendar: occupancy by segment room/dates, not the full stay on header room. Badge on events.                                                                                                                                                                                                                                                                            | `reservations/calendar/page.tsx`                                         | Medium     | Not started |
| **FE-6** | Co-located tests: types/submit payload; form validation (day-use xor stays; <2 segments); badge/detail/list; calendar segment placement. a11y: labels `htmlFor`, 44px targets.                                                                                                                                                                                           | `*.test.tsx`                                                             | Medium     | Not started |

### QA

| ID       | Task                                                                                                                                                                                                                                                                              | Complexity | Status      |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------- |
| **QA-1** | Util matrix: empty stays; 1 stay; same type twice; same adjacent room; gap; overlap; bounds mismatch; first room ≠ header; day-use + stays; happy 2-type contiguous. Covering-date helper.                                                                                        | Medium     | Not started |
| **QA-2** | Service: create conflict (header vs stay overlap); update replace; update `[]` clears; PATCH dates without stays on split reservation; find/calendar/availability. NA: header-only rate; split posts stay B rate on B’s dates; skip checkout day; idempotent; still skip day-use. | High       | Partial     |
| **QA-3** | DB relations (DB-2). Web RTL as FE-6. Mock API nested stays.                                                                                                                                                                                                                      | Medium     | Not started |
| **QA-4** | Gate: `pnpm --filter database test`, `pnpm --filter api test`, `pnpm --filter web test`, type-check, lint. No `any`, no `console.log`.                                                                                                                                            | Low        | Not started |

---

## 3. Dependencies

```
DB-1 (generate)
  ├─ DB-2
  ├─ BE-1 ──► BE-6 (covering stay) ──► QA-2 (NA cases)
  ├─ BE-2 (update replace) ──► BE-7 / QA-2
  ├─ BE-3 (include stays) ──► FE-1, FE-4
  ├─ BE-4 (calendar occupancy) ──► FE-5
  └─ BE-5 (availability) ──► FE-3 (per-segment room pick)
FE-1 ──► FE-3, FE-4, FE-5
FE-2 ──► FE-3, FE-4, FE-5 (copy)
FE-3 / FE-4 / FE-5 ──► FE-6 / QA-3
QA-4 after all of the above
```

**Blocked on DB-1:** any TypeScript that imports `ReservationStay`.  
**Blocked on BE-3 + FE-1:** list/detail badge.  
**Blocked on BE-4 + BE-5:** truthful calendar + form availability.  
**Blocked on BE-1 covering helper:** Night Audit BE-6.

---

## 4. Explicit out of scope (this PR)

- Room Move mid-stay (`RoomMove` model, folio transfer, HK dirty/occupied flip at split, key-card re-issue)
- Automatic room move at split point (roadmap checkbox — **later PR**)
- Night Audit auto-move job / new BullMQ queue
- Folio-per-room or extra folio windows because of split
- No-show / late cancellation auto-charges
- HK machine / inspection workflow
- Backfilling `ReservationStay` for existing reservations
- Changing day-use rules (already shipped)
- New endpoints (`/reservations/:id/stays`) — nested DTO only
- Check-in occupying future segment rooms
- Drag-and-drop calendar editing of segments

---

## Acceptance criteria (PR 1)

- [ ] Header-only create/update/list/calendar/NA unchanged.
- [ ] POST with valid `stays` persists segments; `roomId` = first segment; total = sum of segment nights × rates.
- [ ] Invalid stays / day-use + stays → 400; room overlap (header **or** stay) → 409.
- [ ] PATCH replace and PATCH `stays: []` behave as specified.
- [ ] GET detail/list return ordered `stays`.
- [ ] Calendar and availability occupy each room only on its segment dates.
- [ ] Night Audit posts covering-stay `roomRate` for split in-house reservations; skips day-use; no double-post.
- [ ] Web: create split stay, see badge + segment table, calendar shows both rooms; copy from messages, not literals.
- [ ] Tests + type-check + lint green.
