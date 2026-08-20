# Current Sprint — Phase 6 Guest Communication Hub

## Goal (@PM)

Staff can send and read in-app guest messages from a property inbox.

## In scope

- `GuestMessage` + `MessageDirection` + `MessageChannel` (IN_APP only in v1)
- `GET/POST /guest-messages`, `POST :id/read`
- `/messages` staff board (en/th)
- Optional `reservationId`; required `propertyId` + `guestId`

## Out of scope

- SMS / Email / WhatsApp
- Automated pre-arrival messages
- Push notifications
- Guest-facing mobile app
