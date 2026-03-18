# PURA PMS - Detailed Work Plan & Task Breakdown

## 📋 Executive Summary

เอกสารนี้เป็น **แผนการทำงานที่ละเอียด** สำหรับการพัฒนา PURA PMS โดยแบ่งงานออกเป็น Tasks ย่อยๆ เพื่อควบคุมคุณภาพโค้ดและติดตามความคืบหน้า

**Current Status:** Phase 1 ✅ Complete | Phase 2 ✅ Complete | Phase 3 ✅ Complete (WP1–WP5)  
**Next Phase:** Phase 4 - Operations Edge Cases (Current Priority)

> Note: This document is an archived work plan snapshot. For the current source of truth, use `docs/planning/roadmap.md` and `docs/planning/prd.md`.

---

## 🎯 Current Project Status

### ✅ Completed (Phase 1 & 2)

**Infrastructure:**

- ✅ Monorepo setup (pnpm + Turborepo)
- ✅ Next.js 16 + React 19 Frontend
- ✅ NestJS 11 Backend
- ✅ PostgreSQL Database (Supabase)
- ✅ Prisma ORM
- ✅ Authentication & Authorization
- ✅ UI Theme & Design System

**Core Features:**

- ✅ Property Management
- ✅ Room Management
- ✅ Room Type Management
- ✅ Guest Profile (CRM)
- ✅ Reservation Management
- ✅ Dashboard (Real-time stats)
- ✅ Responsive Design (Mobile + Desktop)

**Code Quality:**

- ✅ TypeScript Strict Mode
- ✅ ESLint + Prettier
- ✅ Husky + lint-staged
- ✅ EditorConfig
- ✅ Lighthouse 100/100 (Target)
- ✅ Accessibility (ARIA, Form labels)

---

## 📅 Phase 3: Financial & Audit Module (Priority - 8-12 weeks)

### Sprint 1: Database Schema Enhancement (Week 1-2)

#### Task 3.1.1: Merge Financial Schema Enhancements

**Priority:** Critical  
**Estimated Time:** 2 days  
**Dependencies:** None

**Subtasks:**

- [ ] Review `schema.enhancements.prisma`
- [ ] Merge TransactionCode model into `schema.prisma`
- [ ] Merge FolioWindow model
- [ ] Merge FolioTransaction model (replace Transaction)
- [ ] Merge ReasonCode model
- [ ] Merge RoutingInstruction model
- [ ] Merge Deposit model
- [ ] Merge ExchangeRate model
- [ ] Merge TaxInvoice model
- [ ] Merge FixedCharge model
- [ ] Update Folio model (add status, businessDate, closedAt, closedBy)
- [ ] Update Reservation model (add relations: fixedCharges, deposits, taxInvoices)
- [ ] Add new Enums (TrxType, TrxGroup, FolioStatus, ReasonCategory)
- [ ] Create migration script
- [ ] Test migration on development database
- [ ] Update Prisma Client

**Acceptance Criteria:**

- ✅ All new models merged successfully
- ✅ Migration runs without errors
- ✅ Existing data preserved (if any)
- ✅ Prisma Client generated successfully
- ✅ TypeScript types updated

**Code Quality Checks:**

- [ ] No TypeScript errors
- [ ] All relations properly defined
- [ ] Indexes added for performance
- [ ] Constraints validated

---

#### Task 3.1.2: Seed Default Data

**Priority:** High  
**Estimated Time:** 1 day  
**Dependencies:** Task 3.1.1

**Subtasks:**

- [ ] Create seed script for TransactionCode (default codes)
- [ ] Create seed script for ReasonCode (default reasons)
- [ ] Create seed script for GLAccount (USALI structure)
- [ ] Test seed scripts
- [ ] Document default codes

**Acceptance Criteria:**

- ✅ Default TransactionCodes seeded (Room, F&B, Tax, Service, etc.)
- ✅ Default ReasonCodes seeded (Void, Discount, Adjustment, etc.)
- ✅ USALI Chart of Accounts seeded
- ✅ Seed script runs successfully

---

### Sprint 2: Transaction Code Module (Week 2-3)

#### Task 3.2.1: Backend - Transaction Code API

**Priority:** Critical  
**Estimated Time:** 3 days  
**Dependencies:** Task 3.1.1

**Subtasks:**

- [ ] Create TransactionCode module (NestJS)
- [ ] Create TransactionCode service
- [ ] Create TransactionCode controller
- [ ] Implement CRUD operations
- [ ] Add validation (code uniqueness, GL mapping)
- [ ] Add filters (by type, group)
- [ ] Add search functionality
- [ ] Write unit tests (>80% coverage)
- [ ] Write integration tests
- [ ] Document API (Swagger)

**Acceptance Criteria:**

- ✅ CRUD operations working
- ✅ Validation working
- ✅ Tests passing (>80% coverage)
- ✅ API documented in Swagger
- ✅ Error handling implemented

**Code Quality Checks:**

- [ ] No `any` types
- [ ] Proper error handling
- [ ] Input validation
- [ ] TypeScript strict mode
- [ ] ESLint passing

---

#### Task 3.2.2: Frontend - Transaction Code Management UI

**Priority:** High  
**Estimated Time:** 2 days  
**Dependencies:** Task 3.2.1

**Subtasks:**

- [ ] Create TransactionCode list page
- [ ] Create TransactionCode form dialog
- [ ] Add filters (type, group)
- [ ] Add search functionality
- [ ] Add validation (client-side)
- [ ] Add i18n support (Thai + English)
- [ ] Write component tests
- [ ] Test responsive design

**Acceptance Criteria:**

- ✅ List page displays all codes
- ✅ Form creates/updates codes
- ✅ Filters working
- ✅ Search working
- ✅ Validation working
- ✅ Responsive design
- ✅ i18n working

**Code Quality Checks:**

- [ ] Lighthouse 100/100
- [ ] Accessibility (ARIA labels)
- [ ] Form labels with htmlFor
- [ ] No console errors
- [ ] TypeScript strict mode

---

### Sprint 3: Folio Window System (Week 3-4)

#### Task 3.3.1: Backend - Folio Window API

**Priority:** Critical  
**Estimated Time:** 3 days  
**Dependencies:** Task 3.1.1

**Subtasks:**

- [ ] Create FolioWindow module
- [ ] Create FolioWindow service
- [ ] Implement window creation (default Window 1)
- [ ] Implement window management (add, remove, update)
- [ ] Implement balance calculation
- [ ] Add validation (window number uniqueness)
- [ ] Write unit tests
- [ ] Write integration tests

**Acceptance Criteria:**

- ✅ Windows can be created per Folio
- ✅ Balance calculation correct
- ✅ Validation working
- ✅ Tests passing

---

#### Task 3.3.2: Frontend - Folio Window UI

**Priority:** High  
**Estimated Time:** 2 days  
**Dependencies:** Task 3.3.1

**Subtasks:**

- [ ] Update Folio detail page
- [ ] Add window tabs/selector
- [ ] Display transactions by window
- [ ] Add window management (add, remove)
- [ ] Add window balance display
- [ ] Test responsive design

**Acceptance Criteria:**

- ✅ Windows displayed correctly
- ✅ Transactions filtered by window
- ✅ Balance displayed correctly
- ✅ Window management working

---

### Sprint 4: Folio Transaction System (Week 4-5)

#### Task 3.4.1: Backend - Folio Transaction API

**Priority:** Critical  
**Estimated Time:** 5 days  
**Dependencies:** Task 3.1.1, 3.2.1, 3.3.1

**Subtasks:**

- [ ] Create FolioTransaction module
- [ ] Create FolioTransaction service
- [ ] Implement transaction creation (with tax/service calculation)
- [ ] Implement transaction void (reverse entry)
- [ ] Implement business date logic
- [ ] Implement immutable transaction (no update, only reverse)
- [ ] Add reason code validation (for void/adjustment)
- [ ] Add night audit lock check
- [ ] Implement balance recalculation
- [ ] Write unit tests (complex logic)
- [ ] Write integration tests

**Acceptance Criteria:**

- ✅ Transactions created correctly
- ✅ Tax/Service calculated correctly
- ✅ Void creates reverse entry
- ✅ Business date logic correct
- ✅ Immutable enforcement working
- ✅ Tests passing (>80% coverage)

**Code Quality Checks:**

- [ ] Complex business logic tested
- [ ] Edge cases covered
- [ ] Performance optimized (indexes)
- [ ] Transaction rollback on errors

---

#### Task 3.4.2: Frontend - Folio Transaction UI

**Priority:** High  
**Estimated Time:** 3 days  
**Dependencies:** Task 3.4.1

**Subtasks:**

- [ ] Update Folio detail page
- [ ] Add transaction list (grouped by date)
- [ ] Add transaction form (charge, payment, adjustment)
- [ ] Add transaction void dialog (with reason code)
- [ ] Display tax/service breakdown
- [ ] Add transaction filters
- [ ] Add transaction search
- [ ] Test responsive design

**Acceptance Criteria:**

- ✅ Transactions displayed correctly
- ✅ Transaction creation working
- ✅ Void with reason code working
- ✅ Tax/service breakdown displayed
- ✅ Filters working

---

### Sprint 5: Reason Code System (Week 5-6)

#### Task 3.5.1: Backend - Reason Code API

**Priority:** High  
**Estimated Time:** 2 days  
**Dependencies:** Task 3.1.1

**Subtasks:**

- [ ] Create ReasonCode module
- [ ] Create ReasonCode service
- [ ] Implement CRUD operations
- [ ] Add validation
- [ ] Write unit tests
- [ ] Document API

**Acceptance Criteria:**

- ✅ CRUD working
- ✅ Validation working
- ✅ Tests passing

---

#### Task 3.5.2: Frontend - Reason Code UI

**Priority:** Medium  
**Estimated Time:** 1 day  
**Dependencies:** Task 3.5.1

**Subtasks:**

- [ ] Create ReasonCode management page
- [ ] Add reason code selector in transaction forms
- [ ] Add validation (required for void/adjustment)
- [ ] Test responsive design

**Acceptance Criteria:**

- ✅ Reason codes can be managed
- ✅ Selector in forms working
- ✅ Validation working

---

### Sprint 6: Night Audit System Enhancement (Week 6-7)

#### Task 3.6.1: Backend - Night Audit Queue System

**Priority:** Critical  
**Estimated Time:** 4 days  
**Dependencies:** Task 3.4.1

**Subtasks:**

- [ ] Setup Redis (BullMQ)
- [ ] Create Night Audit queue
- [ ] Implement pre-audit checks
- [ ] Implement room posting (with Fixed Charges)
- [ ] Implement transaction locking (after audit)
- [ ] Implement business date roll
- [ ] Add error handling & retry logic
- [ ] Add progress tracking
- [ ] Write unit tests
- [ ] Write integration tests

**Acceptance Criteria:**

- ✅ Queue system working
- ✅ Night audit runs in background
- ✅ Transactions locked after audit
- ✅ Business date rolled correctly
- ✅ Error handling working
- ✅ Tests passing

**Code Quality Checks:**

- [ ] No blocking operations
- [ ] Proper error handling
- [ ] Transaction rollback on errors
- [ ] Performance optimized

---

#### Task 3.6.2: Frontend - Night Audit UI

**Priority:** High  
**Estimated Time:** 2 days  
**Dependencies:** Task 3.6.1

**Subtasks:**

- [ ] Create Night Audit page
- [ ] Add pre-audit checklist
- [ ] Add audit progress indicator
- [ ] Add audit results display
- [ ] Add error display
- [ ] Add re-run capability
- [ ] Test responsive design

**Acceptance Criteria:**

- ✅ Night audit can be triggered
- ✅ Progress displayed
- ✅ Results displayed
- ✅ Errors displayed
- ✅ Re-run working

---

### Sprint 7: Shift Management Enhancement (Week 7-8)

#### Task 3.7.1: Backend - Shift Management API

**Priority:** High  
**Estimated Time:** 3 days  
**Dependencies:** None

**Subtasks:**

- [ ] Enhance Shift module
- [ ] Add shift open/close logic
- [ ] Add cash reconciliation
- [ ] Add variance calculation
- [ ] Add manager approval
- [ ] Write unit tests
- [ ] Write integration tests

**Acceptance Criteria:**

- ✅ Shift open/close working
- ✅ Cash reconciliation working
- ✅ Variance calculated correctly
- ✅ Manager approval working
- ✅ Tests passing

---

#### Task 3.7.2: Frontend - Shift Management UI

**Priority:** High  
**Estimated Time:** 2 days  
**Dependencies:** Task 3.7.1

**Subtasks:**

- [ ] Create Shift management page
- [ ] Add shift open dialog
- [ ] Add shift close dialog
- [ ] Add cash reconciliation form
- [ ] Add variance display
- [ ] Add manager approval workflow
- [ ] Test responsive design

**Acceptance Criteria:**

- ✅ Shift management working
- ✅ Cash reconciliation working
- ✅ Manager approval working

---

### Sprint 8: Core Reports (Week 8-9)

#### Task 3.8.1: Daily Revenue Report (DRR)

**Priority:** Critical  
**Estimated Time:** 3 days  
**Dependencies:** Task 3.4.1

**Subtasks:**

- [ ] Create DRR service (backend)
- [ ] Implement revenue calculation (by department)
- [ ] Implement tax/service breakdown
- [ ] Implement comparison (Today/MTD/YTD/Budget/Last Year)
- [ ] Create DRR API endpoint
- [ ] Write unit tests
- [ ] Create DRR page (frontend)
- [ ] Add filters (date range)
- [ ] Add export (PDF, Excel)
- [ ] Test responsive design

**Acceptance Criteria:**

- ✅ DRR calculated correctly
- ✅ All columns displayed
- ✅ Comparison working
- ✅ Export working
- ✅ Tests passing

---

#### Task 3.8.2: Trial Balance Report

**Priority:** Critical  
**Estimated Time:** 3 days  
**Dependencies:** Task 3.4.1

**Subtasks:**

- [ ] Create Trial Balance service
- [ ] Implement GL account aggregation
- [ ] Implement drill-down capability
- [ ] Create Trial Balance API endpoint
- [ ] Write unit tests
- [ ] Create Trial Balance page (frontend)
- [ ] Add interactive drill-down
- [ ] Add filters (date range, account)
- [ ] Add export (PDF, Excel)
- [ ] Test responsive design

**Acceptance Criteria:**

- ✅ Trial Balance calculated correctly
- ✅ Drill-down working
- ✅ Filters working
- ✅ Export working

---

#### Task 3.8.3: Daily Flash Report

**Priority:** High  
**Estimated Time:** 2 days  
**Dependencies:** Task 3.8.1

**Subtasks:**

- [ ] Create Daily Flash Report service
- [ ] Implement Today/MTD/YTD calculation
- [ ] Implement Forecast calculation
- [ ] Create Daily Flash Report API endpoint
- [ ] Create Daily Flash Report page (frontend)
- [ ] Add auto-email functionality
- [ ] Test responsive design

**Acceptance Criteria:**

- ✅ Report calculated correctly
- ✅ Auto-email working
- ✅ Display correct

---

### Sprint 9: Tax Invoice System (Week 9-10)

#### Task 3.9.1: Backend - Tax Invoice API

**Priority:** Critical  
**Estimated Time:** 4 days  
**Dependencies:** Task 3.4.1

**Subtasks:**

- [ ] Create TaxInvoice module
- [ ] Create TaxInvoice service
- [ ] Implement running number generation
- [ ] Implement e-Tax Invoice integration (if available)
- [ ] Implement QR Code generation
- [ ] Add validation
- [ ] Write unit tests
- [ ] Write integration tests

**Acceptance Criteria:**

- ✅ Tax Invoice created correctly
- ✅ Running number sequential
- ✅ QR Code generated
- ✅ Tests passing

---

#### Task 3.9.2: Frontend - Tax Invoice UI

**Priority:** High  
**Estimated Time:** 3 days  
**Dependencies:** Task 3.9.1

**Subtasks:**

- [ ] Create Tax Invoice generation page
- [ ] Add invoice preview
- [ ] Add PDF generation
- [ ] Add Thai font support (Sarabun/Prompt)
- [ ] Add invoice list/management
- [ ] Add void invoice functionality
- [ ] Test responsive design

**Acceptance Criteria:**

- ✅ Tax Invoice generated correctly
- ✅ PDF with Thai font working
- ✅ Void working
- ✅ List/management working

---

### Sprint 10: Security & Compliance (Week 10-11)

#### Task 3.10.1: PDPA Compliance

**Priority:** Critical  
**Estimated Time:** 3 days  
**Dependencies:** None

**Subtasks:**

- [ ] Create GuestConsent model
- [ ] Create consent management API
- [ ] Add consent form in check-in
- [ ] Add data anonymization script
- [ ] Add breach notification system
- [ ] Write unit tests

**Acceptance Criteria:**

- ✅ Consent management working
- ✅ Anonymization working
- ✅ Breach notification working

---

#### Task 3.10.2: TM.30 Auto-generation

**Priority:** High  
**Estimated Time:** 2 days  
**Dependencies:** None

**Subtasks:**

- [ ] Create TM.30 report service
- [ ] Implement format compliance
- [ ] Create TM.30 API endpoint
- [ ] Add auto-generation (daily)
- [ ] Add export (Text, Excel)
- [ ] Add auto-upload (if API available)

**Acceptance Criteria:**

- ✅ TM.30 generated correctly
- ✅ Format compliant
- ✅ Auto-generation working

---

#### Task 3.10.3: Session Management

**Priority:** High  
**Estimated Time:** 2 days  
**Dependencies:** None

**Subtasks:**

- [ ] Implement auto-logout (inactivity)
- [ ] Implement concurrent login control
- [ ] Add session timeout handling
- [ ] Write unit tests

**Acceptance Criteria:**

- ✅ Auto-logout working
- ✅ Concurrent login control working
- ✅ Session timeout working

---

### Sprint 11: Testing & Quality Assurance (Week 11-12)

#### Task 3.11.1: Integration Testing

**Priority:** High  
**Estimated Time:** 3 days  
**Dependencies:** All previous tasks

**Subtasks:**

- [ ] Write E2E tests for Financial Module
- [ ] Write E2E tests for Night Audit
- [ ] Write E2E tests for Reports
- [ ] Test data migration
- [ ] Test performance (Night Audit < 5 min)
- [ ] Test concurrent users

**Acceptance Criteria:**

- ✅ E2E tests passing
- ✅ Performance targets met
- ✅ No data loss in migration

---

#### Task 3.11.2: Code Quality Review

**Priority:** High  
**Estimated Time:** 2 days  
**Dependencies:** All previous tasks

**Subtasks:**

- [ ] Run SonarQube analysis
- [ ] Fix code smells
- [ ] Fix security vulnerabilities
- [ ] Achieve >80% test coverage
- [ ] Fix all TypeScript errors
- [ ] Fix all ESLint warnings
- [ ] Update documentation

**Acceptance Criteria:**

- ✅ SonarQube: Security A, Reliability A, Maintainability A
- ✅ Test coverage >80%
- ✅ No TypeScript errors
- ✅ No ESLint warnings
- ✅ Documentation updated

---

## 📊 Phase 4: Advanced Features (Future - 6-8 weeks)

### Sprint 12-15: Advanced Features

- Rate Derivation
- Allotment & Blocks
- Housekeeping Inspection
- Hardware Bridge (POC)
- PWA Setup
- LINE Integration
- Inventory & Cost Control
- Staff Commission System

---

## 🎯 Quality Control Checklist

### Before Committing Code

- [ ] TypeScript: No errors, strict mode
- [ ] ESLint: No errors, no warnings
- [ ] Prettier: Code formatted
- [ ] Tests: All passing
- [ ] Coverage: >80% for new code
- [ ] No `any` types
- [ ] No `console.log` in production code
- [ ] Error handling implemented
- [ ] Input validation implemented

### Before Merging PR

- [ ] Code review approved
- [ ] All tests passing
- [ ] Coverage maintained
- [ ] Documentation updated
- [ ] Migration tested
- [ ] Performance acceptable
- [ ] Security review passed

### Before Release

- [ ] All Phase tasks completed
- [ ] E2E tests passing
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Documentation complete
- [ ] User acceptance testing passed

---

## 📈 Success Metrics

### Technical Metrics

- **Test Coverage:** >80%
- **TypeScript Errors:** 0
- **ESLint Warnings:** 0
- **Lighthouse Score:** 100/100
- **Night Audit Time:** <5 minutes
- **Report Generation:** <10 seconds

### Business Metrics

- **USALI Compliance:** 100%
- **PDPA Compliance:** 100%
- **PCI-DSS Ready:** Yes
- **Tax Invoice Accuracy:** 100%

---

## 📝 Notes

- **Sprint Duration:** 1 week per sprint
- **Daily Standup:** Track progress daily
- **Code Review:** Required for all PRs
- **Documentation:** Update as you code
- **Testing:** Write tests alongside code

---

**Last Updated:** 2026-03-18  
**Status:** ✅ Phase 3 (WP1–WP5) complete — Phase 4 is current
