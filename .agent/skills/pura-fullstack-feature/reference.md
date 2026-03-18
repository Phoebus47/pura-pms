# PURA Full‑Stack Feature — Reference

This file is intentionally more detailed than `SKILL.md`. Read it when you need a deeper checklist or templates.

## A) Choosing the “owner” of a change

- **DB schema concerns** (Prisma models, enums, constraints, indexes): `packages/database`
- **Business rules / validation / access control**: `apps/api`
- **UI/UX, optimistic interactions, caching**: `apps/web`
- **Long-running operations**: `apps/api` + BullMQ (Redis)

If the change affects multiple layers, pick a **single source of truth** for the rule (usually API), then keep UI in sync.

## B) Financial safety checklist (USALI + immutability)

Use this checklist any time you touch:

- Folio, FolioWindow, (Folio)Transaction, TransactionCode, ReasonCode
- Night Audit, Report archive
- Shift / cashier logic
- GL/AR/Invoice/Tax invoice logic

Checklist:

- [ ] **No delete/update** of posted transactions (void/correction only)
- [ ] **Reason code** required for void/adjustments when applicable
- [ ] **Dual dates**:
  - `businessDate` for accounting day
  - `createdAt`/system timestamp for audit trail
- [ ] **Sign conventions** are consistent:
  - Charges: +1
  - Payments: -1
- [ ] All money fields are stored with appropriate precision/scale (Prisma Decimal)
- [ ] Add/keep indexes for reporting and night audit workloads (businessDate, link keys)
- [ ] Tests cover invariants (immutability + businessDate handling + void linkage)

## C) API endpoint design template

For a module `<module>`:

- `GET /<module>`: list (filter/sort/pagination)
- `GET /<module>/:id`: detail
- `POST /<module>`: create
- `PATCH /<module>/:id`: update (only for mutable entities)
- Prefer specialized actions for workflows:
  - `POST /folios/:id/transactions`
  - `POST /night-audit/run` (job enqueue), `GET /night-audit/:businessDate/status`

HTTP semantics:

- 200 OK: reads
- 201 Created: create / action produces resource
- 204 No Content: delete or action with no body (rare; avoid delete in financial)
- 400 Bad Request: validation / parse
- 401/403: auth/permissions
- 404 Not Found: missing entity
- 409 Conflict: availability collisions / concurrency domain conflicts

## D) DTO template (NestJS)

Keep DTOs strict. Prefer explicit optional vs required fields.

```ts
import { IsOptional, IsString } from 'class-validator';

export class ExampleDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
```

## E) Web API client + hook pattern

API client:

- Put domain functions under `apps/web/src/lib/api/<domain>.ts`
- Export them in `apps/web/src/lib/api/index.ts`

Hook:

- Put server-state hooks under `apps/web/src/hooks/`
- Use stable query keys and return typed data.

Testing:

- Prefer RTL behavior tests for UI
- For API client: test error handling and token header behavior

## F) BullMQ job pattern

When adding a new background job:

- Configure queue in module (or reuse global config)
- Define:
  - `Service.enqueueXxx(...)`
  - `Processor.process(...)`
- Ensure idempotency:
  - Re-running a job should not double-post charges
  - Use DB uniqueness / job keys where appropriate
