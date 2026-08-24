# ADR 019: Thai Font Support for UI and Browser Print

- **Status**: Accepted
- **Date**: 2026-08-24
- **Owners**: @Frontend
- **Deciders**: @Architect, @PM
- **Related**: Phase 7 Module 7C, ADR 018, `docs/planning/prd.md` §9.4

## Context

Phase 7A–7B added next-intl locales (`en`, `th`) and Thai copy on critical FO pages. Geist (latin-only) is the UI font in `apps/web/src/app/[locale]/layout.tsx`. Thai glyphs therefore fall back to the OS, which is inconsistent in **browser print / Save as PDF** for tax invoices, AR statements, and registration cards.

Constraints:

- Out of scope: jsPDF / react-pdf pipelines, Revenue Department e-Tax
- Print is `window.print()` on existing client pages under `[locale]`
- Mixed English UI + Thai guest names must render on both locales
- Thai tone marks must not float (avoid aggressive size-adjust fallbacks)

## Decision

1. Load **Prompt** via `next/font/google` in `apps/web/src/lib/fonts.ts` with `subsets: ['latin', 'thai']` and CSS variable `--font-thai`.
2. Register `--font-thai` on `<html>` in `apps/web/src/app/[locale]/layout.tsx` for every locale (not only `th`) so mixed copy works.
3. Stack fonts in `apps/web/src/app/globals.css`:
   - Default: Geist, then Prompt
   - `html[lang='th']`: Prompt, then Geist
   - `@media print`: same Prompt-first stack on `html:root`, `body`, and `.print-document` so print CSS cannot drop Thai
4. Wrap tax invoice, AR statement, and registration-card print clients with `PrintDocument` (class `print-document`) so those reports share the variable. Folio `window.print()` uses the same body print stack.

## Rationale

- **next/font** self-hosts Google Fonts (no runtime `fonts.googleapis.com` in the page), matches App Router, and keeps one CSS variable for screen and print.
- **Prompt** is the PRD first choice (Sarabun / Noto Sans Thai remain drop-in alternatives via the same `--font-thai` contract).
- **Always load Thai** avoids missing glyphs on English screens that still show Thai names/addresses.
- **Browser print** is the current PDF path; a dedicated PDF engine can reuse the same CSS variable later.

## Consequences

### Positive

- Thai UI and print/PDF from the browser use one webfont.
- English screens still render Thai guest data.
- Print wrappers stay small and share one class for CSS.

### Negative / risks

- Extra font files (Prompt weights 400–700) vs Geist-only.
- `adjustFontFallback: false` may slightly change Latin metrics vs Geist.

### Mitigations

- Limit Prompt weights to 400/500/600/700.
- Keep Geist first on `en` so Latin metrics stay familiar.

## Alternatives considered

1. **Sarabun or Noto Sans Thai** — valid; Prompt chosen as PRD primary. Swap the `next/font` import; keep `--font-thai`.
2. **jsPDF / react-pdf with embedded TTF** — rejected for 7C (separate pipeline, e-Tax later).
3. **Load Prompt only when `locale === 'th'`** — rejected (Thai names on English locale would still miss glyphs).
4. **System `Tahoma` / `Leelawadee` print stack** — rejected (inconsistent across OS, poor web UI).

## Implementation notes

- **Files**:
  - `apps/web/src/lib/fonts.ts`
  - `apps/web/src/app/[locale]/layout.tsx`
  - `apps/web/src/app/globals.css`
  - `apps/web/src/components/shared/print-document.tsx`
  - `apps/web/src/app/[locale]/tax-invoices/[id]/print/tax-invoice-print-client.tsx`
  - `apps/web/src/app/[locale]/ar-accounts/[id]/statement/ar-statement-print-client.tsx`
  - `apps/web/src/app/[locale]/registration-cards/[id]/print/registration-card-print-client.tsx`
- **Test plan**:
  - `pnpm --filter web test`
  - `pnpm --filter web type-check`
  - `pnpm --filter web lint`
  - `pnpm format:check`
