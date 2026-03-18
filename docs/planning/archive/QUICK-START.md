# PURA PMS - Quick Start Guide

## 🚀 เริ่มต้นทำงานต่อจากนี้

เอกสารนี้เป็นคู่มือเริ่มต้นสำหรับทีมพัฒนา (อัปเดตหลังปิด Phase 3 — WP1–WP5)

---

## 📋 สถานะปัจจุบัน

**Completed:**

- ✅ Phase 1: Foundation
- ✅ Phase 2: Front Office Core

**Current:**

- 🎯 Phase 4: Operations Edge Cases

---

## 🎯 เริ่มทำงานต่อ (Phase 4)

เริ่มจากเช็คลำดับงานใน `docs/planning/roadmap.md` และใช้ `docs/planning/prd.md` เป็น source of truth

### Task 3.1.1: Merge Financial Schema Enhancements

**Priority:** Critical  
**Estimated Time:** 2 days

**Steps:**

1. เปิดไฟล์ `packages/database/prisma/schema.enhancements.prisma`
2. Review models ที่ต้อง merge:
   - TransactionCode
   - FolioWindow
   - FolioTransaction
   - ReasonCode
   - RoutingInstruction
   - Deposit
   - ExchangeRate
   - TaxInvoice
   - FixedCharge
3. Merge เข้า `packages/database/prisma/schema.prisma`
4. Update Folio model (add status, businessDate, closedAt, closedBy)
5. Update Reservation model (add relations)
6. Create migration (dev): `pnpm --filter database exec prisma migrate dev`
7. Test migration + app flows
8. Generate Prisma Client: `pnpm --filter database exec prisma generate`

**Acceptance Criteria:**

- ✅ All models merged
- ✅ Migration successful
- ✅ Prisma Client generated
- ✅ No TypeScript errors

---

## 📚 เอกสารที่ต้องอ่านก่อนเริ่ม

1. **[Detailed Work Plan](./DETAILED-WORK-PLAN.md)** - แผนงานละเอียด
2. **[PRD Enhancements](./prd-enhancements.md)** - ฟีเจอร์ที่ต้องทำ
3. **[Schema Enhancements](../../packages/database/prisma/schema.enhancements.prisma)** - Database schema
4. **[Coding Standards](../guidelines/coding_standards.md)** - มาตรฐานโค้ด

---

## 🔧 Development Workflow

### 1. Before Starting Work

```bash
# Pull latest changes
git pull origin main

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

### 2. Creating a Feature

```bash
# Create feature branch
git checkout -b feature/transaction-code-module

# Make changes
# ... code ...

# Test locally
pnpm test
pnpm lint
pnpm type-check

# Commit (will auto-format & lint)
git add .
git commit -m "feat: add transaction code module"
```

### 3. Code Quality Checks

- ✅ TypeScript: `pnpm type-check`
- ✅ ESLint: `pnpm lint`
- ✅ Prettier: `pnpm format:check`
- ✅ Tests: `pnpm test`
- ✅ Coverage: `pnpm test:coverage`

### 4. Before PR

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Code formatted
- [ ] Documentation updated

---

## 📊 Tracking Progress

### Daily Standup Questions

1. What did I complete yesterday?
2. What will I work on today?
3. Any blockers?

### Sprint Review

- Review completed tasks
- Update task.md
- Plan next sprint

---

## 🆘 Getting Help

### Technical Questions

- Check [Coding Standards](../guidelines/coding_standards.md)
- Check [PRD Enhancements](./prd-enhancements.md)
- Ask in team chat

### Blockers

- Document the blocker
- Ask for help early
- Don't wait too long

---

## ✅ Definition of Done

A task is considered "Done" when:

- [ ] Code written and tested
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests passing
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Lighthouse 100/100 (if UI)
- [ ] Responsive design tested
- [ ] Accessibility checked

---

**Ready to start?** Begin with [Task 3.1.1](./DETAILED-WORK-PLAN.md#task-311-merge-financial-schema-enhancements)
