# PURA PMS - Property Management System

Enterprise-grade Property Management System for 5-star hotels built with Next.js, NestJS, and PostgreSQL.

## 🚀 Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, TypeScript
- **Backend:** NestJS 11, Prisma ORM, PostgreSQL
- **Monorepo:** pnpm workspaces, Turborepo
- **State Management:** TanStack Query (React Query), Zustand
- **Error Monitoring:** Sentry
- **Quality:** ESLint, Prettier, Husky, Commitlint, SonarQube

## 📋 Prerequisites

- Node.js 20+
- pnpm 9.15.0+
- PostgreSQL 14+
- Docker (optional, for SonarQube)

## 🛠️ Setup

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local

# Setup database
pnpm db:generate
pnpm db:push
pnpm --filter database db:seed

# Start development servers
pnpm dev
```

## 📜 Available Scripts

### Root Level

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps
- `pnpm lint` - Lint all apps
- `pnpm type-check` - Type check all apps
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm test` - Run all tests
- `pnpm test:coverage` - Run tests with coverage
- `pnpm sonar` - Run SonarQube analysis

### Individual Apps

- `pnpm dev:web` - Start web app only
- `pnpm dev:api` - Start API server only
- `pnpm --filter api test` - Run API tests

## 🏗️ Project Structure

```
pura/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   └── database/      # Prisma schema & migrations
├── docs/             # Documentation
├── eslint-rules/     # Custom ESLint rules
└── .husky/           # Git hooks
```

## 🔒 Code Quality

This project enforces strict code quality standards:

- **Pre-commit:** Auto-format and lint staged files
- **Commit-msg:** Validate commit messages (Conventional Commits)
- **Pre-push:** Type check before push
- **CI/CD:** Format check, lint, type-check, test, build, security audit

See [docs/guidelines/coding_standards.md](./docs/guidelines/coding_standards.md) for details.

## 📚 Documentation

- [Coding Standards](./docs/guidelines/coding_standards.md)
- [Implementation Plan](./docs/planning/implementation_plan.md)
- [PRD](./docs/planning/prd.md)

## 🧪 Testing

### Test Stack

- **Backend:** Jest + @nestjs/testing
- **Frontend:** Jest + React Testing Library
- **E2E:** Playwright (Future)

### Commands

```bash
# Run all tests
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
```

## 🔍 Quality Gates

- **SonarQube:** Security A, Reliability A, Maintainability A
- **Coverage:** > 80% on new code
- **Linting:** 0 errors, 0 warnings
- **Type Safety:** Strict TypeScript mode

## 📝 License

Private - All rights reserved
