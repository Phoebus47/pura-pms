# Current Sprint — Phase 4 Extended Stay Billing

**Status:** In progress  
**Branch:** `cursor/feat-extended-stay-6a5d`  
**Depends on:** Complimentary / House Use (`cursor/feat-comp-house-use-6a5d`, PR #81)

## Goal

Weekly and monthly billing cycles for long-term guests: cycle-rate room posting at cycle end, auto interim folio close/open, and `ReportArchive` (`INTERIM_FOLIO`).

## Schema

- `BillingCycle` enum: `NIGHTLY | WEEKLY | MONTHLY` (default `NIGHTLY`)
- `Reservation.billingCycle`, `Reservation.lastInterimBillingDate`
- `Folio.isInterim`
- Migration: `20260817075000_add_extended_stay_billing`

## API

1. Create/update: `billingCycle` on reservation DTO; `roomRate` is the **cycle rate** for weekly/monthly; `totalAmount` via `calculateExtendedStayTotal`. Not allowed with day-use or split stays.
2. Night Audit `processRoomPosting`: skip non-cycle-end days for `WEEKLY`/`MONTHLY`; post lump `roomRate` on cycle end.
3. Night Audit `processInterimFolios`: close open folio (`closeAsInterim`), create new folio, archive `INTERIM_FOLIO`, set `lastInterimBillingDate`.
4. `FoliosService.closeAsInterim()` — closes without credit-limit check, sets `isInterim: true`.

## Web

- Billing cycle select on new reservation (disabled for day-use / split stay)
- `BillingCycleBadge` on list/detail
- Interim label on folio tabs
- i18n `reservations.billingCycle.*`, `folios.interimLabel`

## Deploy

Run `prisma migrate deploy` (or Supabase `apply_migration`) for `20260817075000_add_extended_stay_billing` after merge.
