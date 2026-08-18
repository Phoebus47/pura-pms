# ADR 009: Digital Registration Card with tablet signature

- **Status**: Accepted
- **Date**: 2026-08-18
- **Owners**: @Architect
- **Deciders**: @Architect, @PM
- **Related**:
  - `docs/planning/prd.md` § Digital registration card
  - `packages/database/prisma/schema.prisma` (`RegistrationCard`)
  - `apps/api/src/registration-cards/`
  - `apps/web/src/app/registration-cards/`
  - ADR 007 (Hardware Bridge `PRINT` with `jobType: REG_CARD`)

## Context

Thai hotels must capture guest registration (ใบลงทะเบียน) at check-in.
Paper cards are slow, hard to archive, and do not integrate with PURA's
cloud PMS. PRD requires tablet signature capture, digital storage, and
print via the local Hardware Bridge — not `window.print()`.

Full PDPA consent module, TM.30 auto-export, kiosk mode, and offline
signature are deferred.

## Decision

1. **`RegistrationCard` model** stores immutable JSON snapshots
   (`guestSnapshot`, `staySnapshot`, `propertySnapshot`) at draft creation.
   Signature is PNG base64 (`data:image/png;base64,...`). Status:
   `DRAFT` → `SIGNED` → `VOID`. Re-sign creates `version + 1` draft.
2. **Nest module** `registration-cards` exposes create draft, list by
   reservation, get, sign, void, and `print-job` (creates Hardware Bridge
   `PRINT` job with `payload.jobType: 'REG_CARD'`).
3. **Web routes**: `/registration-cards/[id]/sign` (tablet pad),
   `/registration-cards/[id]/print` (preview + hardware print), and a panel
   on `/reservations/[id]`.
4. **Check-in gate v1**: UI warns when no `SIGNED` card exists; API check-in
   stays unchanged (soft gate only).
5. **Migration**: `20260818070000_add_registration_card`.

## Rationale

- Snapshots preserve legal evidence even if guest or reservation changes later.
- Versioning supports re-sign without mutating signed records.
- Hardware Bridge reuses ADR 007 print path; mock agent already accepts
  `REG_CARD`.

## Consequences

### Positive

- Front desk can capture and archive signatures on tablet.
- Print audit trail via `HardwareJob`.

### Negative / risks

- Large signature payloads in Postgres; acceptable for v1 volume.
- No full PDPA workflow yet.

### Mitigations

- Validate PNG data URL format and minimum payload size on sign.
- Defer PDPA/TM.30 to Phase 6.

## Alternatives considered

1. Store signature in object storage only — rejected; need DB audit link.
2. Hard block check-in without signature — rejected for v1 rollout.
3. `window.print()` — rejected per ADR 007.

## Implementation notes

- **Files**: `packages/database/prisma/schema.prisma`,
  `apps/api/src/registration-cards/**`,
  `apps/web/src/app/registration-cards/**`,
  `apps/web/src/components/registration-card-panel.tsx`
- **Tests**: API `registration-cards.service.spec.ts`, web sign/print tests
