# Current Sprint — Phase 4 Post-departure Charges (usable slice)

**Theme:** Charges discovered after a guest has already checked out and the folio was closed
**Goal:** Front desk can reopen a closed folio, post the charge (minibar, damage) with existing tooling, then settle it via an existing card pre-auth, transfer to city ledger (AR), or leave it open pending collection — then close the folio again.
**Branch:** `cursor/feat-post-departure-charges-6a5d`
**Base:** `dev`
**Source:** `docs/planning/prd.md` § Post-departure Charges + §12
**Depends on:** Folio posting (WP4), Card Pre-authorization (P3-PR9), AR / city ledger (P3-PR6). Do not reopen Room Move, Day-use, Split Stay, or No-show.

## Working agreements

- **One epic, one PR.** Conventional Commits (`feat(folios): …`). Prisma **^6.19.2**.
- **Usable first, no new ledger.** Reuse existing settlement rails — `POST /card-preauths/:id/capture` and `POST /ar-accounts/:id/transfer` already work on any folio balance and are untouched by this sprint. The only real gap is that a **closed folio has no way back to `OPEN`**, and `postTransaction` never checked folio status at all (a cashier could already silently post into a closed folio, which breaks the "closed folio is immutable" invariant this project relies on for audit).
- No new `TransactionCode`. Seed already has `3005` (Minibar) and `3007` (Miscellaneous) for this use case.
- No hardcoded UI copy. New strings in `en.json` + `th.json` via `t()`.
- Tests with the change. Do not mutate posted `FolioTransaction` rows.

## What ships

1. `FoliosService.postTransaction` now requires the folio to be `OPEN` (via the folio already loaded for shift resolution — no extra query). Any other status (`CLOSED`, `POSTED_TO_CITY_LEDGER`, `TRANSFERRED`) is rejected with 409.
2. New `POST /folios/:id/reopen` — the only way to move a folio from `CLOSED` back to `OPEN`. Rejects folios that are not exactly `CLOSED` (an AR-transferred folio already has an invoice; reopening it is out of scope here).
3. Web: a "Reopen for post-departure charge" action on the folio checkout bar, visible only when the folio is `CLOSED`. After reopening, the existing Post Charge / Post Payment dialogs and the AR-accounts / card-preauths admin pages already work end to end.
4. Mock API (`apps/web/src/lib/api/mock/router.ts`) mirrors both the new guard and the new endpoint so the frontend demo behaves like the real API.

## Invariants

| Rule                | Constraint                                                                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Post guard          | `postTransaction` throws 409 unless the folio's current status is `OPEN`.                                                                            |
| Reopen precondition | `reopen` throws 409 unless the folio's current status is exactly `CLOSED`.                                                                           |
| Reopen effect       | Sets `status: OPEN`, `isClosed: false`, `closedAt: null`, `closedBy: null`. No new schema field.                                                     |
| Settlement          | Handled entirely by existing endpoints (`card-preauths capture`, `ar-accounts transfer`, `folios checkout`). No new settlement logic in this sprint. |
| Money               | Append-only post via the unmodified `persistPostingLines` path. Never rewrite folio rows.                                                            |

## Out of scope

- A single combined "post-departure" endpoint that posts the charge and settles it atomically
- Reopening `POSTED_TO_CITY_LEDGER` / `TRANSFERRED` folios
- New `PostDeparture`/city-ledger models — reuse `Invoice` + `ARAccount` already shipped in P3-PR6
- Card gateway capture (still manual ledger, per P3-PR9)
- Rewriting reservation/folio hardcoded English elsewhere in the app
