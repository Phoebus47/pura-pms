# PURA PMS - Current Sprint Plan

**Sprint:** Phase 3, Sprint 1  
**Duration:** 2 weeks (Week 5-6)  
**Status:** 🎯 Ready to Start  
**Last Updated:** 2025-01-XX

---

## 📊 Executive Summary

### Project Overview

**PURA PMS** เป็นระบบ Property Management System ระดับ Enterprise สำหรับโรงแรม 5 ดาว ที่พัฒนาด้วยเทคโนโลยีล่าสุด:

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** NestJS 11, Prisma ORM, PostgreSQL
- **Architecture:** Monorepo (pnpm + Turborepo)

### Current Status

- ✅ **Phase 1:** Foundation (100% Complete)
- ✅ **Phase 2:** Front Office Core (100% Complete)
- 🎯 **Phase 3:** Financial & Audit Module (0% - Starting Sprint 1)

### Project Health

- **Code Quality:** ✅ Excellent (TypeScript Strict, ESLint 0 warnings, Lighthouse 100/100)
- **Test Coverage:** 🚧 30% (Target: >80% - Needs improvement)
- **Documentation:** ✅ Comprehensive
- **Compliance:** ✅ 98% (Coding Standards, Accessibility)

---

## 🎯 Sprint 1 Goals (Week 5-6)

### Primary Objective

**Merge Financial Module Database Schema** เพื่อรองรับระบบบัญชีโรงแรมระดับ Enterprise ที่สอดคล้องกับ USALI standards

### Key Deliverables

1. ✅ Financial Module Schema merged into main schema
2. ✅ Database migration successful
3. ✅ Default data seeded (TransactionCodes, ReasonCodes)
4. ✅ Prisma Client updated
5. ✅ TypeScript types generated

---

## 📋 Task Breakdown

### Task 3.1.1: Merge Financial Schema Enhancements

**Priority:** 🔴 Critical  
**Estimated Time:** 2 days  
**Assigned To:** Backend Team  
**Dependencies:** None

#### Subtasks

- [x] Review `packages/database/prisma/schema.enhancements.prisma`
- [x] Merge TransactionCode model
- [x] Merge FolioWindow model
- [x] Merge FolioTransaction model (replace existing Transaction)
- [x] Merge ReasonCode model
- [x] Merge RoutingInstruction model
- [x] Merge Deposit model
- [x] Merge ExchangeRate model
- [x] Merge TaxInvoice model
- [x] Merge FixedCharge model
- [x] Update Folio model (add: status, businessDate, closedAt, closedBy)
- [x] Update Reservation model (add relations)
- [x] Add new Enums (TransactionType updated, TrxGroup, FolioStatus, ReasonCategory)
- [x] Create migration script
- [x] Test migration on development database
- [x] Update Prisma Client
- [x] Update Shift model (add folioTransactions relation)

#### Acceptance Criteria

- ✅ All new models merged successfully
- ✅ Migration runs without errors
- ✅ Existing data preserved (if any)
- ✅ Prisma Client generated successfully
- ✅ TypeScript types updated
- ✅ No TypeScript errors
- ✅ All relations properly defined
- ✅ Indexes added for performance

#### Code Quality Checks

- [x] No TypeScript errors
- [x] All relations properly defined
- [x] Indexes added for performance
- [x] Constraints validated
- [x] Migration tested on clean database
- [x] Rollback script prepared (migration script includes rollback notes)

---

### Task 3.1.2: Seed Default Data

**Priority:** 🟡 High  
**Estimated Time:** 1 day  
**Assigned To:** Backend Team  
**Dependencies:** Task 3.1.1

#### Subtasks

- [x] Create seed script for TransactionCode (default codes)
- [x] Create seed script for ReasonCode (default reasons)
- [x] Create seed script for GLAccount (USALI structure)
- [x] Test seed scripts
- [x] Document default codes

#### Acceptance Criteria

- ✅ Default TransactionCodes seeded:
  - Room Revenue (1000)
  - Food & Beverage (2000)
  - Tax (3000)
  - Service Charge (4000)
  - Payment Methods (5000-9000)
- ✅ Default ReasonCodes seeded:
  - Void
  - Discount
  - Adjustment
  - Correction
- ✅ GLAccount structure seeded (USALI compliant)
- ✅ Documentation created

---

## 📅 Timeline

### Week 5 (Days 1-5)

- **Day 1-2:** Task 3.1.1 - Merge Financial Schema
- **Day 3:** Task 3.1.2 - Seed Default Data
- **Day 4-5:** Testing & Documentation

### Week 6 (Days 6-10)

- **Day 6-7:** Code Review & Refinement
- **Day 8-9:** Integration Testing
- **Day 10:** Sprint Review & Planning for Sprint 2

---

## 🔄 Dependencies & Blockers

### Dependencies

- ✅ Schema enhancement file exists (`schema.enhancements.prisma`)
- ✅ Development database ready
- ✅ Prisma CLI configured

### Potential Blockers

- ⚠️ Migration conflicts with existing data (if any)
- ⚠️ TypeScript type generation issues
- ⚠️ Performance concerns with large datasets

### Mitigation

- Test migration on clean database first
- Create rollback script before migration
- Monitor migration performance

---

## 📊 Success Metrics

### Technical Metrics

- **Migration Success Rate:** 100%
- **TypeScript Errors:** 0
- **Test Coverage:** Maintain current (30%) or improve
- **Build Time:** No significant increase

### Quality Metrics

- **Code Review:** All tasks reviewed
- **Documentation:** Complete
- **Knowledge Transfer:** Team understands new schema

---

## 🚀 Next Sprint Preview (Sprint 2)

### Planned Tasks

1. Transaction Code Module (Backend API)
2. Transaction Code Module (Frontend UI)
3. Folio Window System (Backend API)
4. Folio Window System (Frontend UI)

### Estimated Duration

2 weeks (Week 7-8)

---

## 📝 Notes & Decisions

### Architecture Decisions

- **Immutable Transactions:** FolioTransaction records cannot be deleted, only voided
- **USALI Compliance:** All financial models follow USALI standards
- **Split Billing:** FolioWindow system supports multiple billing windows per reservation

### Technical Decisions

- Use Prisma migrations (not db:push) for production
- Seed scripts run automatically on development setup
- TypeScript types auto-generated from Prisma

---

## ✅ Definition of Done

A task is considered "Done" when:

- [ ] Code written and reviewed
- [ ] Tests passing (if applicable)
- [ ] Documentation updated
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Migration tested successfully
- [ ] Acceptance criteria met
- [ ] Code merged to main branch

---

## 📚 Reference Documents

- [Detailed Work Plan](./DETAILED-WORK-PLAN.md) - Complete Phase 3 breakdown
- [PRD](./prd.md) - Product Requirements
- [PRD Enhancements](./prd-enhancements.md) - Enterprise features
- [Schema Enhancements](../../packages/database/prisma/schema.enhancements.prisma) - Financial module schema
- [Coding Standards](../guidelines/coding_standards.md) - Code quality guidelines

---

**Sprint Status:** 🎯 **Ready to Start**  
**Next Review:** End of Week 6  
**Sprint Owner:** Development Team
