---
name: pura-adr
description: Writes architecture decision records (ADRs) for PURA using the repo template and grounding decisions in actual code paths. Use when making significant design choices (financial correctness, queue/idempotency, API contracts, deployment/runtime dependencies) or when the user asks to document a decision.
---

# PURA ADR Skill

Use ADRs to capture decisions with trade-offs so future changes stay consistent.

## When to write an ADR (triggers)

Write an ADR when you change any of these:

- financial posting model/invariants (immutability, businessDate, void/corrections)
- Night Audit process, BullMQ queueing, idempotency approach
- API contracts that affect multiple pages/clients
- deployment/runtime dependencies (Redis required, new service, new infra)
- database schema that impacts reporting/history or compliance

## How to write it (workflow)

1. Start from the template: `docs/adr/000-template.md`
2. Name the new ADR:
   - `docs/adr/001-<kebab-title>.md`, incrementing number
3. Ground it in code:
   - include concrete file paths (schema, modules, services, web hooks)
4. Specify tests that prove the decision:
   - database tests (constraints/indexes)
   - API specs (service/controller/processor)
   - web tests (UI + api client)

## “Good ADR” checklist

- [ ] Clear context and constraints
- [ ] Decision is explicit and actionable
- [ ] Alternatives are listed with reasons rejected
- [ ] Consequences include risks and mitigations
- [ ] Implementation notes include file paths + test plan
