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
pnpm --filter database exec prisma generate
pnpm --filter database exec prisma migrate dev
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
│   ├── web/                    # Next.js 16 frontend
│   │   ├── src/app/           # App Router pages
│   │   ├── src/components/    # React components
│   │   ├── src/lib/            # Utilities & API clients
│   │   └── src/hooks/          # Custom React hooks
│   └── api/                    # NestJS 11 backend
│       ├── src/modules/        # Feature modules
│       └── src/common/         # Shared utilities
├── packages/
│   └── database/               # Prisma schema & migrations
│       └── prisma/
│           └── schema.prisma          # Main schema
├── docs/
│   ├── planning/               # PRD, Roadmap, Reports
│   └── guidelines/             # Coding standards, AI guides
├── eslint-rules/               # Custom ESLint rules
└── .husky/                     # Git hooks
```

## 📊 Current Status

**Completed Phases:**

- ✅ Phase 1: Foundation (Infrastructure, Auth, Database, UI)
- ✅ Phase 2: Front Office Core (Property, Rooms, Guests, Reservations)

**Current Phase:**

- ✅ Phase 3: Financial & Audit (Complete)

**Remaining Phases:**

- 🎯 Phase 4: Operations Edge Cases (Day-use, Room Move, No-show, etc.)
- Phase 5: Advanced Features (Rate Derivation, AI Yield Management, PWA)
- Phase 6: Compliance & Communication (TM30, Guest Communication)
- Phase 7: i18n & Multi-Property

See [Development Roadmap](./docs/planning/roadmap.md) for complete task breakdown.

## 🔒 Code Quality

This project enforces strict code quality standards:

- **Pre-commit:** Auto-format and lint staged files
- **Commit-msg:** Validate commit messages (Conventional Commits)
- **Pre-push:** Type check before push
- **CI/CD:** Format check, lint, type-check, test, build, security audit

See [docs/guidelines/coding_standards.md](./docs/guidelines/coding_standards.md) for details.

## 📚 Documentation

### Planning & Requirements

- [PRD v3.2](./docs/planning/prd.md) — Product Requirements Document (24 Modules, Enterprise)
- [Development Roadmap](./docs/planning/roadmap.md) — Feature checklist & phase priorities

### Technical Documentation

- [Coding Standards](./docs/guidelines/coding_standards.md) — Code quality guidelines
- [Deployment Guide](./DEPLOYMENT.md) — Vercel + Render + Supabase setup

### Reports & Security

- [Reports Master List](./docs/planning/reports-master-list.md) — 30+ Report specifications
- [Security & Legal Compliance](./docs/planning/security-legal-compliance.md) — PDPA, PCI-DSS, TM30

## 🧪 Testing

### Test Stack

- **Backend:** Vitest + @nestjs/testing
- **Frontend:** Vitest + React Testing Library
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
