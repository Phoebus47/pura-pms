# PURA PMS - Implementation Plan (2026 Stack)

## Tech Stack

```
┌─────────────────────────────────────────────────────┐
│           FRONTEND (Next.js 16 + React 19)           │
│  • Turbopack (5x faster builds)                     │
│  • React Compiler (auto-memoization)                │
│  • Tailwind CSS 4 + shadcn/ui                       │
├─────────────────────────────────────────────────────┤
│           BACKEND (Node.js + NestJS)                 │
│  • NestJS 11 (modular, enterprise-ready)            │
│  • Prisma ORM + PostgreSQL                          │
│  • Passport.js + JWT authentication                 │
│  • Swagger auto-documentation                       │
├─────────────────────────────────────────────────────┤
│               UI THEME (Logo Colors)                 │
│  • Primary: #1E4B8E (Deep Blue)                     │
│  • Secondary: #F5A623 (Amber Orange)                │
│  • Accent: #3B82F6 (Sky Blue)                       │
└─────────────────────────────────────────────────────┘
```

---

## Project Structure (Monorepo)

```
pura/
├── apps/
│   ├── web/                        # Next.js 16 Frontend
│   │   ├── src/app/
│   │   ├── src/components/
│   │   └── package.json
│   │
│   └── api/                        # NestJS Backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── reservations/
│       │   │   ├── guests/
│       │   │   ├── rooms/
│       │   │   ├── billing/
│       │   │   ├── night-audit/
│       │   │   ├── finance/
│       │   │   └── reports/
│       │   ├── common/
│       │   └── main.ts
│       └── package.json
│
├── packages/
│   ├── database/                   # Prisma Schema
│   └── shared/                     # Shared Types
│
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Setup Commands

### Step 1: Create Monorepo

```powershell
cd "l:\Personal Project\pura"
git init
pnpm install
```

### Step 2: Next.js 16 Frontend

```powershell
cd apps
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir --turbopack --use-pnpm --yes
```

### Step 3: NestJS Backend

```powershell
cd apps
npx @nestjs/cli new api --package-manager pnpm --strict
```

### Step 4: Prisma Setup

```powershell
cd packages/database
pnpm db:push
```

### Step 5: shadcn/ui

```powershell
cd apps/web
npx -y shadcn@latest init -y
```

---

## Workspace Config

### pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

---

## Completed Steps

1. ✅ Tech stack finalized (Next.js 16 + NestJS)
2. ✅ Create monorepo structure
3. ✅ Initialize Next.js 16 frontend
4. ✅ Initialize NestJS backend
5. ✅ Setup Prisma database
6. ✅ Configure UI theme
7. ✅ Implementation of Main Layout & Navigation
8. ✅ UI Modernization (Premium Design)
