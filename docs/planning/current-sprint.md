# Current Sprint — Phase 5 PWA (Offline v1)

**Status:** Ready for review
**Branch:** `cursor/feat-pwa-offline-6a5d`
**Depends on:** Hardware Bridge (`cursor/feat-hardware-bridge-6a5d`, #92)
**Roles:** @PM → @Architect → @Frontend → @QA

## Goal

Installable PWA with read-only offline continuity. No offline mutations or
background sync in v1.

## Web

- Serwist service worker (production only) via `/serwist/sw.js`
- `app/manifest.ts` + PNG icons (192, 512 maskable)
- `/offline` navigation fallback
- Offline banner + mutation guard on API client
- TanStack Query persist (IndexedDB) for FO read queries

## Wait

- Background Sync for writes
- Offline check-in / checkout / folio posting
- Push notifications
- Custom install prompt campaign
