# Deployment Guide

## Environment Variables

### Frontend (Vercel)

ตั้งค่าใน **Vercel Dashboard → Project Settings → Environment Variables**:

```bash
# API Base URL - ใช้ URL ของ Render API
NEXT_PUBLIC_API_URL=https://your-api-name.onrender.com

# Sentry Error Tracking (Optional)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn-here
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project

# Node Environment (Vercel จะ set ให้อัตโนมัติ)
NODE_ENV=production
```

### Backend (Render)

ตั้งค่าใน **Render Dashboard → Service → Environment**:

```bash
# Database Connection (Supabase PostgreSQL)
# Recommended on Render: use Supabase Pooler (PgBouncer) URL when available.
# Example (transaction pooler): postgresql://...@aws-0-...pooler.supabase.com:6543/postgres?pgbouncer=true
DATABASE_URL=postgresql://user:password@host:6543/database?pgbouncer=true

# JWT Secret - ใช้สำหรับ sign/verify JWT tokens (ต้องเป็น random string ที่แข็งแรง)
# สร้างด้วย: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port (Render จะ set ให้อัตโนมัติผ่าน PORT env var)
PORT=10000

# CORS Origin - ใส่ URL ของ Vercel frontend (คั่นด้วย comma ถ้ามีหลาย URL)
# ตัวอย่าง: https://pura-pms-web.vercel.app,https://pura-pms-web-git-main-your-team.vercel.app
# ต้องไม่มี trailing slash (/)
CORS_ORIGIN=https://your-app.vercel.app,https://your-preview.vercel.app

# Node Environment
NODE_ENV=production

# Redis (BullMQ / Night Audit) — Render Key Value free instance on the same region
REDIS_HOST=red-xxxxxxxxxxxxxxxxxxxx
REDIS_PORT=6379

# Sentry Error Tracking (Optional - Server-side)
SENTRY_DSN=your-sentry-dsn-here
```

### Free-tier keep-alive (no paid plans)

Supabase Free pauses a project after about **7 days without database queries**.
Render Free web services **sleep after ~15 minutes idle** (cold start on the next request).
Neither requires a paid upgrade if you:

1. Keep `DATABASE_URL` on **Supabase** (Session pooler, Singapore / `ap-southeast-1`).
   Do **not** use Render Postgres Free as the long-term DB — it expires after 30 days.
2. Keep Redis on **Render Key Value Free** (`REDIS_HOST` / `REDIS_PORT`).
3. Keep the API on **Render Web Service Free**.
4. Leave GitHub Action `Keep free-tier services alive` enabled on `main`.
   It `GET`s `/health` twice a day so Supabase sees real SQL (`SELECT 1`) and Render wakes.

Optional repo variable `API_HEALTH_URL` overrides the default
`https://pura-pms-api.onrender.com/health`.

Recommended `DATABASE_URL` for Render (IPv4 Session pooler):

```bash
# Replace PASSWORD. Project ref comes from the Supabase dashboard URL.
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

Direct `db.PROJECT_REF.supabase.co:5432` also works if the password is set, but
the Session pooler is more reliable from Render.

## Deployment Steps

### 1. Deploy Backend (Render)

1. **สร้าง Web Service บน Render**
   - **Name**: `pura-api` (หรือชื่อที่ต้องการ)
   - **Environment**: `Node`
   - **Build Command**: `rm -rf node_modules && pnpm install --frozen-lockfile && pnpm --filter @pura/database build && pnpm --filter api build`
   - **Start Command**: `cd apps/api && pnpm start:prod`
   - **Root Directory**: (เว้นว่าง - Render จะ detect จาก repo)

2. **ตั้งค่า Environment Variables** (ตามด้านบน)

3. **ตั้งค่า Database Migration**
   - เพิ่ม **Post Deploy Script**: `cd packages/database && pnpm exec prisma migrate deploy`
   - หรือรัน migration ด้วยมือ: `pnpm --filter database exec prisma migrate deploy`

### 2. Deploy Frontend (Vercel)

1. **Import Project จาก GitHub**
   - เชื่อมต่อ GitHub repo
   - Vercel จะ auto-detect Next.js

2. **ตั้งค่า Project Settings**
   - **Root Directory**: `apps/web`
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm build` (หรือ `cd apps/web && pnpm build`)
   - **Output Directory**: `.next`

3. **ตั้งค่า Environment Variables** (ตามด้านบน)

4. **Deploy**

### 3. Database Setup (Supabase)

1. **สร้าง PostgreSQL Database บน Supabase**
2. **Copy Connection String** → ใส่ใน `DATABASE_URL` ของ Render
3. **Run Migration**:
   ```bash
   cd packages/database
   pnpm exec prisma migrate deploy
   ```
4. **Seed Data** (Optional):
   ```bash
   pnpm --filter database db:seed
   ```

## Important Notes

- **CORS**: ต้องตั้ง `CORS_ORIGIN` ใน Render ให้ตรงกับ Vercel URL
- **JWT_SECRET**: ต้องเป็น random string ที่แข็งแรง (ใช้ `openssl rand -base64 32`)
- **DATABASE_URL**: ต้องเป็น connection string ที่ถูกต้องจาก Supabase
- **Migration**: ใช้ `prisma migrate deploy` ใน production (อย่าใช้ `db push`)
- **Migrations**: repo มี baseline migrations แล้ว เพื่อกัน drift ระหว่าง DB กับ schema

## Troubleshooting

### CORS Error

- ตรวจสอบว่า `CORS_ORIGIN` ใน Render ตรงกับ Vercel URL
- ตรวจสอบว่าไม่มี trailing slash ใน URL

### Database Connection Error

- ตรวจสอบ `DATABASE_URL` ว่าถูกต้อง (โปรเจกต์เดียวกับใน Supabase Dashboard)
- ตรวจสอบว่า Supabase database เปิดให้เชื่อมต่อจากภายนอกได้
- `FATAL: tenant/user postgres.<ref> not found` แปลว่าโปรเจกต์ **pause** หรือ **ref ผิด**
  ไม่ใช่บั๊ก start command — Resume ที่ Supabase แล้วรอจนสถานะ Healthy
- หลัง Resume ให้ API มี retry ตอนบูต; ถ้ายังล้ม ให้ redeploy บน Render

### Build Error

- ตรวจสอบว่า monorepo structure ถูกต้อง
- ตรวจสอบว่า `package.json` มี scripts ที่ถูกต้อง
- ตรวจสอบว่า build command ใน Render ถูกต้อง: `rm -rf node_modules && pnpm install --frozen-lockfile && pnpm --filter @pura/database build && pnpm --filter api build`
- ตรวจสอบว่า Prisma schema อยู่ใน `packages/database/prisma/schema.prisma`

### Prisma Generate Error

- ตรวจสอบว่า `DATABASE_URL` ถูกตั้งค่าใน Render environment variables
- ตรวจสอบว่า Prisma config (`packages/database/prisma.config.ts`) ถูกต้อง
- Build command ต้อง build `@pura/database` ก่อน `api` เพื่อ generate Prisma Client
- **ถ้าเจอ `prisma: not found` หรือ `tsc: not found`**:
  - Render ใช้ cached node_modules ที่ไม่มี dependencies ใหม่
  - **วิธีแก้**: ล้าง Build Cache ใน Render Dashboard → Service → Settings → "Clear build cache"
  - หรือใช้ Build Command ที่ลบ node_modules ก่อน: `rm -rf node_modules && pnpm install --frozen-lockfile && pnpm --filter @pura/database build && pnpm --filter api build`

### Start Command / `Cannot find module .../dist/main`

- API production build ต้อง emit `apps/api/dist/main.js`
- `tsconfig.build.json` ต้อง `rootDir: ./src` และ include เฉพาะ `src/**/*.ts` (อย่าให้ `vitest.config.ts` ดึง rootDir ขึ้นไปที่โฟลเดอร์แพ็กเกจ)
- Start Command: `cd apps/api && pnpm start:prod` (`node dist/main.js`)
- ถ้า deploy เก่ายัง emit ที่ `dist/src/main.js` ให้แก้ Start Command ชั่วคราวเป็น `cd apps/api && node dist/src/main.js` แล้ว redeploy หลัง merge แพตช์นี้
