# Current Sprint — Phase 6 Lost & Found

## Goal

Front office can register found items, mark claims, return to guests, or
dispose after the 90-day retention window.

## Scope

- `LostFoundItem` + `LostFoundStatus`
- `POST /lost-found` create
- claim / return / dispose
- `/lost-found` board (en/th)
- Overdue = FOUND past retention

## Out of scope

- Photo upload
- Guest email/SMS
- Donated as a separate status
