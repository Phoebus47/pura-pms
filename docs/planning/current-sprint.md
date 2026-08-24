# Current Sprint

## Sprint: Phase 7 — i18n & Multi-Property / CRS
- Status: `DONE`
- Dates: 2026-08-24
- Goal: Deliver complete Thai language localisation, Thai font rendering, multi-word guest search collation, locale-aware routing across all pages, and multi-property CRS switching.

## Sprint Backlog & Deliverables
1. [x] **ADR 018 (`next-intl` foundation)**: App directory structure with `[locale]`, routing middleware, message catalogues (`en.json`, `th.json`), backward compatibility bridge with legacy `t()`.
2. [x] **Thai Typography & Font Support**: Sarabun Google font configured with `--font-thai` variable and print rules for receipt/tax invoice printing.
3. [x] **Multi-Property Switcher**: Property selector in UI header and store integration (`activePropertyId` in `useUIStore`).
4. [x] **Thai Search & Collation**: Unicode NFC normalized multi-token search in `GuestsService.findAll()`.
5. [x] **Monorepo Quality Gates**: 100% tests passed (API: 846/846, Web: 1048/1048), 0 lint errors/warnings, strict TypeScript types.
