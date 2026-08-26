# Phase 7 Closeout

## Outcome

Phase 7 i18n & Multi-Property / Guest Self-Service is complete and merged to `dev`.

| #   | Feature                              | Status  |
| --- | ------------------------------------ | ------- |
| 1   | i18n Foundation (next-intl)          | Shipped |
| 2   | Thai Translation (Critical FO pages) | Shipped |
| 3   | Thai Font Support (print / Sarabun)  | Shipped |
| 4   | Thai Search (multi-token NFC)        | Shipped |
| 5   | Multi-Property Switcher (CRS UI v1)  | Shipped |
| 6   | Guest Portal                         | Shipped |
| 7   | Digital Key mock (BLE/NFC)           | Shipped |
| 8   | Mobile Check-in                      | Shipped |

## Follow-ups (explicitly deferred)

- Full CRS: cross-property inventory search, central rate management, loyalty
- Guest portal: magic-link / email auth (v1 uses confirm + last name)
- Digital key: real BLE/NFC radio integration
- Mobile check-in: ID scan, payment capture
- jsPDF / server-side Thai PDF generation (browser print only for v1)

## Next

Promote `dev` → `main`. Phase 3 wait items (AP, e-Tax API, card gateway) remain parked.
