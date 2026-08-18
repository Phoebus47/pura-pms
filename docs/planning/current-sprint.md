# Current Sprint — Phase 5 Rate Derivation

**Status:** In progress  
**Branch:** `cursor/feat-rate-derivation-6a5d`  
**Depends on:** Phase 4 closeout (merged to `main`)

## Goal

Parent/child rate plans with a formula engine. Changing a parent amount immediately recalculates derived children (and grandchildren).

## Schema

- `RateDeriveMode`: `PERCENT_OFFSET | AMOUNT_OFFSET`
- `Rate.parentRateId`, `deriveMode`, `deriveValue`
- Migration: `20260818020000_add_rate_derivation`

## API

1. `POST/GET/PATCH /rates` — catalog CRUD
2. Derived create computes `amount` from the parent
3. Parent amount update cascades to children
4. Cycle and negative-amount guards; derived amount cannot be set by hand

## Web

- `/rates` catalog with parent picker and formula fields
- Nav: Rates
- i18n `rates.*`

## Deploy

Additive migration. Apply to Supabase after merge.
