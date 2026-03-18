---
name: pura-scaffold-web-crud
description: Scaffolds a new CRUD-style web feature in PURA (Next.js routes, UI components, API client functions, React Query hooks, and co-located tests). Use when adding a new page/flow like housekeeping board, rates, shift screens, or any list/detail/create/edit UI under apps/web/src/**.
---

# PURA Scaffold — Web CRUD Flow (Next.js)

Goal: build a consistent **list + detail + create/edit** flow in `apps/web`.

## Output (expected pieces)

For a domain `<domain>` (e.g. `housekeeping`, `rates`, `shifts`):

- API client:
  - `apps/web/src/lib/api/<domain>.ts`
  - export from `apps/web/src/lib/api/index.ts`
  - unit tests: `apps/web/src/lib/api/<domain>.test.ts`
- Hooks:
  - `apps/web/src/hooks/use-<domain>.ts` (queries + mutations)
  - tests: `apps/web/src/hooks/use-<domain>.test.ts` (when non-trivial)
- Routes:
  - `apps/web/src/app/<domain>/page.tsx` (+ `page.test.tsx`)
  - `apps/web/src/app/<domain>/[id]/page.tsx` (+ `page.test.tsx`)
- Components:
  - `apps/web/src/components/<domain>-form-dialog.tsx` (+ `.test.tsx`)
  - optional `apps/web/src/components/<domain>-table.tsx` (+ `.test.tsx`)

## Workflow

### 1) API client (first)

- Add functions like:
  - `list<Domain>()`
  - `get<Domain>(id)`
  - `create<Domain>(payload)`
  - `update<Domain>(id, payload)`
- Use `apiClient` from `apps/web/src/lib/api/client.ts`.
- Keep endpoint paths consistent with API controller routes.

### 2) React Query hooks

- Create stable query keys:
  - `['<domain>']` for list
  - `['<domain>', id]` for detail
- Mutations should invalidate list/detail keys after success.

### 3) Pages (server by default)

- List page:
  - render table/list
  - “Create” button opens form dialog
- Detail page:
  - fetch id from params
  - render details + “Edit” dialog

Use `'use client'` only in components that require state/events (dialogs, forms).

### 4) UI components

- Use existing primitives in `apps/web/src/components/ui/**`:
  - `Dialog`, `Button`, `Input`, `Select`, `ConfirmDialog`, `Toast`
- Ensure interactive states and a11y labels.
- No hardcoded copy; keep i18n-ready per project rules.

### 5) Tests

Minimum tests for a new CRUD flow:

- API client: success + error mapping (APIError)
- Form dialog: renders fields, submits, shows validation error UI
- Page: renders list/detail and wires actions (mock hooks or api client)

Testing style:

- React Testing Library behavior tests (`getByRole`, `getByLabelText`)
- Avoid implementation detail assertions.

## Done checklist

- [ ] API client functions exist and exported
- [ ] Hooks use stable query keys + invalidate on mutation
- [ ] UI uses design tokens and is a11y-friendly
- [ ] Co-located tests pass for touched files
