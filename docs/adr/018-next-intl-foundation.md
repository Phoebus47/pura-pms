# ADR 018: next-intl Foundation

- **Status**: Accepted
- **Date**: 2026-08-24
- **Owners**: @Frontend
- **Deciders**: @Architect, @PM
- **Related**: Phase 7 Module 7A, `docs/guidelines/coding_standards.md` §15

## Context

PURA web used a custom `t()` helper (`apps/web/src/lib/i18n.ts`) that always read `messages/en.json`. Thai copy existed in `messages/th.json` but was unused. ~100 components import `@/lib/i18n`. Project standards require **next-intl** with locale-aware routing and `@/i18n/navigation` for internal links.

Constraints:

- Next.js 16 App Router + Serwist PWA middleware
- Must not migrate every call site to `useTranslations` in one PR (Phase 7B covers Thai parity)
- URLs should stay familiar for default English (`localePrefix: 'as-needed'`)

## Decision

1. **Install next-intl** and configure via `apps/web/src/i18n/request.ts` + Next plugin in `next.config.ts`.
2. **Locale routing**: App routes live under `apps/web/src/app/[locale]/`. Supported locales: `en` (default), `th`.
3. **Middleware**: `apps/web/src/middleware.ts` uses `createMiddleware(routing)` with `localePrefix: 'as-needed'` so `/dashboard` stays English and `/th/dashboard` serves Thai.
4. **Navigation**: Export `Link`, `useRouter`, `usePathname`, `redirect` from `apps/web/src/i18n/navigation.ts`.
5. **Bridge for legacy `t()`**: Keep `@/lib/i18n` exports. `I18nProvider` calls `setActiveMessages()` with the active locale's message tree from `NextIntlClientProvider`. Existing components continue using `t('nav.dashboard')` without edits.
6. **Locale switcher**: `LocaleSwitcher` in sidebar footer and Settings uses `router.replace(pathname, { locale })`.
7. **Persistence**: next-intl middleware sets locale cookie automatically on navigation.

## Rationale

- **Incremental migration**: Bridge avoids a 100-file refactor blocking Phase 7 delivery.
- **Standards alignment**: New code should prefer `useTranslations` / `getTranslations` and `@/i18n/navigation` Link.
- **SEO/a11y**: `<html lang={locale}>` set per locale layout.
- **PWA**: Root `layout.tsx` is pass-through; locale layout owns `<html>`/`<body>`.

## Consequences

### Positive

- Thai UI can be toggled immediately where `th.json` has keys.
- Locale-aware navigation without breaking existing hrefs in `config/navigation.ts`.
- Foundation for Phase 7B–7H guest-facing modules.

### Negative / risks

- Dual i18n APIs (`t()` vs `useTranslations`) until gradual migration.
- `[locale]` segment adds one level to App Router structure.
- Tests must mock `@/i18n/navigation` and `next-intl`.

### Mitigations

- Document bridge in coding standards; Phase 7B fills Thai gaps on critical pages.
- Co-located tests for middleware, locale switcher, and i18n bridge.
- Serwist/static assets excluded via middleware matcher.

## Alternatives considered

1. **Big-bang migrate all files to `useTranslations`** — rejected (high conflict risk, delays Phase 7).
2. **Custom context only (no next-intl)** — rejected (conflicts with project standards).
3. **`localePrefix: 'always'`** — rejected (breaks existing URLs/bookmarks for English).

## Implementation notes

- **Files**:
  - `apps/web/src/i18n/routing.ts`, `request.ts`, `navigation.ts`
  - `apps/web/src/middleware.ts`
  - `apps/web/src/app/[locale]/layout.tsx`
  - `apps/web/src/lib/i18n.ts`, `i18n-provider.tsx`
  - `apps/web/src/components/locale-switcher.tsx`
- **Test plan**:
  - `pnpm --filter web test`
  - `pnpm --filter web type-check`
