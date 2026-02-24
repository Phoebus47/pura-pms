# Test Structure Standard - PURA PMS

**Version:** 1.0  
**Last Updated:** 2025-01-XX  
**Maintained By:** @Architect  
**Status:** ✅ **ALIGNED WITH INDUSTRY BEST PRACTICES**

> **Note:** This structure follows industry best practices. See `test-structure-best-practices.md` for detailed alignment analysis.

---

## Overview

This document defines the standard structure and organization for test files across the PURA PMS monorepo. All test files must follow these conventions to ensure consistency, maintainability, and discoverability.

---

## Test File Naming Conventions

### Frontend (Next.js/React) - `apps/web/`

**Extension:** `.test.tsx` (for components) or `.test.ts` (for utilities)

**Location:** Next to source file (co-located)

**Examples:**

```
src/components/button.tsx          → src/components/button.test.tsx
src/components/ui/avatar.tsx      → src/components/ui/avatar.test.tsx
src/lib/utils.ts                  → src/lib/utils.test.ts
src/app/rooms/[id]/page.tsx       → src/app/rooms/[id]/page.test.tsx
```

**Rationale:**

- Co-located tests are easier to find and maintain
- Matches React/Next.js community standards
- IDE support for "Go to Test" works seamlessly

---

### Backend (NestJS) - `apps/api/`

**Extension:** `.spec.ts` (NestJS convention)

**Location:** Next to source file (co-located)

**Examples:**

```
src/app.controller.ts             → src/app.controller.spec.ts
src/guests/guests.service.ts      → src/guests/guests.service.spec.ts
src/auth/jwt.strategy.ts          → src/auth/jwt.strategy.spec.ts
```

**Rationale:**

- Follows NestJS official convention
- Consistent with NestJS CLI generated tests
- Industry standard for NestJS projects

---

### E2E Tests - `apps/web/e2e/`

**Extension:** `.spec.ts` (Playwright convention)

**Location:** `apps/web/e2e/` directory

**Structure:**

```
apps/web/e2e/
├── example.spec.ts
├── auth/
│   ├── login.spec.ts
│   └── logout.spec.ts
├── reservations/
│   ├── create-reservation.spec.ts
│   └── view-reservation.spec.ts
└── guests/
    └── guest-management.spec.ts
```

**Rationale:**

- Playwright uses `.spec.ts` convention
- E2E tests are separate from unit tests
- Grouped by feature/module for better organization

---

### Database Tests - `packages/database/`

**Extension:** `.test.ts`

**Location:** Next to source file or in `__tests__/` directory

**Structure:**

```
packages/database/
├── prisma/
│   ├── schema.prisma
│   └── seed-financial.ts
├── src/
│   └── index.ts
└── __tests__/
    ├── transaction-code.test.ts
    ├── folio-window.test.ts
    └── relations.test.ts
```

**Rationale:**

- Database tests are integration tests
- `__tests__/` folder keeps them organized
- Can also be co-located if preferred

---

## Directory Structure Summary

```
pura/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   └── [module]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── page.test.tsx          ← Co-located
│   │   │   ├── components/
│   │   │   │   ├── button.tsx
│   │   │   │   └── button.test.tsx           ← Co-located
│   │   │   └── lib/
│   │   │       ├── utils.ts
│   │   │       └── utils.test.ts             ← Co-located
│   │   └── e2e/
│   │       ├── auth/
│   │       │   └── login.spec.ts              ← E2E tests
│   │       └── reservations/
│   │           └── create.spec.ts
│   └── api/
│       └── src/
│           ├── app.controller.ts
│           ├── app.controller.spec.ts        ← Co-located
│           └── [module]/
│               ├── [module].service.ts
│               └── [module].service.spec.ts  ← Co-located
└── packages/
    └── database/
        ├── prisma/
        └── __tests__/
            └── *.test.ts                      ← Database tests
```

---

## Test File Organization Rules

### ✅ DO

1. **Co-locate tests** with source files (except E2E and database integration tests)
2. **Use consistent naming:**
   - Frontend: `.test.tsx` / `.test.ts`
   - Backend: `.spec.ts`
   - E2E: `.spec.ts`
   - Database: `.test.ts`
3. **Group related tests** using `describe` blocks
4. **Use descriptive test names** that explain what is being tested
5. **Keep test files focused** - one test file per source file

### ❌ DON'T

1. **Don't mix naming conventions** (e.g., don't use `.spec.ts` in frontend)
2. **Don't create separate `__tests__` folders** for unit/component tests (except database)
3. **Don't put tests in root-level test directories** (except E2E)
4. **Don't use generic names** like `test.ts` or `tests.tsx`
5. **Don't create test files without corresponding source files**

---

## Test File Structure Template

### Frontend Component Test

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './component-name';

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<ComponentName />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(...).toHaveBeenCalled();
  });
});
```

### Backend Service Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ServiceName } from './service-name';

describe('ServiceName', () => {
  let service: ServiceName;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceName],
    }).compile();

    service = module.get<ServiceName>(ServiceName);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should perform action correctly', () => {
    const result = service.method();
    expect(result).toBe(expected);
  });
});
```

---

## Migration Guide

### Current State Analysis

**Frontend (`apps/web`):**

- ✅ Already using `.test.tsx` / `.test.ts` (correct)
- ✅ Tests are co-located (correct)
- ✅ Structure is correct

**Backend (`apps/api`):**

- ✅ Already using `.spec.ts` (correct)
- ✅ Tests are co-located (correct)
- ✅ Structure is correct

**E2E (`apps/web/e2e`):**

- ✅ Already using `.spec.ts` (correct)
- ✅ Located in `e2e/` folder (correct)
- ⚠️ May need better organization by feature

**Database (`packages/database`):**

- ✅ Using `.test.ts` (correct)
- ✅ Located in appropriate directories (correct)

### No Migration Needed

The current test structure already follows the standard! However, we should:

1. **Document the standard** (this file)
2. **Ensure all new tests follow the standard**
3. **Review E2E test organization** for better feature grouping

---

## Best Practices

### Test Organization

1. **Group by functionality:**

   ```typescript
   describe('ComponentName', () => {
     describe('Rendering', () => {
       it('should render...');
     });

     describe('User Interactions', () => {
       it('should handle click...');
     });

     describe('Error Handling', () => {
       it('should display error...');
     });
   });
   ```

2. **Use descriptive test names:**
   - ✅ `should display error message when API call fails`
   - ❌ `should work correctly`

3. **Keep tests independent:**
   - Each test should be able to run in isolation
   - Use `beforeEach` / `afterEach` for setup/cleanup

### File Size Guidelines

- **Component tests:** Keep under 300 lines
- **Service tests:** Keep under 500 lines
- **E2E tests:** Keep under 200 lines per scenario

If a test file grows too large, consider:

- Splitting into multiple test files by feature
- Extracting test utilities/helpers
- Using shared test fixtures

---

## Test Discovery

### Vitest Configuration

Vitest automatically discovers test files based on patterns:

**Frontend (`apps/web/vitest.config.ts`):**

```javascript
include: ['src/**/*.test.{ts,tsx}'];
```

**Backend (`apps/api/vitest.config.ts`):**

```javascript
include: ['**/*.spec.ts'];
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run frontend tests only
pnpm --filter web test

# Run backend tests only
pnpm --filter api test

# Run E2E tests
pnpm --filter web test:e2e

# Run with coverage
pnpm test:cov
```

---

## Checklist for New Tests

When creating a new test file, ensure:

- [ ] File name follows naming convention (`.test.tsx`, `.spec.ts`, etc.)
- [ ] Test file is co-located with source file (or in appropriate directory)
- [ ] Test file has descriptive `describe` blocks
- [ ] Each test has a clear, descriptive name
- [ ] Tests are independent and can run in isolation
- [ ] Mocks are properly set up and cleaned up
- [ ] Test file is under size guidelines
- [ ] Test follows the template structure

---

## References

- [Vitest Documentation](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/react)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Playwright Testing](https://playwright.dev/docs/intro)

---

## Questions or Issues?

If you have questions about test structure or need clarification, please:

1. Check this document first
2. Review existing test files for examples
3. Ask @Architect for guidance

---

**Last Reviewed:** 2025-01-XX  
**Next Review:** 2025-04-XX
