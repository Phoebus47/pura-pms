# PURA PMS - Coding Standards & Best Practices

This document outlines the coding standards, best practices, and quality guidelines for the PURA PMS project. These standards are aligned with **industry best practices** for React, Next.js, TypeScript, NestJS, accessibility (a11y), i18n, and performance. All code contributions must adhere to these guidelines to maintain high code quality, maintainability, and consistency.

### Section index (for targeted reads – save tokens)

| §   | Topic                                                                                                                               |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Core Principles                                                                                                                     |
| 2   | React & Next.js (client vs server, components, hooks, navigation, images, layout, i18n, styling, design tokens, interactive states) |
| 3   | TypeScript                                                                                                                          |
| 4   | Folder structure, component reuse, variants, barrel (index)                                                                         |
| 5   | Performance (front & back)                                                                                                          |
| 6   | Framer Motion                                                                                                                       |
| 7   | Responsive Design                                                                                                                   |
| 8   | SEO metadata, a11y (accessibility), Lighthouse                                                                                      |
| 9   | Lighthouse audit                                                                                                                    |
| 10  | Code Formatting & Tooling (ESLint, Prettier, size complexity)                                                                       |
| 11  | Error handling                                                                                                                      |
| 12  | Git Conventions                                                                                                                     |
| 13  | Testing (quality, coverage)                                                                                                         |
| 14  | NestJS / Back-end Guidelines                                                                                                        |
| 15  | i18n (no hardcoding copy)                                                                                                           |
| 16  | SonarQube / code quality (front, back, test)                                                                                        |
| 17  | Code quality checklist                                                                                                              |
| 18  | Quick Reference: When to Use What                                                                                                   |

**Tip:** When implementing a specific task (UI, API, test), read only the sections above that apply instead of the full document.

---

## 1. Core Principles

- **Cloud-First & Hybrid:** The system is a Cloud Web App (Next.js) with PWA capabilities and a **Local Bridge** for hardware integration (Printers, Key Cards).
- **USALI Compliance:** All financial modules must adhere to the **Uniform System of Accounts for the Lodging Industry (USALI)** standards.
- **Immutable Financials:** Financial transactions are **never deleted or updated**. Use void/correction transactions.
- **Business Date != System Date:** All operations track both the `businessDate` (accounting day) and `systemDate` (server timestamp).
- **KISS & DRY:** Keep It Simple, Don't Repeat Yourself.

---

## 2. React & Next.js Best Practices

### Client vs server components

- **Default to server:** In the App Router, components are **server components** by default. Use them for static or data-fetched content.
- **PWA & Offline:** Components should be resilient to network loss. Use caching strategies (TenStack Query / Service Worker) where applicable.
- **Local Bridge:** For Hardware (Printers, Scanners), do **not** use standard browser APIs. Use the **Local Bridge API** client to communicate with the local agent.
- **Use client (`'use client'`) when you need:** `useState`, `useEffect`, event handlers.
- **Composition:** Prefer keeping the page/layout as server and wrapping only the interactive part in a client component (e.g. server page that fetches data, client component for form or nav with state).
- **Data:** Server components can async fetch and pass data as props to client components. Do not fetch in client components when the same data could be fetched on the server (avoids loading states and improves LCP/SEO).

```typescript
// Server component (default) – no 'use client'
const Page = async () => {
  const data = await fetchData()
  return <ClientList initialData={data} />
}

// Client component – needs state or events
'use client'
const ClientList = ({ initialData }: Props) => {
  const [filter, setFilter] = useState('')
  return (/* ... */)
}
```

### Functional Components

- Use **Functional Components** with Hooks for all UI elements.
- **Naming:** PascalCase for components (e.g., `Navbar.tsx`, `Hero.tsx`).

### Hooks Usage

- **`useState`:** Use for local UI state that doesn't need to be shared globally.
- **`useEffect`:** Use for side effects (data fetching, subscriptions). Always include dependencies correctly.
- **`useCallback`:** Use to memoize functions passed as props to children to prevent unnecessary re-renders.
  - **When to use:**
    - Functions passed to child components that are memoized with `React.memo`
    - Functions used as dependencies in `useEffect` or `useMemo`
    - Event handlers in frequently re-rendering components
- **`useMemo`:** Use for expensive calculations. Do not overuse; premature optimization adds complexity.
  - **When to use:**
    - Expensive computations (filtering large arrays, complex calculations)
    - Derived state that depends on multiple values
    - Objects/arrays passed as props to memoized children
- **Custom Hooks:** Extract complex logic into custom hooks (e.g., `useReservationForm`, `useAuth`).

### Navigation

- **`useRouter`:** Use `router.push()` from `@/i18n/navigation` for programmatic navigation.
- **`<Link>`:** Use `Link` from `@/i18n/navigation` for internal links (supports i18n routing).
- **Avoid:** `window.location.href` (causes full page reload).

### Images

- **Use Next.js `<Image>`:** Use the `Image` component from `next/image` for all images. Do not use raw `<img>` elements.
- **When to use `unoptimized`:** Set `unoptimized` on `<Image>` when you need full quality without Next’s optimization (e.g. logos, strict branding, or pre-sized assets). For photos or large assets, omit `unoptimized`.
- **Rationale:** Consistent API, layout/fill/sizes, and optional optimization.

### Layout: Hybrid (full-width background, content in container)

For core pages, use a **Hybrid** approach: **background full width, content with max-width**.

- **Section outer:** `w-full` (and section background classes) so the background spans the full viewport.
- **Content inner:** `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8` so content is centred and capped.

```tsx
// Good: Hybrid
<section className="w-full bg-light-bg py-16 lg:py-20">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{/* content */}</div>
</section>
```

### Internationalization (i18n) – next-intl

- **Client components:** Use `useTranslations('namespace')` and `useLocale()`. Call hooks at top level.
- **Server components / Server Actions:** Use `getTranslations('namespace')` (async). Do not use `useTranslations` in server components.
- **Links:** Always use `Link` from `@/i18n/navigation` for internal links (locale-aware).
- **Translation key naming:** Use **camelCase** for keys in `messages/*.json`. Keep keys identical in `en.json` and `th.json`.
- **Message file structure:** Store in `messages/en.json` and `messages/th.json` with the same nested structure (e.g. `nav`, `hero`, `dashboard`).

### Styling Best Practices

- **No Inline Styles:** Do not use `style={{ ... }}` props. Use Tailwind CSS utility classes.
- **No Hardcoded Colors:** Do not hardcode color values (e.g. `#E53935`). Use CSS variables and theme from `globals.css` or Tailwind semantic classes (e.g. `text-brand-accent`). Add new colors to `:root` / `@theme` in `globals.css` when needed.
- **Design tokens:** Prefer design tokens from `app/globals.css`.
- **Dynamic Styles:** Use `cn()` (clsx + tailwind-merge) for conditional classes.
- **Arbitrary Values:** **Avoid arbitrary values** (e.g., `w-[123px]`) whenever possible. Prefer standard Tailwind utilities.

### Interactive component states (UI states)

For **buttons, links, and other interactive elements**, support the following states:

| State             | When                 | Tailwind / HTML                    |
| ----------------- | -------------------- | ---------------------------------- |
| **Default**       | Normal, idle         | Base classes                       |
| **Hover**         | Pointer over element | `hover:`                           |
| **Active**        | Pressed / mousedown  | `active:`                          |
| **Disabled**      | Control is disabled  | `disabled` attribute + `disabled:` |
| **Focus-visible** | Keyboard focus       | `focus-visible:`                   |

- **Prefer `focus-visible:` over `focus:`**.
- **Loading:** If the action is async, show a loading state (disabled + spinner).

---

## 3. TypeScript Guidelines

- **Strict Mode:** TypeScript `strict` mode is enabled.
- **No `any`:** Avoid using `any`. Use `unknown` or define a proper Interface/Type.
- **Interfaces vs Types:** Prefer `interface` for object definitions (extensible) and `type` for unions/primitives.
- **Props:** Define props interfaces for all components.
- **Avoid Magic Numbers/Strings:** Do not inline “magic” values. Extract them into **named constants**.
- **No Hardcoding (General):** Do not hardcode values (strings, numbers, colors, config) in code.

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}
```

### Comments

- **Use comments only when necessary** to explain non-obvious logic.
- **No debug code:** Remove all `console.log` before committing.
- **No commented code:** Do not commit commented-out code.

---

## 4. Folder Structure, Component Reuse & Barrel (index)

### Folder structure

- **Page-specific components:** Place under `app/[locale]/.../components/` when used only by that route group.
- **Shared / reusable components:** Place under `components/` or `components/ui/` for primitives.
- **Hooks, utils, config:** Under `lib/` (e.g. `lib/motion.ts`, `lib/utils.ts`).

### Component reuse & variants

- **Reuse:** Extract repeated UI into shared components.
- **Variants:** Use a **single component with variants** (props) instead of two separate files for minor differences.

### Barrel (index)

- **When to use:** Use an `index.ts` only where it **reduces noisy imports** or groups a small set of related exports.
- **Do not:** Barrel-export everything from a large flat list.

### Naming Conventions

| Type                      | Case                     | Example            |
| ------------------------- | ------------------------ | ------------------ |
| **Component files**       | PascalCase               | `Navbar.tsx`       |
| **Non-component TS/TSX**  | kebab-case               | `api-client.ts`    |
| **UI primitives**         | kebab-case               | `sk-button.tsx`    |
| **Test files**            | same as source + `.test` | `Navbar.test.tsx`  |
| **Functions / variables** | camelCase                | `fetchData`        |
| **Constants**             | UPPER_SNAKE_CASE         | `MAX_RETRY_COUNT`  |
| **Translation keys**      | camelCase                | `projectReference` |

---

## 5. Performance (front & back)

### Front-end performance

- **Server by default:** Prefer server components so less JS is sent.
- **Code splitting:** Rely on Next.js automatic code splitting.
- **Images:** Use `next/image`; add `priority` for above-the-fold images.
- **LCP / CLS:** Avoid layout shift: set dimensions or aspect ratio for images.

### Back-end / API performance

- **Response time:** Keep API routes fast. Offload long-running work (e.g. Night Audit) to background jobs (BullMQ).
- **N+1 / queries:** Avoid N+1 queries; use `include` or joins correctly in Prisma.
- **Validation:** Validate and parse input early; return 400 for invalid payloads.

---

## 6. Framer Motion

Use **Framer Motion** for entrance and scroll-based animations (if installed/available).

### Shared variants (design tokens for motion)

- **Use `lib/motion.ts`:** Define shared variants and transitions in `lib/motion.ts` (e.g. `navbarEnter`, `heroContentEnter`).
- **No magic numbers:** Do not inline duration or delay in components. Use named constants or variants.

### When to use motion

- **Entrance:** Navbar, Hero, section headers.
- **Consistency:** Use the same spring/stagger settings across pages.
- **Accessibility:** Respect `prefers-reduced-motion`.

---

## 7. Responsive Design

### Mobile-First Approach

- **Design Philosophy:** Mobile-first. Start with mobile layouts and enhance for large screens.
  - Mobile: `< 640px`
  - Tablet: `≥ 640px` (sm:)
  - Desktop: `≥ 1024px` (lg:)
  - Large Desktop: `≥ 1280px` (xl:)

### Touch Targets

- Interactive elements (buttons, links) should have a minimum touch target of **44×44px** on mobile devices.

---

## 8. SEO Metadata, Accessibility (a11y) & Lighthouse

### SEO metadata (Next.js App Router)

- **Where to set:** `generateMetadata` or static `metadata` export in layout/page.
- **Required:** At least `title` and `description` for every public page.
- **Open Graph:** Add `openGraph` tags.
- **Canonical:** Set canonical URLs.

### Accessibility (a11y)

- **Semantic HTML:** Use correct tags (`<button>`, `<nav>`, `<h1>`).
- **ARIA:** Add `aria-label` where text is missing.
- **Color contrast:** Meet WCAG AA.
- **Keyboard:** All interactive elements must be keyboard accessible (Tab/Enter/Space).
- **Images:** Descriptive `alt`.

---

## 9. Lighthouse audit

Run a Lighthouse audit before deployment. Target scores:

- **Performance:** ≥ 90
- **Accessibility:** 100
- **Best Practices:** 100
- **SEO:** 100

---

## 10. Code Formatting & Tooling

### Post-Processing

- **Prettier:** Run `pnpm format` before committing.
- **ESLint:** Run `pnpm lint` and resolve all warnings.

### File Size & Complexity

- **File Size:** Keep files under **300 lines**.
- **Function Complexity:** Keep functions under **50 lines**.

---

## 11. Error Handling

- **API Calls:** Wrap API calls in `try-catch`.
- **UI Feedback:** Use Toast notifications for transient errors.
- **Logging:** Use Logger service (Pino/NestJS logger) instead of `console.log`.

---

## 12. Git Conventions

### Branch Naming

- `feat/feature-name`
- `fix/bug-description`
- `chore/task-description`

### Commit Messages

Use Conventional Commits:

- `feat: add product search`
- `fix: resolve mobile menu issue`
- `docs: update README`
- `style: format code`

---

## 13. Testing (quality & coverage)

### Testing stack

- **Unit tests:** Jest + React Testing Library (Web) / Jest + Supertest (API).
- **E2E:** Playwright.

### Test quality

- **Behavior over implementation:** Test what the user sees/does.
- **Queries:** Prefer `getByRole`, `getByLabelText`.
- **Mocks:** Mock external deps (API, next-intl, router).
- **Coverage:** Aim for > 80% on critical paths.

---

## 14. NestJS / Back-end Guidelines

### Architecture

- **Modular:** Organize by Feature Modules (e.g., `AuthModule`, `ReservationsModule`).
- **Services:** Business logic lives in Services, not Controllers.
- **DTOs:** Strict DTOs for every request with `class-validator`.

### Financials & USALI

- **USALI Compliance:** Chart of Accounts and Reports must follow **USALI** standards.
- **Immutable Transactions:** Never `DELETE` or `UPDATE` financial records. Use `isVoid` flags and counter-transactions (Corrections).
- **Date Handling:** Distinguish between `businessDate` (Accounting) and `systemDate` (Timestamp).

### Database (Prisma)

- **Transactions:** Use `prisma.$transaction()` for multi-step operations (especially financial postings).
- **Migrations:** Do not edit migrations manually. Use `prisma migrate dev`.

### Logging

- **No Console:** Use `this.logger.log()`, `.error()`, `.warn()`.

---

## 15. Internationalization (i18n) Guidelines

### No Hardcoding User-Facing Copy

- **Do not hardcode** user-facing text.
- **Always use** next-intl: put copy in `messages/en.json` and `messages/th.json`.
- **Exceptions:** Technical identifiers (IDs, Codes).

### Translation files & key naming

- **Files:** `messages/en.json` and `messages/th.json`.
- **Key naming:** **camelCase** (e.g. `projectReference`, `readMore`).

### URL Structure

- Use locale prefix/routing as configured in middleware.

---

## 16. SonarQube / Code Quality

The project runs **SonarQube**. Code should pass `pnpm run sonar`.

### Quality by layer

- **Front-end:** Type safety, a11y, layout stability.
- **Back-end:** Input validation, status codes, error handling.

### How to align

- **Fix Bugs & Security Hotspots.**
- **No `any`.**
- **No dead code.**
- **Reduce duplication.**

---

## 17. Code Quality Checklist

Before committing code, ensure:

- [ ] TypeScript compilation passes
- [ ] ESLint passes with no warnings
- [ ] Prettier formatting applied
- [ ] SonarQube analysis passes
- [ ] All images have `alt` attributes
- [ ] All links use `Link` from `@/i18n/navigation`
- [ ] No hardcoded user-facing text; all copy from `messages` via next-intl
- [ ] No hardcoded colors; use design tokens
- [ ] USALI Compliance checked for financial modules
- [ ] Motion: use shared variants; no magic numbers
- [ ] Responsive design tested
- [ ] No `console.log` or debug code
- [ ] Interactive elements have required states (hover, focus-visible)
- [ ] Components are properly typed
- [ ] Client vs server logic is correct
- [ ] a11y: semantic HTML, ARIA, keyboard support
- [ ] Lighthouse audit passed

---

## 18. Quick Reference: When to Use What

### State Management

- **`useState`:** Local component state
- **Zustand:** Global client state (filters, preferences, UI state)
- **TanStack Query:** Server state (API data, caching)

### Performance Optimization

- **`useCallback`:** Functions passed to memoized children or used as dependencies
- **`useMemo`:** Expensive calculations or objects passed to memoized children
- **`React.memo`:** Expensive components that re-render frequently

### Form Handling

- **`react-hook-form` + `zod`:** All form validation
- **Zod schemas:** Type-safe validation with runtime checking

---

**Document Version:** 2.1 (Alignment with Reference)
**Last Updated:** January 2026
