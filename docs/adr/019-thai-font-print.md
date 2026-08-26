# ADR 019: Thai Font Support for UI and Browser Print

- **Status**: Accepted
- **Date**: 2026-08-24
- **Owners**: @Frontend
- **Deciders**: @Architect, @PM
- **Related**: Phase 7 Module 7C, ADR 018, `docs/planning/prd.md` §9.4

## Context

Phase 7A–7B added next-intl locales (`en`, `th`) and Thai copy on critical FO pages. Geist (latin-only) is the primary English UI font. Thai glyphs need a consistent loaded face for **screen and browser print / Save as PDF** (tax invoices, AR statements, registration cards).

Constraints:

- Out of scope: jsPDF / react-pdf pipelines, Revenue Department e-Tax
- Print is `window.print()` on existing client pages under `[locale]`
- Mixed English UI + Thai guest names must render on both locales

## Decision

1. Load **Sarabun** via `next/font/google` in `apps/web/src/app/[locale]/layout.tsx` with `subsets: ['thai', 'latin']` and CSS variable `--font-sarabun`.
2. Map `--font-thai` → Sarabun in `apps/web/src/app/globals.css` so screen and print share one contract (`FONT_THAI_VARIABLE`).
3. Stack fonts:
   - Default: Geist, then Sarabun
   - `@media print`: Thai-first stack on `html`, `body`, and `.print-document`
4. Wrap tax invoice, AR statement, and registration-card print clients with `PrintDocument` (class `print-document`).

## Rationale

- **next/font** self-hosts Google Fonts and keeps one CSS variable for screen and print.
- **Sarabun** is already on `dev` (Gemini land); Prompt remains a drop-in alternative via the same `--font-thai` contract (PRD lists both).
- **Browser print** is the current PDF path; a dedicated PDF engine can reuse the same CSS variable later.

## Consequences

### Positive

- Thai glyphs render consistently in UI and print without OS fallback lottery.
- Print clients share one accessible wrapper (`aria-label` via `print.documentLabel`).

### Negative / follow-ups

- True vector PDF (jsPDF) still future work.
- Full CRS / guest portal fonts are covered by the same stack once those routes exist.
