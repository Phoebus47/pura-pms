# ADR 013: Manual lost-and-found log (no photo storage, no guest notify)

- **Status**: Accepted
- **Date**: 2026-08-20
- **Owners**: @Architect
- **Deciders**: @Architect, @PM
- **Related**:
  - `docs/planning/prd.md` § 4.20 Lost & Found Management
  - `packages/database/prisma/schema.prisma` (`LostFoundItem`)
  - `apps/api/src/lost-found/`
  - `apps/web/src/app/lost-found/`

## Context

Front office must log items found on property, match claims, return them, or
dispose after a retention period. PRD mentions photos and guest notification.
This stack has no object storage or guest messaging hub yet.

## Decision

1. **`LostFoundItem`** on a property. Status: `FOUND` → `CLAIMED` → `RETURNED`,
   or `FOUND` → `DISPOSED`. Default `retentionDays` = 90. Overdue = still
   `FOUND` after `foundAt + retentionDays`.
2. **Optional `guestId`** when the owner is known. No email/SMS in v1.
3. **No photo upload** in v1 (no blob store). Description + location + room.
4. **Web**: `/lost-found` register form + list with claim / return / dispose.
5. **Migration**: `20260820090000_add_lost_found_item`.

## Rationale

- Unblocks FO ops without new infrastructure.
- Status machine matches hotel practice (hold, claim, return, or dispose).
- YAGNI: photos, donated vs disposed split, and guest notify wait for Phase 6
  messaging.

## Consequences

### Positive

- Desk can track items and 90-day retention without a spreadsheet.

### Negative / Trade-offs

- No photo evidence; description quality depends on staff.

### Follow-ups

- Photo URL / object storage.
- Notify guest when `guestId` is set (Guest Communication Hub).
