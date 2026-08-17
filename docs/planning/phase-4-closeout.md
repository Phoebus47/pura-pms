# Phase 4 Closeout

**Role:** Technical PM  
**Decision:** Phase 4 Operations Edge Cases complete — promote to `main`.  
**Date:** 2026-08-17  
**Sources:** `docs/planning/prd.md` §4.3, §12; `docs/planning/roadmap.md`; merged PRs #33–#84.

## Status (2026-08-17)

**All Phase 4 epics are shipped** on `dev` and promoted to `main` via merge PR.

| #   | Epic                           | PR / notes                             |
| --- | ------------------------------ | -------------------------------------- |
| 1   | Day-use Reservations           | #33                                    |
| 2   | Split Stay                     | #39                                    |
| 3   | Room Move Mid-stay             | RoomMove model, folio follows, HK flip |
| 4   | No-show / Late Cancellation    | Auto-charge on Night Audit             |
| 5   | Post-departure Charges         | Reopen closed folio, AR transfer       |
| 6   | Overbooking Recovery (Walk)    | PartnerHotel, Walk record              |
| 7   | Complimentary / House Use      | `StayPurpose` COMP/HOUSE (#81)         |
| 8   | Extended Stay Billing          | `BillingCycle`, interim folio (#82)    |
| 9   | Tax Exemption                  | `taxExempt` + document fields (#83)    |
| 10  | VIP Room Pre-assignment & Lock | `isRoomLocked` + note (#84)            |

## Migrations (additive)

Applied to Supabase production:

- `20260817063000_add_reservation_stay_purpose`
- `20260817075000_add_extended_stay_billing`
- `20260817083000_add_reservation_tax_exemption`
- `20260817090000_add_reservation_room_lock`

Run `pnpm --filter database exec prisma migrate deploy` on any new environment.

## Next: Phase 5

See `docs/planning/roadmap.md` — Rate Derivation, Dynamic Pricing, Allotment & Blocks, HK Inspection, PWA, etc.

**Do not reopen Phase 4 epics** unless a production bug is filed.
