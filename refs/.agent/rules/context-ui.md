# UI / Component context

Apply when editing **UI** (components or pages, e.g. `app/**/*.tsx`, `components/**/*.tsx`, `app/**/layout.tsx`). Combine your knowledge with project rules.

## Use your knowledge (no need to paste long docs)

- React best practices (hooks, composition, keys, lists)
- Next.js App Router (server/client components, layouts, metadata)
- Accessibility (a11y): semantics, focus, aria, contrast
- Responsive design and Tailwind usage
- Performance: lazy load, memoization when justified

## Project-specific – read only these sections when needed

- **docs/CODING_STANDARDS.md §2** – Client vs server, React & Next.js (navigation, Images, Layout Hybrid, i18n, Styling, Design tokens, Interactive states)
- **§4** – Folder structure, component reuse, variants, barrel (index)
- **§6** – Framer Motion (shared variants from `lib/motion.ts`; no magic numbers)
- **§8** – SEO metadata (generateMetadata, messages), a11y, Lighthouse
- **§15** – i18n (no hardcoded copy; use `messages/*.json` and `useTranslations` / `getTranslations`)
- **§10** – File size & complexity (under 300 lines, split when needed)

## Quick checks

- Internal links: `Link` from `@/i18n/navigation`
- i18n: client `useTranslations`, server `getTranslations`; translation keys camelCase
- Images: `Image` from `next/image` (use `unoptimized` when full quality needed)
- Layout: section `w-full`; content `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`
- Design tokens: colors/shadows from `globals.css`; no hardcoded hex/rgb
- Interactive states: buttons/links support default, hover, active, disabled, focus-visible where needed
- Motion: use variants from `lib/motion.ts`; no magic duration/delay
- No inline styles; no hardcoded UI text
