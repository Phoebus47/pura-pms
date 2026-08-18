# Current Sprint — Phase 5 Hardware Bridge

**Status:** Ready for review
**Branch:** `cursor/feat-hardware-bridge-6a5d`
**Depends on:** Housekeeping inspection (`cursor/feat-hk-inspection-6a5d`, #91)
**Roles:** @PM → @Architect → @Backend → @Frontend → @QA

## Goal

Local Agent on the front-desk PC plus cloud job log so the web app can print,
encode a key card, scan a passport, and read a Thai ID without `window.print()`.

## Database

- `HardwareAgent` (property + machineId unique)
- `HardwareDevice` (printer, encoder, passport, Thai ID)
- `HardwareJob` (PENDING → COMPLETED/FAILED, optional idempotencyKey)
- Migration: `20260818060000_add_hardware_bridge`

## API

1. `GET /hardware-bridge/catalog`
2. `GET /hardware-bridge/agents?propertyId=`
3. `POST /hardware-bridge/agents`
4. `POST /hardware-bridge/agents/:id/heartbeat`
5. `GET /hardware-bridge/jobs?propertyId=`
6. `POST /hardware-bridge/jobs`
7. `POST /hardware-bridge/jobs/:id/complete`
8. `POST /hardware-bridge/jobs/:id/fail`
9. `POST /hardware-bridge/jobs/:id/simulate`

## Local Agent

- `apps/hardware-bridge` on `127.0.0.1:9247`
- `GET /health`, `GET /devices`
- `POST /print`, `/keycard/encode`, `/scan/passport`, `/scan/id-card`

## Web

- `/hardware-bridge` agents, jobs, test actions, local health
- Nav: Hardware
- i18n `hardwareBridge.*` (EN + TH)
- `local-bridge.ts` client for localhost

## Wait

- Vendor SDKs (VingCard / Salto / Hafele)
- Pairing tokens / mTLS
- Auto-fill guest create from scan
- Migrate tax-invoice / AR `window.print()` pages
- POS, fiscal printer, cash drawer, BLE digital key
