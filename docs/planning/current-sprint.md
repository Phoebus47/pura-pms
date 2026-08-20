# Current Sprint — Phase 6 Kiosk Check-in

## Goal (@PM)

Lobby staff can run a touch-friendly self check-in flow on a tablet using the guest confirmation number.

## In scope

- ADR `docs/adr/017-kiosk-checkin.md`
- `POST /kiosk/check-in` delegating to `ReservationsService.checkIn`
- `/kiosk` lobby UI (staff auth): lookup + confirm check-in
- Mock routes: `GET /reservations/confirm/:confirmNumber`, `POST /kiosk/check-in`
- i18n en/th, nav after Complaints

## Out of scope

- ID scan, payment capture, digital key
- Guest-facing unauthenticated portal
- New Prisma model
