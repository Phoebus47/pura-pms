# Current Sprint — Phase 5 Wake-up Call

**Status:** In progress
**Branch:** `cursor/feat-wakeup-call-6a5d`
**Base:** `dev`
**Roles:** @PM → @Architect → @Backend → @Frontend → @QA

## Goal

Manual wake-up call scheduling and FO delivery confirmation (no PBX in v1).

## Database

- `WakeUpCall` with `SCHEDULED` / `COMPLETED` / `MISSED` / `CANCELLED`
- Links property, reservation, room; `scheduledDate` for board filters

## API

- `GET /wake-up-calls?propertyId=&scheduledDate=`
- `GET /wake-up-calls?reservationId=`
- `POST /wake-up-calls` — schedule
- `POST /wake-up-calls/:id/complete|miss|cancel`

## Web

- `/wake-up-calls` board
- Panel on reservation detail

## Wait

- PBX / Hardware Bridge dial
- Auto-miss after scheduled time
