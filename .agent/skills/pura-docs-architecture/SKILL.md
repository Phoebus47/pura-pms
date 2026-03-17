---
name: pura-docs-architecture
description: Produces and maintains PURA technical documentation (ARCHITECTURE.md, ADRs, diagrams, operational guides) grounded in the codebase. Use when the user asks for architecture docs, diagrams (Mermaid/C4), onboarding docs, or when significant changes require documentation updates.
---

# PURA Docs & Architecture Skill

Use this skill when writing or updating technical docs for this repo, especially diagrams.

## Principles

- **Docs must match code**: cite concrete file paths and current behavior. If unsure, verify in code first.
- **Prefer diagrams for topology and flows**: Mermaid is the default.
- **Progressive disclosure**: keep the main doc readable; push deep details into linked docs.
- **Stable terminology**: use consistent names for domains (folios, night audit, transaction codes, businessDate).

## Standard doc set (recommended)

- `ARCHITECTURE.md` (system overview + diagrams + key flows)
- `docs/adr/` (Architecture Decision Records)
- `DEPLOYMENT.md` (already exists)
- `docs/guidelines/*` (already exists)

## ARCHITECTURE.md template (what to include)

- **System context** (actors + major systems)
- **Containers** (web/api/db/redis/sentry + deployment topology)
- **Component boundaries**
  - Web: routes, shared components, data layer
  - API: modules, cross-cutting concerns (auth, validation, logging), jobs
  - DB: schema ownership, key invariants
- **Data model (subset ERD)** for core flows
- **Key sequences**
  - auth
  - reservation creation
  - folio posting / void
  - night audit job flow
- **Configuration**
  - env vars (web/api/db/redis)
- **Testing strategy**
  - unit/integration/e2e placement

## Mermaid patterns (use the right diagram)

- **Context / topology**: `flowchart LR` / `flowchart TB`
- **Data model**: `erDiagram` (subset; avoid dumping full schema)
- **User/system interactions**: `sequenceDiagram`
- **Async jobs**: show queue + worker + idempotency notes

## ADR workflow (when decisions matter)

Create an ADR when you introduce a significant choice with trade-offs:

- data model that affects financial correctness
- queue/job design decisions
- API contract changes that affect web/mobile
- deployment/runtime changes (redis required, new service)

ADR format:

- Title, Status, Context, Decision, Consequences, Alternatives considered

## “Done” criteria for docs

- [ ] Diagrams render (Mermaid syntax valid)
- [ ] Links and paths are correct
- [ ] “Key flows” match current endpoints/modules
- [ ] Financial/audit invariants called out where relevant
