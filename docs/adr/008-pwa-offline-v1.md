# ADR 008: PWA v1 as read-only offline continuity

- **Status**: Accepted
- **Date**: 2026-08-18
- **Owners**: @Architect
- **Deciders**: @Architect, @PM
- **Related**:
  - `docs/planning/prd.md` §2.2 Progressive Web App
  - `apps/web/src/app/sw.ts`
  - `apps/web/src/lib/pwa/query-persist.ts`

## Context

PRD requires installable PWA with partial offline capability. PURA is cloud-first;
financial postings must stay immutable and server-authoritative. Background Sync
for mutations would risk double-posting folio charges without conflict rules.

## Decision

1. **Serwist** (`@serwist/turbopack`) registers a production service worker via
   `app/serwist/[path]/route.ts`. Dev skips SW registration.
2. **Installability:** `app/manifest.ts` + PNG icons 192/512 (maskable).
3. **App shell offline:** precache static assets; navigation fallback `/offline`.
4. **Read data offline:** TanStack Query persist (IndexedDB) for FO list queries
   (`properties`, `rooms`, `guests`, `reservations`, HK board, hardware lists).
5. **Mutations blocked offline:** `POST`/`PATCH`/`DELETE` in `apiClient` throw
   before fetch; UI shows `pwa.offlineMutationBlocked` toast.
6. **Local hardware agent** (`127.0.0.1:9247`) stays network-only (not cached
   by SW). Cloud hardware jobs still need API.
7. **Wait:** Background Sync, offline check-in/checkout, offline night audit,
   push notifications, custom install prompt UX.

## Rationale

- Correctness: no silent mutation queue for financial data.
- YAGNI: query persist covers “last synced read” without SW API cache rules.
- Turbopack-native Serwist avoids webpack-only `@ducanh2912/next-pwa`.

## Consequences

### Positive

- Front desk keeps viewing arrivals/rooms when internet drops briefly.
- Installable on Chrome/Edge desktop and mobile home screen.

### Negative / risks

- Stale data if offline >24h (persist maxAge).
- iOS Safari install UX is manual “Add to Home Screen”.

### Mitigations

- Global offline banner. Persist maxAge 24h. Mutations show clear toast.

## Alternatives considered

1. `@ducanh2912/next-pwa` — rejected; webpack-only, poor Next 16 fit.
2. Offline mutation queue — rejected until audit/idempotency ADR exists.
3. SW runtime cache for all API GETs — rejected; duplicates query persist.

## Implementation notes

- **Files**: `apps/web/src/app/manifest.ts`, `sw.ts`, `offline/page.tsx`,
  `components/pwa/*`, `lib/pwa/*`, `next.config.ts`
- **Tests**: offline banner, offline mutation guard, manifest export
