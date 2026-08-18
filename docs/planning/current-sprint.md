# Current Sprint — Phase 5 Dynamic Pricing / Yield

**Status:** In progress  
**Branch:** `cursor/feat-yield-pricing-6a5d`  
**Depends on:** Rate Derivation (`cursor/feat-rate-derivation-6a5d`)

## Goal

Pace versus last year, competitor rate capture, and rule-based rate recommendations. Applying a recommendation updates a standalone parent rate (derived children cascade).

This slice is **not** a machine-learning model. See ADR 004.

## Schema

- `CompetitorRate` — manual competitor amount by stay date
- `YieldRecommendation` — PENDING / APPLIED / DISMISSED
- Migration: `20260818030000_add_yield_management`

## API

1. `GET /yield/pace?propertyId`
2. `POST /yield/recommendations/generate`
3. `GET /yield/recommendations`
4. `POST /yield/recommendations/:id/apply` | `dismiss`
5. `GET/POST/PATCH /yield/competitors`

## Rules

- Occupancy ≥ 85% → raise 10% (`HIGH_DEMAND`)
- Occupancy < 70% and competitor ≥ 8% cheaper → match competitor (`COMP_UNDERCUT`)
- Occupancy ≤ 40% and pace ≤ −10pp vs last year → lower 10% (`SLOW_PACE`)
- Derived and zero-amount (COMP/HOUSE) rates are skipped

## Web

- `/yield` — pace table, recommendations, competitor form
- Nav: Yield
- i18n `yield.*`
