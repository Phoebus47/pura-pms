# Current Sprint

## Sprint: Phase 7 — i18n & Multi-Property / CRS

- Status: `IN PROGRESS`
- Dates: 2026-08-24 → ongoing
- Goal: Deliver Thai localisation, Thai fonts/print, guest search, multi-property CRS, and guest self-service (portal / digital key / mobile check-in).

## Sprint Backlog & Deliverables

1. [x] **ADR 018 (`next-intl` foundation)**: App directory structure with `[locale]`, routing middleware, message catalogues (`en.json`, `th.json`), backward compatibility bridge with legacy `t()`. Merged to `dev` (PR #119).
2. [x] **Thai Translation (Critical FO pages)**: Full `t()` coverage for dashboard / reservations / guests / billing / night audit (landed on `cursor/feat-thai-pages-land-6a5d` / PR #126).
3. [x] **Thai Typography & Font Support**: Sarabun + `--font-thai`, `PrintDocument` wrapper, ADR 019 (on land branch).
4. [x] **Thai Search & Collation**: Unicode NFC multi-token search in `GuestsService.findAll()` (on `dev`).
5. [~] **Multi-Property / CRS**: Header `PropertySwitcher` + `activePropertyId` store on `dev` (UI switcher only; full CRS inventory/booking across properties not done).
6. [ ] **Guest Portal** (view folio, request services)
7. [ ] **Digital Key** (BLE/NFC mock)
8. [ ] **Mobile Check-in**
9. [ ] **Phase 7 closeout** (roadmap / prd / `.cursorrules`) + promote `dev` → `main`

## Blockers / Fixes

- [x] **Vercel Preview on `dev` failed** after Gemini commits: literal `\n` corruption in source + invalid `poolOptions` in Vitest 4 config (fixed on `cursor/fix-dev-vercel-6a5d`).
