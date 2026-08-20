# ADR 012: Manual TM.30 immigration reporting (no immigration API)

- **Status**: Accepted
- **Date**: 2026-08-20
- **Owners**: @Architect
- **Deciders**: @Architect, @PM
- **Related**:
  - `docs/planning/prd.md` § 4.19 TM30 Immigration Reporting
  - `packages/database/prisma/schema.prisma` (`Tm30Report`)
  - `apps/api/src/tm30-reports/`
  - `apps/web/src/app/tm30/`

## Context

Thai hotels must report foreign guests to Immigration (ตม.) within 24 hours
of check-in (TM.30). There is no official immigration API in this stack.
Passport OCR already exists as Hardware Bridge jobs; TM.30 must use stored
guest identity fields (`idNumber`, `nationality`).

## Decision

1. **`Tm30Report`** snapshots passport/name/nationality/room/dates at generate
   time. Unique `(reservationId, guestId)`. Status: `PENDING` → `SUBMITTED` →
   `CONFIRMED`, or `FAILED`. `dueAt` = arrival + 24 hours.
2. **Generate** from `CHECKED_IN` stays whose nationality is not Thai and who
   have a passport/ID number. Idempotent: existing rows are skipped.
3. **Manual FO actions** — submit / confirm / fail. Export as TSV for the
   immigration portal. No auto-upload, OCR, or cron in v1.
4. **Web**: `/tm30` list with overdue highlight and generate/export actions.
5. **Migration**: `20260820080000_add_tm30_report`.

## Rationale

- Unblocks legal FO workflow without a vendor immigration API.
- Snapshots keep the filed record stable if the guest profile later changes.
- YAGNI: auto-upload and check-in hooks wait until a property needs them.

## Consequences

### Positive

- Desk can generate, track, and export TM.30 rows within the 24-hour window.

### Negative / Trade-offs

- Thai vs foreign is inferred from `nationality` text (`TH` / `THA` / `THAI`).
- Gender is not on `Guest`; omitted from v1 export.

### Follow-ups

- Auto-create on foreign-guest check-in.
- Immigration portal API when available (`TM30_API_ENABLED`).
