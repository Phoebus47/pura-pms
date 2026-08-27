# Current Sprint

## Sprint: Shift Ops UI (Post–Phase 7)

- Status: `IN PROGRESS` (PR #135)
- Goal: Replace stiff marketing KPI home with a Front Office **Shift Ops** desk; Harbor visual polish; CSS-only motion. No Framer Motion in v1.

## Source of truth

→ **`docs/planning/shift-ops-ui-brief.md`**

## Progress

| Phase | Status   | Notes                                             |
| ----- | -------- | ------------------------------------------------- |
| **A** | Done     | Shift Ops home queues / exceptions / work list    |
| **B** | Done     | Harbor tokens app-wide; UI primitives + FO panels |
| **C** | Done     | Grouped sidebar + header guest search             |
| **D** | Done     | CSS enter motion + reduced-motion                 |
| **E** | Deferred | Framer only with ADR                              |

## Role ownership (virtual AI team)

| Role           | Owns                                                   |
| -------------- | ------------------------------------------------------ |
| **@PM**        | Phase A task breakdown + acceptance; cut scope         |
| **@Architect** | Data composition / token plan; block unnecessary APIs  |
| **@Frontend**  | Shift Ops UI, Harbor polish, nav/search UI, CSS motion |
| **@Backend**   | Aggregate endpoint only if Architect flags a gap       |
| **@QA**        | RTL tests, FO path, reduced-motion, AC sign-off        |

## Prior sprint

Phase 7 — i18n & Multi-Property: `DONE` (see `phase-7-closeout.md`).
