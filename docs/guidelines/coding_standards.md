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
- **Server State:** Use React Query or SWR (Recommended for future refactoring) for caching and data synchronization.
- **Complex Global State:** Zustand (if needed). Avoid Redux unless strictly necessary due to boilerplate.

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
    variant?: "primary" | "secondary";
  }
  ```

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

- **Unit Testing:** Jest + React Testing Library. Test individual components and utility functions.
- **E2E Testing:** Playwright or Cypress (Future integration).
- **Coverage:** Aim for 80% coverage on critical business logic.

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
- **Logging:** Log critical errors to the console (development) or error monitoring service (production, e.g., Sentry).

## 9. Accessibility (a11y)

- **Semantic HTML:** Use correct tags (`<button>` for actions, `<a>` for links, `<main>`, `<nav>`).
- **ARIA Labels:** Add `aria-label` to interactive elements that lack visible text.
- **Color Contrast:** Ensure text meets WCAG AA standards.
- **Keyboard Navigation:** All interactive elements must be reachable and usable via keyboard (Tab/Enter/Space).

## 10. Git Conventions

- **Branch Naming:** `feat/feature-name`, `fix/bug-desc`, `chore/setup`.
- **Commit Messages:** Use Conventional Commits:
  - `feat: add reservation form`
  - `fix: resolve login timeout`
  - `refactor: optimize guest search`
  - `docs: update readme`

**Note:** This document serves as a reference for both human developers and AI assistants to ensure consistency and quality across the codebase.
