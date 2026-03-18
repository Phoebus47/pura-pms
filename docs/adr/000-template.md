# ADR 000: <Title>

- **Status**: Proposed | Accepted | Deprecated | Superseded
- **Date**: YYYY-MM-DD
- **Owners**: @<name>
- **Deciders**: @<name>, @<name>
- **Related**: `<PR/issue link>`, `<ARCHITECTURE section link>`

## Context

What problem are we solving? Include:

- business constraints (hotel ops, USALI, compliance)
- technical constraints (Next/Nest/Prisma, BullMQ/Redis, hosting)
- current state (link to code paths)

## Decision

What are we going to do? Be specific:

- data model choices (Prisma models/fields/indexes)
- API contract (endpoints, DTOs, status codes)
- async jobs (BullMQ queues/processors, idempotency strategy)
- web integration (API client/hook/UI patterns)

## Rationale

Why this is the best trade-off now:

- correctness (financial immutability, businessDate)
- maintainability (module boundaries)
- performance (indexes, background jobs)
- security (auth, CORS, audit trail)

## Consequences

### Positive

- …

### Negative / risks

- …

### Mitigations

- …

## Alternatives considered

1. …
2. …

## Implementation notes

- **Files to change**:
  - `packages/database/prisma/schema.prisma`
  - `apps/api/src/...`
  - `apps/web/src/...`
- **Test plan**:
  - `pnpm --filter database test`
  - `pnpm --filter api test`
  - `pnpm --filter web test`
