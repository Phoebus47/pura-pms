# Current Sprint — Phase 5 Digital Registration Card

**Status:** In progress
**Branch:** `cursor/feat-digital-reg-card-6a5d`
**Base:** `dev`
**Roles:** @PM → @Architect → @Backend → @Frontend → @QA

## Goal

Tablet signature capture for Thai registration card (ใบลงทะเบียน), immutable
snapshots, print via Hardware Bridge `REG_CARD` job.

## Database

- `RegistrationCard` model with `DRAFT` / `SIGNED` / `VOID`
- JSON snapshots + PNG signature base64
- Versioning on re-sign

## API

- `POST /registration-cards` — create draft from reservation
- `GET /registration-cards?reservationId=` — list
- `GET /registration-cards/:id` — detail
- `POST /registration-cards/:id/sign` — capture signature
- `POST /registration-cards/:id/void` — void signed card
- `POST /registration-cards/:id/print-job` — Hardware Bridge PRINT job

## Web

- `/registration-cards/[id]/sign` — canvas signature pad
- `/registration-cards/[id]/print` — printable preview + hardware print
- Panel on `/reservations/[id]` with soft check-in warning

## Wait

- PDPA consent module
- TM.30 auto-export
- Kiosk / offline signature
- Hard check-in gate
