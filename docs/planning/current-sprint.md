# Current Sprint — Phase 6 TM.30

## Goal

Front office can generate TM.30 rows for foreign in-house guests, mark
submission status, highlight overdue (24h), and export TSV for Immigration.

## Scope

- `Tm30Report` + `Tm30Status`
- `POST /tm30-reports/generate`
- submit / confirm / fail
- TSV export
- `/tm30` board (en/th)

## Out of scope

- Immigration API upload
- Passport OCR extraction
- Auto-create on check-in
