# ADR 007: Hardware Bridge as localhost agent + cloud job log

- **Status**: Accepted
- **Date**: 2026-08-18
- **Owners**: @Architect
- **Deciders**: @Architect, @PM
- **Related**:
  - `docs/planning/prd.md` §2.2 Local Device Agent
  - `packages/database/prisma/schema.prisma` (`HardwareAgent`, `HardwareDevice`, `HardwareJob`)
  - `apps/api/src/hardware-bridge/`
  - `apps/hardware-bridge/` (local HTTP agent)
  - `apps/web/src/lib/api/local-bridge.ts`

## Context

Browsers cannot talk to printers, key-card encoders, passport scanners, or
Thai ID readers. PURA is a cloud web app (Vercel) plus NestJS API (Render),
so the API cannot reach USB devices on a front-desk PC either.

PRD requires a small Local Agent on the workstation. Vendor SDKs (VingCard,
Salto, Hafele) are not in this repo. Night Audit BullMQ is the wrong queue:
hardware work must run next to the device, not in Redis on the server.

## Decision

1. **Local Agent** binds to `127.0.0.1:9247` and exposes print / encode /
   passport-scan / Thai-ID-read. Browser calls it; cloud never dials LAN.
2. **Cloud** stores `HardwareAgent`, `HardwareDevice`, and `HardwareJob` for
   pairing, audit, and idempotency. The web UI creates a job, talks to the
   agent, then completes or fails the job.
3. **Adapters** are an interface plus a GENERIC mock. Vendor adapters stay
   stubs until an SDK is installed at the property.
4. **Simulate** on the cloud API completes a job with mock adapter output so
   FO can demo without the agent. This is not a substitute for production
   print/encode.
5. Agent listens on loopback only. Pairing mTLS / API keys wait. Do not use
   `window.print()` for new hardware flows; existing tax-invoice print pages
   migrate in a later slice.
6. POS, fiscal printers, cash-drawer kick, and BLE digital keys are out of
   scope. Guest create/update from scan waits (job `result` holds fields).

## Rationale

- Correctness: cloud cannot own USB; jobs are an audit log, not a printer.
- Security: loopback avoids exposing encoders on the LAN in v1.
- YAGNI: mock adapters unblock UI and tests without vendor binaries.

## Consequences

### Positive

- Front desk gets a contract and a runnable mock agent.
- Print / encode / scan are testable without hardware.

### Negative / risks

- Real vendor SDKs still need a property-specific agent build.
- Simulate can be mistaken for a live encode.

### Mitigations

- UI labels simulate as offline/demo. Vendor adapters throw until wired.

## Alternatives considered

1. Cloud API talks to devices — rejected; Render cannot see USB.
2. Electron-only, no cloud jobs — rejected; no audit or idempotency.
3. BullMQ for print jobs — rejected; worker is not on the front-desk PC.

## Implementation notes

- **Files**: `apps/api/src/hardware-bridge/**`, `apps/hardware-bridge/**`,
  `apps/web/src/app/hardware-bridge/**`
- **Tests**: `pnpm --filter api exec vitest run src/hardware-bridge` and web
  `src/app/hardware-bridge`
