---
name: pura-web-feature
description: Implements or changes PURA web features in Next.js App Router (pages/components/hooks/api client/tests) following project standards (a11y, design tokens, no hardcoded copy, React Query, Zustand). Use when editing apps/web/src/app/**, components, hooks, or web API clients.
---

# PURA Web Feature (Next.js) Skill

Use this when working in `apps/web` (Next.js App Router + React Query + Zustand + Radix UI).

## Golden rules (PURA)

- **No hardcoded user-facing strings**. Use the project i18n approach (see `docs/guidelines/coding_standards.md §15`).
- **No hardcoded colors**. Use design tokens from `apps/web/src/app/globals.css` and existing Tailwind semantics.
- **Server by default**. Only add `'use client'` when you need state/effects/events.
- **A11y first**. Prefer semantic HTML and `getByRole`-friendly UI.
- **Use existing primitives** in `apps/web/src/components/ui/**` before adding new ones.

## Project paths & patterns

- Routes/pages: `apps/web/src/app/**` (App Router)
- Components: `apps/web/src/components/**`
- UI primitives: `apps/web/src/components/ui/**`
- Hooks: `apps/web/src/hooks/**`
- API clients: `apps/web/src/lib/api/**`
  - Base client: `apps/web/src/lib/api/client.ts`
  - Barrel: `apps/web/src/lib/api/index.ts`
- Global shell: `apps/web/src/app/layout.tsx` (AppLayout + QueryProvider + ErrorBoundary + Toaster)

## Data access workflow (recommended)

### 1) Add/adjust a domain API client function

- Put in `apps/web/src/lib/api/<domain>.ts`
- Use `apiClient.get/post/patch/delete`
- Ensure error behavior is predictable (APIError vs network error)
- Export from `apps/web/src/lib/api/index.ts`

### 2) Add/adjust a hook for server state (React Query)

- Put in `apps/web/src/hooks/`
- Use stable query keys and typed results
- Prefer invalidation after mutations

### 3) Build UI

- Keep layout/page server when possible; isolate interactive pieces into client components.
- Use `components/ui/*` for dialogs, buttons, inputs, selects, etc.
- Ensure interactive states: hover/active/disabled/focus-visible.

## Testing workflow

- Co-locate tests with code:
  - components/pages: `*.test.tsx`
  - utilities/api clients/hooks: `*.test.ts`
- Prefer behavior tests (RTL):
  - `getByRole`, `getByLabelText`, `findByRole`
  - user-event for interactions
- Mock external deps when needed (router, API client, time).
- If the feature is critical end-to-end, add Playwright coverage under `apps/web/e2e/**`.

## Mock API mode (demo/dev)

The base client supports routing to mock handlers when:

- `NEXT_PUBLIC_USE_MOCK_API === 'true'`

This uses `apps/web/src/lib/api/mock/router`. Use this to keep UI development/test stable without the API service.

## “Done” criteria

- [ ] Copy is not hardcoded (i18n-ready)
- [ ] No hardcoded colors; uses design tokens
- [ ] A11y basics covered (labels, roles, keyboard)
- [ ] API client + hook + UI are consistent
- [ ] Tests added/updated and pass for touched files
