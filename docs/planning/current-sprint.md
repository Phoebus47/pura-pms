# Current Sprint — Phase 4 Tax Exemption

**Status:** In progress  
**Branch:** `cursor/feat-tax-exemption-6a5d`  
**Depends on:** Extended Stay Billing (merged to `dev`)

## Goal

Flag diplomatic / government / international-organization stays so folio charges skip VAT (7%). Store exemption reason, document reference, and approver. Posted transactions stay immutable — only new postings skip tax.

## Schema

- `TaxExemptReason` enum: `DIPLOMATIC | GOVERNMENT | INTERNATIONAL_ORG | OTHER`
- `Reservation.taxExempt` (default false), `taxExemptReason`, `taxExemptDocumentRef`, `taxExemptApprovedBy`
- Migration: `20260817083000_add_reservation_tax_exemption`

## API

1. Create/update: tax-exempt stays require reason + document ref + approver. Cannot change after checkout/cancel/no-show/walk.
2. `GET /reservations?taxExempt=true`
3. Folio posting: `computePostingAmounts(..., { taxExempt })` skips VAT when the reservation is exempt (service charge still applies). Package split inherits the same flag.

## Web

- Tax-exempt checkbox on new reservation; document fields on confirm
- `TaxExemptBadge` on list/detail
- Document/reason/approver on reservation detail
- i18n `reservations.taxExempt.*`

## Deploy

Run `prisma migrate deploy` after merge (additive).
