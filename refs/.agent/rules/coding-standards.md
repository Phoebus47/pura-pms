# Coding Standards – Apply on Every Task

**For every task you are given, you must follow the project's coding standards.** The full document is at `docs/CODING_STANDARDS.md`.

## How to work efficiently (tokens + quality)

1. **Identify task type:** UI/component, API/route, or test.
2. **Use your knowledge** for generic best practices (React, Next.js, REST, Vitest, RTL, a11y). No need to paste long docs.
3. **Use project docs only for project-specific rules:** i18n (next-intl, messages), layout (Hybrid, max-w-7xl), our stack, SonarQube. **Read only the relevant section(s)** of `docs/CODING_STANDARDS.md` (see index below) instead of loading the whole file.
4. **Section index:** §1 Core | §2 Client/server, React/UI/Images/Layout/i18n/Styling/Design tokens/Interactive states | §3 TypeScript | §4 Folder, reuse, variants, barrel | §5 Performance (front & back) | §6 Framer Motion | §8 SEO metadata, a11y, Lighthouse | §10 Lint/File size | §11 Error handling | §13 Testing | §15 i18n | §17 SonarQube (front, back, test) | §18 Checklist.

## Mandatory checklist (every task)

### No hardcoding

- **Copy (i18n):** Do not hardcode user-facing text. Use next-intl: add keys (camelCase) to `messages/en.json` and `messages/th.json`. Client: `useTranslations('namespace')`; server: `getTranslations('namespace')` (async). Do not use `locale === 'th' ? '...' : '...'` for UI text.
- **Colors / Design tokens:** Do not hardcode color values. Use design tokens from `app/globals.css` (colors, shadows, typography: `text-brand-accent`, `bg-foreground`, `shadow-(--shadow-service-card)`). Add new tokens in `globals.css` if needed.
- **Magic values:** Do not inline magic numbers/strings. Use named constants or existing config (e.g. `globals.css`, `lib/motion.ts`).

### Code style

- **No inline styles:** Use Tailwind classes only; no `style={{ ... }}`.
- **Links:** Use `Link` from `@/i18n/navigation` for internal links.
- **Images:** Use Next.js `<Image>` from `next/image` for all images. Do not use raw `<img>`. Set `unoptimized` when you need full quality (e.g. logos, graphics); otherwise rely on Next’s default optimization.
- **Layout (Hybrid):** Section outer `w-full` for background; content inner `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`. Do not use only horizontal padding without max-width.
- **Framer Motion:** Use shared variants from `lib/motion.ts` (e.g. `navbarEnter`, `heroContentEnter`, `staggerContainer`). No magic numbers for duration/delay. Mock `motion.*` in tests when needed. See docs §6.
- **Folder / reuse:** Page-specific under `app/.../components/`; shared under `components/` or `components/ui/`. Use one component with variants when UIs are similar. Barrel (index) only where it reduces noisy imports. See docs §4.
- **Interactive states:** For buttons/links: support default, hover, active, disabled, focus-visible where needed. Use Tailwind `hover:`, `active:`, `disabled:`, `focus-visible:`. See docs §2.
- **File naming:** Components PascalCase; non-components/hooks kebab-case; route segments kebab-case; translation keys camelCase. See docs §4 table.
- **Client vs server:** Default to server; `'use client'` only when needed (state, events, browser APIs). Prefer server fetch + props. §2.
- **SEO metadata:** generateMetadata or metadata; title/description (and OG) from messages. §8.
- **a11y:** Semantic HTML, ARIA, keyboard/focus-visible, alt text; Lighthouse Accessibility. §8.
- **Performance:** Front: server by default, small bundle, next/image. Back: fast, no N+1, validate input. §5.
- **Quality:** Front: types, a11y. Back: validation, status codes, no sensitive data. Test: behavior, mock deps. §17.
- **Types:** No `any`; define interfaces for props; prefer union types over enums.

### Before suggesting or applying changes

- Check that new or edited copy is in `messages/*.json` and used via `t()`.
- Check that new or edited colors use `globals.css` or existing Tailwind theme classes.
- Keep files under 300 lines; extract logic into hooks or helpers when appropriate.
- **SonarQube:** Code should pass `npm run sonar`; fix bugs, vulnerabilities, code smells; avoid duplication and dead code; no `any`. See docs §17.

## Commit messages (Generate Commit / Source Control)

When generating or suggesting commit messages, use the same format as Husky + Commitlint in this repo:

- **Format:** `type(scope): subject` or `type: subject`. Type and scope **lower-case**. No period at end of subject. Header **max 100 characters**.
- **Allowed types only:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`.
- **Examples:** `feat: add product search`, `fix(navbar): mobile menu close`, `docs: update README`.

This ensures generated messages pass `npx commitlint` (run on commit-msg hook). See `.agent/rules/commit-format.md` for full rules.

## When you need full detail

Read only the **relevant sections** of `docs/CODING_STANDARDS.md` (see section index above). Do not load the entire document unless the task spans many areas.

Apply these standards on **every** task unless the user explicitly asks otherwise.
