# PURA Project Skills (Cursor)

This file helps you pick the **right skill quickly** (less prompt / fewer tokens).

## Which skill should I use?

- **End-to-end (DB + API + Web + tests)** → `pura-fullstack-feature`
- **API work (NestJS)** → `pura-api-module`
- **Web work (Next.js)** → `pura-web-feature`
- **Financial / audit / accounting safety** → `pura-financial-audit`
- **Night Audit + BullMQ/Redis** → `pura-night-audit-bullmq`
- **Prisma schema / migrate / seed / verify** → `pura-database-migrations`
- **Scaffold a new API module** → `pura-scaffold-nest-module`
- **Scaffold a new Web CRUD flow** → `pura-scaffold-web-crud`
- **Architecture docs + Mermaid diagrams** → `pura-docs-architecture`
- **Write an ADR (decision record)** → `pura-adr` (template: `docs/adr/000-template.md`)
- **Release / deploy to production** → `pura-release-deploy`
- **Strict PR review (Sonar-ish gate)** → `pura-code-review`

## Skills map (all)

| Skill                       | Use when                                               |
| --------------------------- | ------------------------------------------------------ |
| `pura-fullstack-feature`    | Cross-layer changes, new features, larger refactors    |
| `pura-api-module`           | Add/change endpoints, DTOs, services/controllers/specs |
| `pura-web-feature`          | Add/change pages/components/hooks/api clients/tests    |
| `pura-financial-audit`      | Money logic, void/correction, businessDate invariants  |
| `pura-night-audit-bullmq`   | Night audit workflow, queues, idempotency              |
| `pura-database-migrations`  | Prisma schema/migrate/seed/verify/tests                |
| `pura-scaffold-nest-module` | Quickly scaffold a new Nest module correctly           |
| `pura-scaffold-web-crud`    | Quickly scaffold list/detail/create/edit + tests       |
| `pura-docs-architecture`    | ARCHITECTURE/diagrams/documentation workflows          |
| `pura-adr`                  | Record significant architectural decisions             |
| `pura-release-deploy`       | Preflight + deploy + post-verify checklist             |
| `pura-code-review`          | Strict review against standards/tests/quality gates    |
