# S.K. Charoensup Engineering - Coding Standards & Best Practices

This document outlines the coding standards, best practices, and quality guidelines for the S.K. Charoensup Engineering website project. These standards are aligned with **industry best practices** for React, Next.js, TypeScript, accessibility (a11y), i18n, and performance. All code contributions must adhere to these guidelines to maintain high code quality, maintainability, and consistency.

### Section index (for targeted reads – save tokens)

| §   | Topic                                                                                                                               |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Core Principles                                                                                                                     |
| 2   | React & Next.js (client vs server, components, hooks, navigation, images, layout, i18n, styling, design tokens, interactive states) |
| 3   | TypeScript                                                                                                                          |
| 4   | Folder structure, component reuse, variants, barrel (index)                                                                         |
| 5   | Performance (front & back)                                                                                                          |
| 6   | Framer Motion                                                                                                                       |
| 8   | SEO metadata, a11y (accessibility), Lighthouse                                                                                      |
| 10  | ESLint, Prettier, file size & complexity                                                                                            |
| 11  | Error handling                                                                                                                      |
| 13  | Testing (quality, coverage)                                                                                                         |
| 15  | i18n (no hardcoding copy)                                                                                                           |
| 17  | SonarQube / code quality (front, back, test)                                                                                        |
| 18  | Code quality checklist                                                                                                              |

**Tip:** When implementing a specific task (UI, API, test), read only the sections above that apply instead of the full document.

---

## 1. Core Principles

- **KISS (Keep It Simple, Stupid):** Avoid over-engineering. Write code that is easy to understand and maintain.
- **DRY (Don't Repeat Yourself):** Extract common logic into reusable functions, hooks, or components.
- **YAGNI (You Aren't Gonna Need It):** Do not implement features or abstractions "just in case." Build for current requirements.
- **Separation of Concerns:** Keep logic separate from presentation. Use hooks for logic and components for UI.

---

## 2. React & Next.js Best Practices

### Client vs server components

- **Default to server:** In the App Router, components are **server components** by default. Use them for static or data-fetched content, smaller JS bundle, and better SEO (content in HTML).
- **Use client (`'use client'`) when you need:** `useState`, `useEffect`, event handlers (`onClick`, `onChange`), browser APIs (`window`, `document`), or client-only libraries (e.g. Framer Motion, React Query). Put `'use client'` at the top of the file.
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
  - **When NOT to use:**
    - Simple functions that don't cause re-renders
    - Functions that are recreated on every render but don't affect performance
- **`useMemo`:** Use for expensive calculations. Do not overuse; premature optimization adds complexity.
  - **When to use:**
    - Expensive computations (filtering large arrays, complex calculations)
    - Derived state that depends on multiple values
    - Objects/arrays passed as props to memoized children
  - **When NOT to use:**
    - Simple calculations (addition, string concatenation)
    - Values that are already primitive types
    - Over-optimization without profiling
- **Custom Hooks:** Extract complex logic into custom hooks (e.g., `useContactForm`, `useQuotation`).

#### useCallback Examples

```typescript
// ✅ Good: Function passed to memoized child component
const MemoizedChild = React.memo(({ onClick }: { onClick: () => void }) => {
  return <button onClick={onClick}>Click me</button>;
});

const Parent = () => {
  const [count, setCount] = useState(0);

  // Memoize to prevent MemoizedChild from re-rendering unnecessarily
  const handleClick = useCallback(() => {
    setCount((c) => c + 1);
  }, []); // Empty deps - function doesn't depend on props/state

  return <MemoizedChild onClick={handleClick} />;
};

// ✅ Good: Function used as dependency in useEffect
const Component = ({ userId }: { userId: string }) => {
  const fetchUser = useCallback(async () => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  }, [userId]); // Include userId in deps

  useEffect(() => {
    fetchUser();
  }, [fetchUser]); // Safe to use as dependency
};

// ❌ Bad: Unnecessary useCallback for simple function
const Component = () => {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []); // Unnecessary - simple function doesn't need memoization
};
```

#### useMemo Examples

```typescript
// ✅ Good: Expensive calculation
const ProductList = ({ products, filters }: Props) => {
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Expensive filtering logic
      return filters.every((f) => p.tags.includes(f));
    });
  }, [products, filters]); // Recalculate only when products or filters change

  return <div>{filteredProducts.map(...)}</div>;
};

// ✅ Good: Derived object passed to memoized child
const Parent = ({ items }: { items: Item[] }) => {
  const stats = useMemo(() => ({
    total: items.length,
    completed: items.filter((i) => i.completed).length,
  }), [items]);

  return <MemoizedChild stats={stats} />; // Object reference stays stable
};

// ❌ Bad: Unnecessary useMemo for simple calculation
const Component = ({ a, b }: { a: number; b: number }) => {
  const sum = useMemo(() => a + b, [a, b]); // Unnecessary - simple addition
  return <div>{sum}</div>;
};
```

### Navigation

- **`useRouter`:** Use `router.push()` from `@/i18n/navigation` for programmatic navigation.
- **`<Link>`:** Use `Link` from `@/i18n/navigation` for internal links (supports i18n routing).
- **Avoid:** `window.location.href` (causes full page reload).

### Images

- **Use Next.js `<Image>`:** Use the `Image` component from `next/image` for all images. Do not use raw `<img>` elements (this satisfies `@next/next/no-img-element` and keeps the codebase consistent).
- **When to use `unoptimized`:** Set `unoptimized` on `<Image>` when you need full quality without Next’s optimization (e.g. logos, branded graphics, or when the source image is already sized). For photos or large assets where size/performance matters, omit `unoptimized` so Next can optimize.
- **Rationale:** Using `<Image>` everywhere (with or without `unoptimized`) is preferred over `<img>`: same API, consistent layout/fill/sizes, and the option to enable optimization per image later.

### Layout: Hybrid (full-width background, content in container)

For Corporate / Engineering-style pages, use a **Hybrid** approach: **background full width, content with max-width**.

- **Section outer:** `w-full` (and section background classes) so the background (colour, gradient, image) spans the full viewport.
- **Content inner:** `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8` so content is centred and capped at ~1280px, with consistent gutters and readable line length on large/ultrawide screens.

Do **not** rely only on horizontal padding without a max-width; on wide monitors content would stretch too much and cards/text would look too wide.

```tsx
// Good: Hybrid
<section className="w-full bg-light-bg py-16 lg:py-20">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    {/* title, grid, cards, etc. */}
  </div>
</section>
```

Apply this pattern to Hero (overlay full width, inner content in container), Services section, and full-page layouts like the service page.

### Internationalization (i18n) – next-intl

- **Client components:** Use `useTranslations('namespace')` and `useLocale()`. Call hooks at top level.
- **Server components / Server Actions:** Use `getTranslations('namespace')` (async). Do not use `useTranslations` in server components.
- **Links:** Always use `Link` from `@/i18n/navigation` for internal links (locale-aware).
- **Translation key naming:** Use **camelCase** for keys in `messages/*.json` (e.g. `projectReference`, `readMore`, `infoBox`). Keep keys identical in `en.json` and `th.json`.
- **Message file structure:** Store in `messages/en.json` and `messages/th.json` with the same nested structure (e.g. `nav`, `hero`, `services`). Add new keys to both files together.

```typescript
// Client component
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

const ClientNav = () => {
  const locale = useLocale()
  const t = useTranslations('nav')
  return <Link href="/about">{t('about')}</Link>
}

// Server component
import { getTranslations } from 'next-intl/server'

const ServerHeading = async () => {
  const t = await getTranslations('hero')
  return <h1>{t('title')}</h1>
}
```

### Styling Best Practices

- **No Inline Styles:** Do not use `style={{ ... }}` props. Use Tailwind CSS utility classes for all styling.
- **No Hardcoded Colors:** Do not hardcode color values (e.g. `#E53935`, `rgb(...)`, `bg-[#1B2A4E]`) in components. Use CSS variables and theme from `globals.css` or Tailwind semantic classes (e.g. `text-brand-accent`, `bg-foreground`, `border-border-light`). Add new colors to `:root` / `@theme` in `globals.css` when needed.
- **Design tokens:** Prefer design tokens from `app/globals.css`: colors (e.g. `text-brand-accent`, `bg-foreground`), shadows (`shadow-(--shadow-text)`, `shadow-(--shadow-service-card)`), typography (`font-prompt`, `font-kanit`). Add new tokens in `:root` or `@theme inline` when needed; do not hardcode hex/rgb or arbitrary values in components.
- **Dynamic Styles:** Use `cn()` (clsx + tailwind-merge) for conditional classes.
- **Arbitrary Values:** **Avoid arbitrary values** (e.g., `w-[123px]`) whenever possible.
  - **Primary Rule:** Always prefer standard Tailwind utilities (e.g., `h-30`, `w-1/2`, `aspect-video`) over arbitrary values.
  - **Exception:** Use arbitrary values _only_ when a specific design requirement cannot be met with standard utilities or theme extensions.
  - **Syntax Preference:** When arbitrary values are necessary for CSS variables, use the modern Tailwind v4 syntax `property-(--variable)` instead of `[property:var(--variable)]`. Example: `text-shadow-(--shadow-text)`.
- **Gradients & Images:** Use Tailwind utilities like `bg-[url('/img.jpg')]` or `bg-gradient-to-r`.

### Interactive component states (UI states)

For **buttons, links, and other interactive elements**, support the following states where they apply so UX and a11y are consistent:

| State             | When                       | Tailwind / HTML                                                                                      |
| ----------------- | -------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Default**       | Normal, idle               | Base classes                                                                                         |
| **Hover**         | Pointer over element       | `hover:` (e.g. `hover:bg-white/20`, `hover:text-brand-accent`)                                       |
| **Active**        | Pressed / mousedown        | `active:` (e.g. `active:scale-[0.98]`)                                                               |
| **Disabled**      | Control is disabled        | `disabled` attribute + `disabled:` (e.g. `disabled:opacity-50 disabled:pointer-events-none`)         |
| **Focus-visible** | Keyboard focus (not mouse) | `focus-visible:` (e.g. `focus-visible:outline focus-visible:ring-2 focus-visible:ring-brand-accent`) |

- **Where necessary:** Use all of the above for primary controls (buttons, nav links, form submit). For secondary or decorative links, at least support hover and focus-visible.
- **Prefer `focus-visible:` over `focus:`** so mouse users don’t see a focus ring; keyboard users still get a clear indicator.
- **Loading:** If the action is async (e.g. submit), consider a loading state (disabled + spinner or aria-busy) so the user knows the action is in progress.
- Use `cn()` to combine base and state classes (e.g. `cn('...', 'hover:...', 'disabled:...')`).

---

## 3. TypeScript Guidelines

- **Strict Mode:** TypeScript `strict` mode is enabled in `tsconfig.json`.
- **No `any`:** Avoid using `any`. Use `unknown` if the type is truly uncertain, or define a proper Interface/Type.
- **Interfaces vs Types:** Prefer `interface` for object definitions (extensible) and `type` for unions/primitives.
- **Enums vs Union Types:** Prefer **string/number `union` types** over `enum` for most use cases (`type Status = 'idle' | 'loading' | 'error'`). Use `enum` only when you specifically need a runtime object (e.g., interoperating with non-TS code or when keys are used dynamically).
- **Props:** Define props interfaces for all components.
- **Avoid Magic Numbers/Strings:** Do not inline “magic” values (e.g., `0.85`, `'en'`, breakpoints, timeouts) directly in logic. Extract them into **named constants** with clear intent.
- **No Hardcoding (General):** Do not hardcode values (strings, numbers, colors, config) in code when a shared source exists or when they should be translatable. Prefer constants, CSS variables (`globals.css`), theme, or translation keys. See [§15 Internationalization](#15-internationalization-i18n-guidelines) for copy; see [§2 Styling](#styling-best-practices) for styles.

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}
```

### Comments

- **Use comments only when necessary** to explain non-obvious logic, business rules, or external constraints.
- **Avoid redundant comments** that repeat what the code already clearly expresses.
- **Keep comments up to date** – outdated or misleading comments must be removed or corrected.
- **No debug code:** Remove all `console.log`, `console.debug`, `console.info` statements before committing.
- **No commented code:** Do not commit commented-out code. Use version control (Git) for code history.

---

## 4. Folder Structure, Component Reuse & Barrel (index)

### Folder structure

- **Page-specific components:** Place under `app/[locale]/(site)/components/` when used only by that route group (e.g. Hero, Services, LivePreviewListener). Keeps route-related UI close to pages.
- **Shared / reusable components:** Place under `components/` (e.g. Navbar, Footer, CTASection) or `components/ui/` for primitives (e.g. sk-button, service-card). Import with `@/components/...` or `@/components/ui/...`.
- **Hooks, utils, config:** Under `lib/` (e.g. `lib/motion.ts`, `lib/utils.ts`, `lib/hooks/`).

```
app/
├── [locale]/              # Locale-based routing (en/th)
│   ├── (site)/           # Site pages
│   │   ├── about/        # About page
│   │   ├── contact/      # Contact page
│   │   ├── products/     # Products pages
│   │   ├── project-reference/ # Project reference page
│   │   ├── service/      # Services page
│   │   ├── components/    # Page-specific components (Hero, Services, etc.)
│   │   ├── layout.tsx    # Site layout
│   │   └── page.tsx      # Homepage
│   └── layout.tsx        # Locale layout
├── (payload)/            # Payload CMS routes
├── layout.tsx           # Root layout
└── globals.css          # Global styles & design tokens

components/               # Shared React components
├── Footer.tsx
├── Navbar.tsx
├── CTASection.tsx
└── ui/                  # Reusable UI primitives
    ├── sk-button.tsx
    └── service-card.tsx

lib/                     # Shared logic & config
├── motion.ts            # Framer Motion variants (design tokens for motion)
├── utils.ts
└── hooks/
```

### Component reuse & variants

- **Reuse:** Extract repeated UI into shared components (e.g. ServiceCard used on home Services and on the service page). Prefer one well-designed component over copy-paste.
- **Variants:** When two components are very similar (same layout, different content or style), use a **single component with variants** (props or a `variant` prop) instead of two separate files. Example: a card with `variant: 'compact' | 'full'` rather than `CompactCard.tsx` and `FullCard.tsx`.
- **Composition:** Prefer composition (children, slots, or small sub-components) over large prop lists. Keep components under 300 lines; split into sub-components or hooks when they grow.

### Barrel (index)

- **When to use:** Use an `index.ts` (or `index.tsx`) barrel only where it **reduces noisy imports** or groups a small set of related exports (e.g. a folder with multiple components consumed as one unit).
- **Example:** `app/[locale]/(site)/components/Hero/` with `Hero.tsx`, `HeroTitle.tsx`, `HeroInfoBox.tsx` can export from `Hero/index.ts` so consumers do `import { Hero } from '@/app/.../Hero'` or `import Hero from '.../Hero'` without knowing internal files.
- **Do not:** Barrel-export everything from a large flat list (e.g. re-exporting 20 components from `components/index.ts`). Prefer direct imports (`@/components/Navbar`) for clarity and tree-shaking.

### Naming Conventions

Use the following **file and identifier naming** consistently:

| Type                                         | Case                     | Example                                                        |
| -------------------------------------------- | ------------------------ | -------------------------------------------------------------- |
| **Component files**                          | PascalCase               | `Navbar.tsx`, `Hero.tsx`, `ServiceCard.tsx`                    |
| **Non-component TS/TSX** (utils, hooks, lib) | kebab-case               | `api-client.ts`, `utils.ts`, `use-products.ts`, `use-store.ts` |
| **UI primitives** (under `components/ui/`)   | kebab-case               | `sk-button.tsx`, `service-card.tsx`                            |
| **Route segments** (URL path folders)        | kebab-case               | `wire-cable/`, `project-reference/`                            |
| **Config / tool files**                      | as required by tool      | `commitlint.config.cjs`, `next.config.ts`, `vitest.config.ts`  |
| **Test files**                               | same as source + `.test` | `Navbar.test.tsx`, `utils.test.ts`                             |
| **Functions / variables**                    | camelCase                | `fetchProducts`, `isLoading`                                   |
| **Constants**                                | UPPER_SNAKE_CASE         | `MAX_RETRY_COUNT`, `NAVBAR_SCROLL_THRESHOLD_PX`                |
| **Translation keys** (in messages)           | camelCase                | `projectReference`, `readMore`, `infoBox`                      |

#### Constants & Magic Numbers

- **Prefer named constants** over inline literals that carry meaning:
  - ✅ `const HERO_SCROLL_THRESHOLD = 20;` then `window.scrollY > HERO_SCROLL_THRESHOLD`
  - ✅ `const POLL_INTERVAL_MS = 30_000;` then `setInterval(fn, POLL_INTERVAL_MS)`
  - ✅ `const SUPPORTED_LOCALES = ['en', 'th'] as const;`
- **Keep constants close to usage** if they are highly specific to a file/component; otherwise, move them to a shared config/module (e.g., `lib/constants.ts`).
- **Document non-obvious values** with a short comment (e.g., external limits, API constraints, business rules).

---

## 5. Performance (front & back)

### Front-end performance

- **Server by default:** Prefer server components so less JS is sent; fetch data on the server and pass as props to client components (better LCP and SEO). Add `'use client'` only where needed (see §2 Client vs server).
- **Code splitting:** Rely on Next.js automatic code splitting. Use `dynamic()` for heavy components that are not critical for LCP (e.g. below-the-fold modals).
- **Images:** Use `next/image`; add `priority` for above-the-fold images (logo, hero). Omit `unoptimized` for large photos so Next can optimize. Descriptive `alt` for a11y and SEO.
- **LCP / CLS:** Avoid layout shift: set dimensions or aspect ratio for images; reserve space for dynamic content. Keep main content in server-rendered HTML.
- **Bundle:** Keep client bundles small; avoid pulling large libs into client components when a server alternative exists.

### Back-end / API performance

- **Response time:** Keep API routes and server logic fast. Avoid long-running work on the request path; offload to background jobs if needed.
- **N+1 / queries:** Avoid N+1 queries; use joins, batch loads, or a single query where possible. Use connection pooling (e.g. Postgres) as configured.
- **Caching:** Cache stable data (e.g. revalidate in fetch, or use Next cache) where appropriate. Do not cache user-specific or sensitive data in shared caches without care.
- **Validation:** Validate and parse input early; return 400 for invalid payloads so invalid requests fail fast (see §11 Error handling).

### Memoization (front-end)

- Wrap expensive components in `React.memo` only if profiling shows render performance issues.
- Use `useMemo` and `useCallback` sparingly; premature optimization adds complexity.
- **Profiling:** Use React DevTools Profiler and Lighthouse to find real bottlenecks before optimizing.

---

## 6. Framer Motion

Use **Framer Motion** for entrance and scroll-based animations so Navbar, Hero, Services, and other sections feel consistent and avoid magic numbers.

### Shared variants (design tokens for motion)

- **Use `lib/motion.ts`:** Define shared variants and transitions in `lib/motion.ts` (e.g. `navbarEnter`, `heroContentEnter`, `staggerContainer`, `staggerItemFadeUp`, `viewportOnce`). Use these in components instead of inline `initial`/`animate`/`transition` with magic numbers.
- **No magic numbers:** Do not inline duration, delay, damping, or stiffness in components. Use named constants or variants from `lib/motion.ts` (e.g. `MOTION_DURATION_FAST`, `MOTION_SPRING_DAMPING`).

### When to use motion

- **Entrance:** Navbar, Hero, section headers and cards can use `initial`/`animate` or `whileInView` for subtle fade-up or stagger.
- **Consistency:** Use the same spring/stagger settings across pages (e.g. Hero and Service page hero; home Services grid and service page cards) so motion feels cohesive.
- **Accessibility:** Prefer `prefers-reduced-motion` respect: avoid or shorten motion when the user has reduced-motion preferences (Framer Motion supports this; keep animations subtle by default).

### Testing

- **Mock Framer Motion in tests:** When testing components that use `motion.*` (e.g. `motion.nav`, `motion.div`), add the same elements to the framer-motion mock (e.g. `motion: { nav: ({ children, ...props }) => <nav {...props}>{children}</nav> }`) so the component renders and tests pass. See `__tests__/components/Navbar.test.tsx` for an example.

---

## 7. Responsive Design

### Mobile-First Approach

- **Design Philosophy:** Use a mobile-first approach. Start with mobile layouts and progressively enhance for larger screens.
  - Mobile: `< 640px` (default)
  - Tablet (Small): `≥ 640px` (sm:)
  - Tablet (Regular): `≥ 768px` (md:)
  - Desktop: `≥ 1024px` (lg:)
  - Large Desktop: `≥ 1280px` (xl:)

### Tailwind CSS Utilities

- Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) for responsive styling.

```typescript
<div className="px-4 sm:px-6 lg:px-8">
  <h1 className="text-2xl sm:text-3xl lg:text-4xl">Title</h1>
</div>
```

### Touch Targets

- Interactive elements (buttons, links) should have a minimum touch target of **44×44px** on mobile devices.
- Maintain adequate spacing between touch targets.

---

## 8. SEO Metadata, Accessibility (a11y) & Lighthouse

### SEO metadata (Next.js App Router)

- **Where to set:** Use `generateMetadata` (async, for dynamic/locale-aware) or static `metadata` export in **layout.tsx** (site-wide) or **page.tsx** (page-specific). Prefer locale-aware titles/descriptions from `messages` (e.g. `getTranslations('metadata')`).
- **Required:** At least `title` and `description` for every public page. Set in root layout for defaults and override in pages where needed.
- **Open Graph:** Add `openGraph.title`, `openGraph.description`, `openGraph.url` (and `images` if needed) for social sharing. Use canonical URL; keep locale in URL for i18n.
- **Canonical:** Set canonical URL to avoid duplicate content (e.g. `metadataBase` in layout + path in each page or `alternates.canonical`).
- **Language:** `lang` on `<html>` is set by root layout (from locale). Use `alternates.languages` for en/th if needed.

```typescript
// app/[locale]/layout.tsx or page.tsx – locale-aware metadata
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'metadata',
  });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `https://yoursite.com/${params.locale}`,
    },
  };
}
```

- **Messages:** Add a `metadata` (or per-page) namespace in `messages/en.json` and `messages/th.json` with `title` and `description` so metadata is translatable.

### Accessibility (a11y)

- **Semantic HTML:** Use correct tags (`<button>` for actions, `<a>` for links, `<main>`, `<nav>`, `<section>`, `<article>`, `<h1>`–`<h6>` in order). One `<h1>` per page.
- **ARIA:** Add `aria-label` to interactive elements that have no visible text (e.g. icon-only buttons). Use `aria-current` for current nav item; `aria-busy` for loading.
- **Color contrast:** Text must meet WCAG AA (4.5:1 normal, 3:1 large). Use design tokens from `globals.css`; avoid low-contrast combinations.
- **Keyboard:** All interactive elements must be focusable and usable with Tab/Enter/Space. Support `focus-visible` styles (see §2 Interactive states). No keyboard traps.
- **Images:** Descriptive `alt` for content images; `alt=""` and `aria-hidden="true"` for decorative images.
- **Forms:** Associate labels with inputs (`<label for="id">` or wrap); show validation errors and link to fields (`aria-describedby`).
- **Motion:** Respect `prefers-reduced-motion` where possible (e.g. Framer Motion, CSS).
- **Lighthouse:** Run Lighthouse Accessibility and fix reported issues (see Lighthouse subsection below).

---

### Lighthouse

- **Target scores:** All public pages should aim for:
  - **Performance:** ≥ 90
  - **Accessibility:** 100
  - **Best Practices:** 100
  - **SEO:** 100
- **Core Web Vitals:** LCP &lt; 2.5s, INP/FID &lt; 100ms, CLS &lt; 0.1. FCP &lt; 1.8s where possible.
- **How:** Chrome DevTools → Lighthouse → select categories → “Analyze page load”. Run in incognito with no extensions; test mobile and desktop.
- **Ties to quality:** Performance score reflects front-end (bundle size, server response, images, layout stability). Accessibility and Best Practices reflect a11y and security. SEO reflects metadata, crawlability, and core signals. Fix issues reported before release.

---

## 9. Lighthouse audit

Run a Lighthouse audit before deployment (Chrome DevTools → Lighthouse → all categories, mobile and desktop). Target scores and metrics are in §8. Use results to fix Performance, Accessibility, Best Practices, and SEO issues.

---

## 10. Code Formatting & Tooling

### Prettier

- **Configuration:** Prettier is configured in `.prettierrc`.
- **Format on Save:** Configure your IDE to format on save using Prettier.
- **Pre-commit:** Run `npm run format` before committing.

### ESLint

- **Configuration:** ESLint is configured in `eslint.config.mjs`.
- **Rules:** Follow Next.js and TypeScript recommended rules.
- **Auto-fix:** Run `npm run lint` to auto-fix fixable issues.
- **No Warnings:** All ESLint warnings should be resolved before merging.

### Import Organization

- **Order:** Group imports in the following order:
  1. External packages (React, Next.js, third-party)
  2. Internal modules (`@/components`, `@/i18n`, `@/lib`)
  3. Relative imports (`./`, `../`)
  4. Type-only imports (use `import type`)

```typescript
// Good
import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types';
import { ProductCard } from './product-card';
```

### File Size & Complexity

- **File Size:** Keep files under **300 lines** when possible. Split large files into smaller, focused modules.
- **Function Complexity:** Keep functions under **50 lines**. Extract complex logic into helper functions or custom hooks.
- **Component Complexity:** Keep components under **200 lines**. Split large components into smaller sub-components.

---

## 11. Error Handling

- **API Calls:** Always wrap API calls in `try-catch` blocks within logic layers or custom hooks.
- **UI Feedback:** Use Toast notifications for transient errors (if implemented) or inline validation messages for form errors.
- **Error Boundaries:** Consider wrapping major route segments in React Error Boundaries to prevent full app crashes.
- **Logging:** Avoid `console.error` in application code. Use proper error monitoring services for production.

---

## 12. Git Conventions

### Branch Naming

- `feat/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `chore/task-description` - Maintenance tasks
- `refactor/module-name` - Code refactoring
- `docs/documentation` - Documentation updates

### Commit Messages

Use Conventional Commits format:

- `feat: add product catalog page`
- `fix: resolve mobile menu animation issue`
- `refactor: optimize hero component`
- `docs: update README`
- `chore: update dependencies`
- `style: format code with prettier`

### Commit Frequency

- Make small, focused commits. One logical change per commit.
- Before committing, ensure code passes:
  - TypeScript compilation
  - ESLint (`npm run lint`)
  - Prettier formatting (`npm run format`)

---

## 13. Testing (quality & coverage)

### Testing stack

- **Unit tests:** Vitest + React Testing Library (RTL). Use for components, hooks, utils, and API route handlers (with mocked request/response).
- **E2E (optional):** Playwright or similar for critical user flows.

### Test file conventions

- **Naming:** Place test files next to source with `.test.ts` or `.test.tsx` (e.g. `Navbar.tsx` → `Navbar.test.tsx`).
- **Location:** Same directory as source (or in `__tests__/` mirroring structure if the project prefers).

### Test quality

- **Behavior over implementation:** Assert outcomes and user-visible behavior, not internal state or implementation details.
- **Queries:** Prefer `getByRole`, `getByLabelText` over `getByTestId` for a11y and resilience.
- **Mocks:** Mock external deps: next-intl (`useTranslations`, `getTranslations`), `@/i18n/navigation` (Link, usePathname, useRouter), `next/image` (strip `unoptimized`/`priority` from props passed to `<img>`), framer-motion (`motion.nav`, `motion.div`, etc. as needed). Mock API/fetch in API tests.
- **Coverage:** Cover critical paths and edge cases; keep tests simple and stable. Run `npm run test` and ensure `npm run sonar` can read coverage when enabled.
- **API tests:** Test route handlers with mocked Request/Response; assert status codes and response shape; test validation (400 for invalid input).

---

## 14. Payload CMS Guidelines

### Collection Structure

- Define collections in `payload/collections/` directory
- Use TypeScript for type safety
- Follow Payload CMS best practices for field definitions

### Field Naming

- Use `camelCase` for field names
- Use descriptive names (e.g., `productTitle` not `title`)
- Group related fields using `group` or `tabs`

### Localization

- Use Payload's localization features for multi-language content
- Store translations in structured format (e.g., `{ th: string, en: string }`)

---

## 15. Internationalization (i18n) Guidelines

### No Hardcoding User-Facing Copy

- **Do not hardcode** user-facing text (Thai, English, or any locale-dependent strings) in components or pages.
- **Always use** next-intl: put copy in `messages/en.json` and `messages/th.json`, and use `useTranslations('namespace')` / `getTranslations()` in code.
- **Exceptions (when hardcoding is acceptable):**
  - Values that are identical in all locales and will never be translated (e.g. brand name "S.K. Charoensup" if used consistently, or raw data like phone numbers/emails when they are not translated).
  - Technical identifiers (e.g. API route paths, test IDs) that are not shown to users.
- **Do not** use `locale === 'th' ? 'ข้อความไทย' : 'English text'` in the UI. Use translation keys instead.

```typescript
// ✅ Good
const t = useTranslations('hero')
<h1>{t('title')}</h1>
<p>{t('tagline')}</p>

// ❌ Avoid: hardcoded copy
<h1>{locale === 'th' ? 'หัวข้อ' : 'Title'}</h1>
<p>โซลูชันวิศวกรรมครบวงจร</p>
```

### Translation files & key naming

- **Files:** Store translations in `messages/en.json` and `messages/th.json`. Keep structure identical in both files.
- **Key naming:** Use **camelCase** for all translation keys (e.g. `projectReference`, `readMore`, `infoBox`, `sectionDescription`). Do not use kebab-case or snake_case for keys.
- **Structure:** Use nested objects by feature or page (e.g. `nav`, `hero`, `services`, `contact`). Keep keys descriptive and consistent; add new keys to both en and th together.

### Translation Usage

```typescript
// Good
const t = useTranslations('hero')
<h1>{t('title')}</h1>

// Avoid
<h1>{locale === 'th' ? 'หัวข้อ' : 'Title'}</h1>
```

### URL Structure

- Use locale prefix in URLs: `/en/about`, `/th/about`
- Default locale (Thai) can be accessed without prefix or with `/th`
- Always use `Link` from `@/i18n/navigation` for internal links

---

## 17. SonarQube / Code Quality (front, back, test)

The project runs **SonarQube** for code quality, security, and duplication analysis. Code should pass SonarQube when you run `npm run sonar` (with SonarQube server running, e.g. via Docker).

### Quality by layer

- **Front-end (UI, components):** Type safety (no `any`), a11y (semantic HTML, ARIA, focus, alt text), no layout shift (CLS), small client bundles (prefer server components), design tokens and interactive states (see §2, §8). Test with RTL; mock next-intl, router, and Framer Motion.
- **Back-end (API routes, server logic):** Input validation and safe parsing; correct status codes (200, 201, 400, 401, 404, 500); no sensitive data or stack traces in responses; error handling (try/catch, no console.error in prod). See §11. Test API handlers with mocked request/response.
- **Tests:** Test behavior, not implementation (RTL: getByRole, getByLabelText). Cover critical paths and edge cases; mock external deps (API, next-intl, router). Keep tests simple and stable. See §13.

### What SonarQube checks

- **Bugs:** Logic errors and potential runtime failures (e.g. unused variables, wrong conditions).
- **Vulnerabilities:** Security issues (e.g. sensitive data exposure, unsafe patterns).
- **Code smells:** Maintainability issues (e.g. too much duplication, overly complex functions, dead code).
- **Duplication:** Copy-pasted or very similar code blocks; reduce by extracting shared logic.
- **Coverage:** Test coverage from `coverage/lcov.info` (Vitest); keep coverage where it matters.

### How to align code with SonarQube

- **Fix all Bugs and Security Hotspots** reported; address **Code Smells** where practical.
- **No `any`:** Use proper types (SonarQube flags `any`).
- **No dead code:** Remove unused variables, functions, and imports.
- **No `console.log` / debug code:** Remove before commit (see §3).
- **Reduce duplication:** Extract common logic into shared functions, hooks, or components (DRY).
- **Keep files/functions small:** See §10 (File Size & Complexity); large files/functions often get flagged.
- **Tests:** Write/update tests so coverage stays acceptable; run `npm run test` and ensure `npm run sonar` can read `coverage/lcov.info` when coverage is enabled.

Run `npm run sonar` locally (or rely on CI) before merging to catch issues early.

---

## 18. Code Quality Checklist

Before committing code, ensure:

- [ ] TypeScript compilation passes
- [ ] ESLint passes with no warnings
- [ ] Prettier formatting applied
- [ ] SonarQube analysis passes (`npm run sonar`) when run locally or in CI
- [ ] All images have `alt` attributes
- [ ] All links use `Link` from `@/i18n/navigation`
- [ ] No hardcoded user-facing text; all copy from `messages` via next-intl; keys camelCase; client useTranslations, server getTranslations (see §15)
- [ ] No hardcoded colors; use design tokens from `globals.css` or Tailwind semantic classes (see §2)
- [ ] Motion: use shared variants from `lib/motion.ts`; no magic numbers for duration/delay (see §6)
- [ ] Folder/reuse: page-specific under `app/.../components/`, shared under `components/` or `components/ui/`; use variants for similar components; barrel (index) only where it reduces noisy imports (see §4)
- [ ] Responsive design tested on mobile/tablet/desktop
- [ ] No `console.log` or debug code
- [ ] No commented-out code
- [ ] Code follows naming conventions (file case: §4 table; translation keys camelCase)
- [ ] Interactive elements have required states where needed: default, hover, active, disabled, focus-visible (see §2)
- [ ] Components are properly typed
- [ ] Client vs server: use server by default; `'use client'` only where needed (state, events, browser APIs) (see §2)
- [ ] SEO metadata: title and description (and OG where needed) set via generateMetadata or metadata; locale-aware from messages (see §8)
- [ ] a11y: semantic HTML, ARIA where needed, keyboard/focus-visible, alt text; run Lighthouse Accessibility (see §8)
- [ ] Lighthouse: run audit before release; aim for Performance ≥90, Accessibility 100, Best Practices 100, SEO 100 (see §8–9)

---

---

## 19. Quick Reference: When to Use What

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

**Note:** This document serves as a reference for both human developers and AI assistants to ensure consistency and quality across the codebase.

**Document Version:** 2.0  
**Last Updated:** January 2026  
**Project:** S.K. Charoensup Engineering Website
