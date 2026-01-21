# PURA PMS - Coding Standards & Best Practices

This document outlines the coding standards, best practices, and quality gates for the PURA PMS project. All code contributions must adhere to these guidelines to maintain high code quality, maintainability, and scalability.

---

## 1. Core Principles

- **KISS (Keep It Simple, Stupid):** Avoid over-engineering. Write code that is easy to understand and maintain. If a simple solution exists, prefer it over a complex one.
- **DRY (Don't Repeat Yourself):** Extract common logic into reusable functions, hooks, or components. If you copy-paste code more than twice, refactor it.
- **YAGNI (You Aren't Gonna Need It):** Do not implement features or abstractions "just in case." Build for the current requirements.
- **Separation of Concerns:** Keep logic separate from presentation. Use hooks for logic and components for UI.

---

## 2. React & Next.js Best Practices

### Functional Components

- Use **Functional Components** with Hooks for all UI elements.
- **Naming:** PascalCase for components (e.g., `ReservationList.tsx`).

### Hooks Usage

- **`useState`:** Use for local UI state that doesn't need to be shared globally.
- **`useEffect`:** Use for side effects (data fetching, subscriptions). _Always_ include dependencies correctly.
- **`useCallback`:** Use to memoize functions passed as props to children to prevent unnecessary re-renders.
  ```typescript
  // Good
  const handleClick = useCallback(() => {
    // ...
  }, [dependency]);
  ```
- **`useMemo`:** Use for expensive calculations or to ensure referential equality for objects/arrays in dependency lists. Do not overuse; premature optimization adds complexity.
- **Custom Hooks:** Extract complex logic into custom hooks (e.g., `useReservationForm`, `useAuth`).

### Navigation

- **`useRouter`:** Use `router.push()` for programmatic navigation (e.g., after form submission).
- **`<Link>`:** Use Next.js `<Link>` component for standard internal links (better performance due to prefetching).
- **Avoid:** `window.location.href` (causes full page reload).

### State Management

- **Local State:** `useState`
- **Shared State (Simple):** React Context API (e.g., Theme, User Session).
- **Server State:** Use **TanStack Query** (React Query) for caching and data synchronization. Configured with `QueryProvider` in root layout.
- **Complex Global State:** **Zustand** for global UI state (e.g., auth, theme, modal state). Avoid Redux unless strictly necessary due to boilerplate.
- **State Store Location:** Store files in `src/lib/stores/` directory (e.g., `use-auth-store.ts`, `use-ui-store.ts`).

---

## 3. TypeScript Guidelines

- **Strict Mode:** TypeScript `strict` mode must be enabled (already set in `tsconfig.json`).
- **No `any`:** Avoid using `any`. Use `unknown` if the type is truly uncertain, or define a proper Interface/Type.
- **Interfaces vs Types:** Prefer `interface` for object definitions (extensible) and `type` for unions/primitives.
- **Props:** Define props interfaces for all components.
  ```typescript
  interface ButtonProps {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }
  ```

### Comments

- **Use comments only when necessary** to explain non-obvious logic, business rules, or external constraints that cannot be expressed clearly in code.
- **Avoid redundant comments** that repeat what the code already clearly expresses (e.g., `// increment i` above `i++`, `// Header` above `<header>`).
- **Avoid JSDoc for obvious code** – If error messages, function names, and code structure are self-explanatory, JSDoc is unnecessary.
- Prefer **good naming** (functions, variables, components) and **clear error messages** over comments for clarity.
- **Keep comments up to date** – outdated or misleading comments must be removed or corrected.
- Do not leave **debug/temporary comments** (e.g., commented-out code) in committed code.

---

## 4. Folder Structure & Naming

### Structure

```
apps/web/src/
├── app/                  # App Router pages
│   ├── (auth)/          # Auth related routes
│   ├── (dashboard)/     # Dashboard routes
│   └── layout.tsx       # Root layout
├── components/           # Reusable components
│   ├── ui/              # Primitive UI components (buttons, inputs)
│   ├── forms/           # Complex form components
│   └── shared/          # Shared business components
├── lib/                 # Utilities and configurations
│   ├── api/             # API clients
│   └── utils/           # Helper functions
├── hooks/               # Custom React hooks
└── types/               # Global TypeScript definitions
```

### Naming Conventions

- **Files:** `kebab-case` (e.g., `user-profile.tsx`, `api-client.ts`).
- **Components:** `PascalCase` (e.g., `UserProfile`).
- **Functions/Variables:** `camelCase` (e.g., `fetchUserData`, `isLoading`).
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`).

---

## 5. Performance Optimization

- **Code Splitting:** Rely on Next.js automatic splitting. Use `React.lazy` or `dynamic()` for heavy components that are not critical for LCP (Largest Contentful Paint).
- **Image Optimization:** Always use `next/image` for images to leverage optimization and lazy loading.
- **Memoization:** Wrap expensive components in `React.memo` only if profiling shows render performance issues.

---

## 6. Testing

### Testing Stack

- **Backend (NestJS):** Jest + @nestjs/testing + Supertest
- **Frontend (Next.js):** Jest + React Testing Library + @testing-library/jest-dom
- **E2E Testing:** Playwright (configured and ready to use)

### Test Types

- **Unit Tests:** Test individual functions, utilities, and components in isolation.
- **Integration Tests:** Test interactions between modules and API endpoints.
- **Component Tests:** Test React components with user interactions using React Testing Library.
- **E2E Tests:** Test complete user workflows using Playwright. Tests are located in `apps/web/e2e/` directory.

### Coverage Requirements

- **Target:** 80% coverage on critical business logic
- **Critical Areas:** Authentication, reservations, payments, data validation
- **Coverage Reports:** Generated in `coverage/` directory (lcov format for SonarQube)

### Test Commands

```bash
# Run all tests (both web and api)
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific app tests
pnpm --filter web test
pnpm --filter api test

# Watch mode
pnpm --filter web test:watch
pnpm --filter api test:watch

# E2E tests
pnpm test:e2e
pnpm --filter web test:e2e:ui
pnpm --filter web test:e2e:debug
```

### Test File Conventions

- **Naming:** Place test files next to source files with `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx` extension
- **Location:** Same directory as source file (e.g., `button.tsx` → `button.test.tsx`)
- **Structure:** Use `describe` blocks for grouping, `it` or `test` for individual tests

### Best Practices

- **Test Behavior, Not Implementation:** Focus on what the code does, not how it does it
- **Use React Testing Library Queries:** Prefer `getByRole`, `getByLabelText` over `getByTestId`
- **Mock External Dependencies:** Mock API calls, timers, and browser APIs
- **Keep Tests Simple:** One assertion per test when possible
- **Test User Interactions:** Use `@testing-library/user-event` for realistic user interactions
- **Cleanup:** Use `afterEach` or `afterAll` to clean up side effects

---

## 7. SonarQube Quality Gates

We adhere to the "Sonar Way" quality profile. To pass the quality gate:

- **Security Rating:** A (0 Vulnerabilities)
- **Reliability Rating:** A (0 Bugs)
- **Maintainability Rating:** A (Max Tech Debt Ratio < 5%)
- **Duplicated Lines:** < 3%
- **Coverage:** > 80% on new code
- **Cognitive Complexity:** Functions should not be overly complex (Score < 15 per function).

### Acceptance Criteria

Code will strictly NOT be accepted/merged if:

1. It introduces new Blocker/Critical issues.
2. It fails the TypeScript build.
3. Unit tests fail.
4. Linting errors persist.

---

## 8. Error Handling

- **API Calls:** Always wrap API calls in `try-catch` blocks within logic layers or custom hooks.
- **UI Feedback:** Use Toast notifications for transient errors (e.g., "Failed to save") and inline validation messages for form errors.
- **Error Boundaries:** Wrap major route segments or complex widgets in React Error Boundaries to prevent full app crashes.
- **Logging:** Use proper error monitoring services (e.g., Sentry) for production. Avoid `console.error` in application code.

## 8.1. Console Usage & Logging

### Prohibited in Production Code

- **`console.log`:** Never use in production code. Remove all debug logging before committing.
- **`console.error`:** Avoid in application code. Use Toast notifications for user-facing errors and error monitoring services for backend logging.

### Allowed Exceptions

- **Server Startup:** `console.log` in `main.ts` for server startup messages is acceptable.
- **Error Boundaries:** `console.error` in Error Boundaries is acceptable **only** when wrapped in `process.env.NODE_ENV === "development"` checks.
- **Bootstrap Errors:** `console.error` in bootstrap error handlers (e.g., `bootstrap().catch()`) is acceptable for critical startup failures.

### Best Practices

- **Frontend:** Use Toast notifications (`toast.error()`) for all user-facing error messages.
- **Backend:** Use Pino structured logging (configured via `LoggerModule`) instead of `console.log`.
  - Logger is automatically injected via NestJS dependency injection
  - Use `this.logger.log()`, `this.logger.error()`, `this.logger.warn()`, etc. in services/controllers
  - Development: Pretty-printed logs with colors
  - Production: JSON structured logs
- **Development:** Use debugger or temporary logging that is removed before commit.
- **Production:** **Sentry** is configured and ready to use. Set `NEXT_PUBLIC_SENTRY_DSN` environment variable to enable error tracking and analytics.

### Code Quality Standards

- **No Debug Code:** Remove all `console.log`, `console.debug`, `console.info` statements before committing.
- **No Commented Code:** Do not commit commented-out code. Use version control (Git) for code history.
- **Clean Commits:** Every commit should be production-ready. No temporary code, debug statements, or TODO comments unless they are tracked in issue management.

## 9. Code Formatting & Tooling

### Prettier

- **Configuration:** Prettier is configured at `apps/api/.prettierrc` with the following settings:
  - `singleQuote: true` - Use single quotes for strings
  - `trailingComma: "all"` - Add trailing commas where valid in ES5
- **Format on Save:** Configure your IDE to format on save using Prettier.
- **Pre-commit:** Run `pnpm format` before committing to ensure consistent formatting.
- **Web App:** Prettier configuration should be added to `apps/web` for consistency.

### ESLint

- **Configuration:** ESLint is configured per workspace (`apps/web/eslint.config.mjs`, `apps/api/eslint.config.mjs`).
- **Rules:** Follow Next.js and TypeScript recommended rules.
- **Auto-fix:** Run `pnpm lint` to auto-fix fixable issues before committing.
- **No Warnings:** All ESLint warnings must be resolved before merging.

### Import Organization

- **Order:** Group imports in the following order:
  1. External packages (React, Next.js, third-party)
  2. Internal modules (`@/components`, `@/lib`, `@/hooks`)
  3. Relative imports (`./`, `../`)
  4. Type-only imports (use `import type`)

```typescript
// Good
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import type { Guest } from '@/lib/api';
import { GuestForm } from './guest-form';
```

- **Separate Type Imports:** Use `import type` for type-only imports to improve build performance.

### File Size & Complexity

- **File Size:** Keep files under **300 lines** when possible. Split large files into smaller, focused modules.
- **Function Complexity:** Keep functions under **50 lines**. Extract complex logic into helper functions or custom hooks.
- **Component Complexity:** Keep components under **200 lines**. Split large components into smaller sub-components.
- **Cognitive Complexity:** Functions should have a cognitive complexity score < 15 (enforced by SonarQube).

### Editor Configuration

- **EditorConfig:** Consider adding `.editorconfig` for consistent editor settings across the team:

  ```ini
  root = true
  [*]
  indent_style = space
  indent_size = 2
  end_of_line = lf
  charset = utf-8
  trim_trailing_whitespace = true
  insert_final_newline = true
  ```

- **VS Code Settings:** Recommended settings:
  - Format on save: `true`
  - Default formatter: Prettier
  - ESLint auto-fix on save: `true`

### Pre-commit Hooks (Recommended)

- **Purpose:** Automatically format, lint, and type-check code before commits to ensure code quality.
- **Setup:** Use Husky + lint-staged to run:
  - `prettier --write` on staged files
  - `eslint --fix` on staged files
  - `type-check` before commit

#### Installation Steps

1. **Install dependencies:**

   ```bash
   pnpm add -D husky lint-staged
   ```

2. **Initialize Husky:**

   ```bash
   npx husky init
   ```

3. **Add pre-commit hook** (`.husky/pre-commit`):

   ```bash
   npx husky add .husky/pre-commit "npx lint-staged"
   ```

4. **Configure lint-staged** in `package.json`:

   ```json
   {
     "lint-staged": {
       "*.{ts,tsx}": ["prettier --write", "eslint --fix"],
       "*.{json,md,yml,yaml}": ["prettier --write"]
     }
   }
   ```

5. **Add prepare script** to `package.json`:
   ```json
   {
     "scripts": {
       "prepare": "husky"
     }
   }
   ```

#### Benefits

- **Automatic Quality Checks:** All committed code is automatically formatted and linted.
- **Prevents Bad Commits:** Blocks commits that fail type-checking or linting.
- **Consistent Code Style:** Ensures all team members follow the same formatting rules.
- **Time Saving:** No need to manually run formatters before committing.

#### Optional: Pre-push Hook

For additional safety, add a pre-push hook to run type-check:

```bash
npx husky add .husky/pre-push "pnpm type-check"
```

## 10. Accessibility (a11y)

- **Semantic HTML:** Use correct tags (`<button>` for actions, `<a>` for links, `<main>`, `<nav>`).
- **ARIA Labels:** Add `aria-label` to interactive elements that lack visible text.
- **Color Contrast:** Ensure text meets WCAG AA standards.
- **Keyboard Navigation:** All interactive elements must be reachable and usable via keyboard (Tab/Enter/Space).

## 11. Git Conventions

- **Branch Naming:** `feat/feature-name`, `fix/bug-desc`, `chore/setup`, `refactor/module-name`.
- **Commit Messages:** Use Conventional Commits:
  - `feat: add reservation form`
  - `fix: resolve login timeout`
  - `refactor: optimize guest search`
  - `docs: update readme`
  - `chore: update dependencies`
  - `style: format code with prettier`
- **Commit Frequency:** Make small, focused commits. One logical change per commit.
- **Before Committing:** Ensure code passes:
  - TypeScript compilation (`pnpm type-check`)
  - ESLint (`pnpm lint`)
  - Prettier formatting (if format script exists)

---

**Note:** This document serves as a reference for both human developers and AI assistants to ensure consistency and quality across the codebase.
