# PURA PMS - Improvement Checklist

## สรุปการปรับปรุงทั้งหมดจาก PRD เดิม

เอกสารนี้เป็น Checklist สำหรับการปรับปรุงและเพิ่มเติมฟีเจอร์ต่างๆ ตาม PRD Enhancements

---

## 📋 Architecture & Infrastructure

### Web App + Hybrid Solution

- [ ] **PWA Setup** (Progressive Web App)
  - [ ] Configure Next.js for PWA
  - [ ] Service Worker setup
  - [ ] Offline-first capability
  - [ ] Background sync
  - [ ] Install prompt

- [ ] **Local Device Agent (Bridge)**
  - [ ] Choose tech stack (Electron or Go)
  - [ ] Design local HTTP API
  - [ ] Printer integration
  - [ ] Key Card Encoder integration (VingCard, Salto, Hafele)
  - [ ] Passport Scanner (OCR) integration
  - [ ] Smart Card Reader integration

---

## 💰 Financial Module Enhancements

### Database Schema

- [ ] **TransactionCode Model**
  - [ ] Create model
  - [ ] Seed default transaction codes
  - [ ] GL Account mapping
  - [ ] Tax/Service Charge logic

- [ ] **FolioWindow Model**
  - [ ] Create model
  - [ ] Migration from existing Folio
  - [ ] Default Window 1 for existing folios

- [ ] **FolioTransaction Model** (Enhanced)
  - [ ] Replace existing Transaction model
  - [ ] Add businessDate field
  - [ ] Add amountNet, amountService, amountTax
  - [ ] Add sign field
  - [ ] Add reasonCodeId
  - [ ] Add relatedTrxId for void linkage
  - [ ] Migration script

- [ ] **ReasonCode Model**
  - [ ] Create model
  - [ ] Seed default reason codes
  - [ ] Validation in transaction service

- [ ] **RoutingInstruction Model**
  - [ ] Create model
  - [ ] UI for managing routing rules

- [ ] **Deposit Model**
  - [ ] Create model
  - [ ] Deposit management UI
  - [ ] Transfer to Folio on check-in

- [ ] **ExchangeRate Model**
  - [ ] Create model
  - [ ] Daily rate update mechanism
  - [ ] Multi-currency support in UI

- [ ] **TaxInvoice Model**
  - [ ] Create model
  - [ ] Running number generation
  - [ ] e-Tax Invoice integration
  - [ ] QR Code generation

- [ ] **FixedCharge Model**
  - [ ] Create model
  - [ ] Auto-posting in Night Audit

### Folio Enhancements

- [ ] Update Folio model:
  - [ ] Add `status` field (FolioStatus enum)
  - [ ] Add `businessDate` field
  - [ ] Add `closedAt`, `closedBy` fields
  - [ ] Add `windows` relation

### Reservation Enhancements

- [ ] Add relations:
  - [ ] `fixedCharges` relation
  - [ ] `deposits` relation
  - [ ] `taxInvoices` relation

---

## 🏨 Front Office Enhancements

### Rate Management

- [ ] **Rate Derivation (Parent/Child Rates)**
  - [ ] Add parentRateId to Rate model
  - [ ] Formula engine (e.g., "Rate B = Rate A - 10%")
  - [ ] Auto-update when parent rate changes
  - [ ] UI for managing rate relationships

- [ ] **Rate Packages**
  - [ ] Package model (includes breakfast, spa, etc.)
  - [ ] Package pricing logic
  - [ ] Package selection in reservation

### Allotment & Blocks

- [ ] **Allotment Model**
  - [ ] Create Allotment model
  - [ ] Agent/OTA quota management
  - [ ] Cut-off date tracking
  - [ ] Pickup reports

- [ ] **Block Management**
  - [ ] Block model for group bookings
  - [ ] Block allocation UI
  - [ ] Block release logic

### Guest Management

- [ ] **Share-with / Accompanying Guest**
  - [ ] AccompanyingGuest model
  - [ ] Separate profile per guest
  - [ ] Separate billing option

---

## 🧹 Housekeeping Enhancements

- [ ] **Inspection Workflow**
  - [ ] Add `INSPECTED` status to RoomStatus enum
  - [ ] Workflow: Dirty → Clean → Inspected → Ready
  - [ ] Inspection checklist model
  - [ ] Photo evidence (optional)
  - [ ] Supervisor approval UI

- [ ] **Out of Order vs. Out of Service**
  - [ ] Already have OUT_OF_ORDER and OUT_OF_SERVICE in enum ✅
  - [ ] Add maintenance tracking:
    - [ ] Maintenance start date
    - [ ] Expected completion date
    - [ ] Maintenance notes
  - [ ] Occupancy calculation logic (OOO affects, OOS doesn't)

---

## 💳 Payment & Billing Enhancements

- [ ] **Currency Exchange**
  - [ ] ExchangeRate model ✅ (in schema)
  - [ ] Daily rate update UI
  - [ ] Multi-currency payment processing
  - [ ] Receipt with exchange rate display

- [ ] **Deposit Management**
  - [ ] Deposit model ✅ (in schema)
  - [ ] Deposit collection UI
  - [ ] Deposit transfer to Folio on check-in
  - [ ] Deposit refund logic

- [ ] **Tax Invoice**
  - [ ] TaxInvoice model ✅ (in schema)
  - [ ] Invoice number generation (running number)
  - [ ] e-Tax Invoice integration
  - [ ] QR Code generation
  - [ ] PDF generation with Thai font support

---

## 🔧 System & Security Enhancements

- [ ] **Hardware Bridge**
  - [ ] Local Agent application
  - [ ] Printer API
  - [ ] Key Card Encoder API
  - [ ] Passport Scanner API
  - [ ] Smart Card Reader API

- [ ] **Reason Codes**
  - [ ] ReasonCode model ✅ (in schema)
  - [ ] Validation in transaction service
  - [ ] Required for void/adjustment operations
  - [ ] UI for selecting reason codes

- [ ] **Enhanced Audit Trail**
  - [ ] Sequence tracking for folio edits
  - [ ] IP Address, User Agent logging ✅ (already in AuditLog)
  - [ ] Reason code requirement
  - [ ] Immutable transaction records

---

## 🌐 Internationalization (i18n)

- [ ] **i18n Foundation**
  - [ ] Install next-intl
  - [ ] Configure next-intl for App Router
  - [ ] Create message files (en.json, th.json)
  - [ ] Remove all hardcoded text

- [ ] **Thai Translation**
  - [ ] Critical pages:
    - [ ] Registration Card
    - [ ] Tax Invoice
    - [ ] Receipt
    - [ ] Folio
  - [ ] Housekeeping app (100% Thai)
  - [ ] Error messages
  - [ ] Form labels

- [ ] **Thai Font Support**
  - [ ] Google Fonts: Prompt or Sarabun
  - [ ] PDF generation with Thai font
  - [ ] Ensure proper rendering (สระไม่ลอย, วรรณยุกต์ไม่จม)

- [ ] **Thai Search**
  - [ ] Guest name search in Thai
  - [ ] Full-text search configuration
  - [ ] Unicode normalization

---

## 📊 Performance & Architecture

- [ ] **Database Scaling**
  - [ ] Read Replica setup for reports
  - [ ] Raw SQL for complex financial queries
  - [ ] TimescaleDB for audit logs (optional)

- [ ] **Queue System**
  - [ ] Redis setup
  - [ ] BullMQ integration
  - [ ] Night Audit queue job
  - [ ] Notification when audit completes

- [ ] **Caching Strategy**
  - [ ] Redis cache for frequently accessed data
  - [ ] Cache invalidation strategy
  - [ ] Dashboard data caching

---

## 📈 USALI Compliance

- [ ] **Chart of Accounts**
  - [ ] USALI-compliant account structure
  - [ ] Department codes
  - [ ] Market segment codes

- [ ] **Reports**
  - [ ] P&L Statement (USALI format)
  - [ ] Departmental Reports
  - [ ] Market Segment Reports
  - [ ] RevPAR, ADR calculations

---

## 🔌 Integration Priority Updates

- [ ] **Key Card System** (Priority: High)
  - [ ] VingCard integration
  - [ ] Salto integration
  - [ ] Hafele integration
  - [ ] Local Bridge API

- [ ] **e-Tax Invoice** (Priority: High)
  - [ ] กรมสรรพากร API integration
  - [ ] QR Code generation
  - [ ] Invoice submission

- [ ] **Channel Manager** (Priority: High)
  - [ ] OTA connectivity
  - [ ] Real-time availability sync
  - [ ] Rate sync

---

## 📊 Reports System (Comanche-Level Completeness)

### Financial & Tax Reports

- [ ] **Daily Revenue Report (DRR)**
  - [ ] Room Revenue breakdown
  - [ ] F&B Revenue breakdown
  - [ ] Service Charge & VAT calculation
  - [ ] Comparison columns (Today/MTD/YTD/Budget/Last Year)
  - [ ] PDF & Excel export

- [ ] **Trial Balance**
  - [ ] Interactive Drill-down capability
  - [ ] Date range selection
  - [ ] Multi-property support
  - [ ] Budget comparison

- [ ] **Profit & Loss Statement (P&L)**
  - [ ] USALI-compliant format
  - [ ] Departmental P&L
  - [ ] Market Segment P&L
  - [ ] Comparison columns

- [ ] **Tax Invoice Control Report**
  - [ ] Running number tracking
  - [ ] Void invoice tracking
  - [ ] e-Tax Invoice integration
  - [ ] Export for Revenue Department

- [ ] **Cashier Report & Shift Closure**
  - [ ] Payment method breakdown
  - [ ] Cash variance calculation
  - [ ] Paid-out tracking
  - [ ] Manager approval

- [ ] **Rebate & Allowance Report**
  - [ ] Reason code tracking
  - [ ] Manager approval tracking
  - [ ] Audit trail

- [ ] **Deposit Ledger**
  - [ ] Pending deposits
  - [ ] Transferred deposits
  - [ ] Refunded deposits

- [ ] **Guest Ledger Balance**
  - [ ] In-house guest balances
  - [ ] Credit limit tracking
  - [ ] Over-limit alerts

### Front Office Audit Reports

- [ ] **Rate Variance Report**
  - [ ] Rack rate vs Sold rate
  - [ ] Variance alerts (>20%)
  - [ ] Manager approval tracking

- [ ] **High Balance Report**
  - [ ] Over credit limit alerts
  - [ ] Payment method tracking
  - [ ] Auto-alert to Front Desk

- [ ] **Room Change Report**
  - [ ] Rate difference tracking
  - [ ] Audit points (rate reduction)
  - [ ] Change frequency tracking

- [ ] **No-Show & Cancellation Report**
  - [ ] Forfeit deposit tracking
  - [ ] Waive penalty tracking
  - [ ] Revenue impact

- [ ] **Complimentary & House Use Report**
  - [ ] Authority tracking
  - [ ] Purpose tracking
  - [ ] Revenue lost calculation

- [ ] **Police Report (TM.30)**
  - [ ] Auto-generation
  - [ ] Format compliance
  - [ ] Auto-upload (if API available)

### F&B & Breakfast Reports

- [ ] **Expected Arrival List (ABF)**
  - [ ] Adult/Child breakdown
  - [ ] Meal plan tracking
  - [ ] Special requests

- [ ] **Daily ABF Report**
  - [ ] Cashier signature
  - [ ] Cross-check with Front
  - [ ] Revenue allocation

- [ ] **Meal Plan Reconciliation**
  - [ ] Revenue split (Room vs F&B)
  - [ ] Department allocation

### Accounts Receivable Reports

- [ ] **Aging Report**
  - [ ] Current/30/60/90/120+ days
  - [ ] Auto-email reminders
  - [ ] Collection tracking

- [ ] **Debit Note / Statement Transfer**
  - [ ] Multi-folio combination
  - [ ] PDF generation
  - [ ] Email to company

### Management & Statistics

- [ ] **Daily Flash Report**
  - [ ] Today/MTD/YTD comparison
  - [ ] Forecast (Month End Projection)
  - [ ] Auto-email (before 9 AM)

- [ ] **Nationality & Geographic Report**
  - [ ] Top 10 nationalities
  - [ ] Room nights & revenue
  - [ ] Visualization (charts)

- [ ] **Market Segment Analysis**
  - [ ] FIT/Corporate/Government/Group/MICE
  - [ ] Revenue breakdown
  - [ ] ADR by segment

- [ ] **Source of Business Report**
  - [ ] Booking channel breakdown
  - [ ] Commission tracking
  - [ ] Net revenue calculation

- [ ] **Budget vs Actual Report**
  - [ ] Daily/Monthly/Yearly
  - [ ] Variance calculation
  - [ ] Drill-down capability

### Operational Reports

- [ ] **Occupancy Forecast**
  - [ ] 3-Day/7-Day/30-Day/12-Month
  - [ ] On the Books vs Pick-up

- [ ] **Revenue Pace Report**
  - [ ] This Year vs Last Year
  - [ ] Booking pickup analysis

- [ ] **Out of Order/Service Analysis**
  - [ ] Reason tracking
  - [ ] Revenue impact
  - [ ] Most common reasons

### Report Infrastructure

- [ ] **Report Generator Engine**
  - [ ] SQL Views for complex reports
  - [ ] Materialized Views for performance
  - [ ] Caching strategy

- [ ] **Output Formats**
  - [ ] PDF (for signing/official use)
  - [ ] Excel (raw data for analysis)
  - [ ] Dashboard (interactive view)

- [ ] **Delivery Methods**
  - [ ] Auto-email (scheduled)
  - [ ] Direct print
  - [ ] Manual download

- [ ] **Access Control**
  - [ ] Role-based access
  - [ ] Audit log (who viewed/downloaded)

---

## 🔒 Security & Legal Compliance

### Thai Legal Compliance

- [ ] **PDPA (พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล)**
  - [ ] Consent Management (Marketing, Third-party, Data Retention)
  - [ ] Data Anonymization (Right to be Forgotten)
  - [ ] Data Breach Notification
  - [ ] Privacy Policy (Thai + English)

- [ ] **Computer Crime Act**
  - [ ] Traffic Log Retention (90 days)
  - [ ] Identifiable Logs (no shared accounts)
  - [ ] Auto-cleanup after 90 days

- [ ] **Hotel Act & Immigration**
  - [ ] ร.ร. 3/4 Report (Guest Registration)
  - [ ] TM.30 Auto-generation
  - [ ] Auto-upload to ตม. (if API available)

### System Security

- [ ] **Session Management**
  - [ ] Auto-logout (5-10 minutes inactivity)
  - [ ] Concurrent login control (1 user = 1 session)
  - [ ] Session timeout handling

- [ ] **OWASP Top 10 Protection**
  - [ ] SQL Injection (Prisma ORM) ✅
  - [ ] XSS Prevention (Input sanitization)
  - [ ] CSRF Protection
  - [ ] Security headers

- [ ] **API Security**
  - [ ] Rate limiting
  - [ ] JWT with Refresh Token
  - [ ] Short-lived Access Token (15 min)
  - [ ] API key management

### Financial Data Security

- [ ] **PCI-DSS Compliance**
  - [ ] Tokenization (no card storage)
  - [ ] Payment Gateway integration (Omise/Stripe/2C2P)
  - [ ] Card number masking (XXXX-XXXX-XXXX-1234)
  - [ ] PCI-DSS audit preparation

- [ ] **Immutable Ledger**
  - [ ] Lock transactions after Night Audit
  - [ ] Reverse Entry (not Update)
  - [ ] Audit trail for all changes

### Data Integrity & Backup

- [ ] **3-2-1 Backup Strategy**
  - [ ] 3 copies of data
  - [ ] 2 different media types
  - [ ] 1 off-site backup

- [ ] **Point-in-Time Recovery (PITR)**
  - [ ] PostgreSQL WAL archiving
  - [ ] Restore to specific time
  - [ ] Test restore procedure

- [ ] **Automated Backup Schedule**
  - [ ] Hourly: Transaction log
  - [ ] Daily: Full database
  - [ ] Weekly: Full + Archive
  - [ ] Monthly: Long-term archive
  - [ ] Retention policy (7 years)

### Additional Security Features

- [ ] **Web Application Firewall (WAF)**
  - [ ] Cloudflare or AWS WAF
  - [ ] DDoS protection
  - [ ] SQL Injection prevention
  - [ ] XSS prevention

- [ ] **Two-Factor Authentication (2FA)**
  - [ ] TOTP (Time-based One-Time Password)
  - [ ] Required for high-role users (Admin, GM, Accounting)
  - [ ] Backup codes

- [ ] **Sensitive Data Masking**
  - [ ] Card numbers (XXXX-XXXX-XXXX-1234)
  - [ ] Phone numbers
  - [ ] Email addresses

- [ ] **Void Log (Soft Delete)**
  - [ ] No hard delete from database
  - [ ] Soft delete with audit trail
  - [ ] Recovery capability

---

## 📝 Documentation

- [ ] **API Documentation**
  - [ ] Swagger/OpenAPI updates
  - [ ] Financial module endpoints
  - [ ] Hardware Bridge API docs

- [ ] **User Guides**
  - [ ] Night Audit procedure
  - [ ] Folio window management
  - [ ] Reason code usage
  - [ ] Tax invoice generation

- [ ] **Developer Docs**
  - [ ] Database schema documentation
  - [ ] Financial module architecture
  - [ ] i18n implementation guide

---

## 🧪 Testing

- [ ] **Unit Tests**
  - [ ] Financial module services
  - [ ] Transaction code logic
  - [ ] Folio window calculations
  - [ ] Tax/Service charge calculations

- [ ] **Integration Tests**
  - [ ] Night Audit workflow
  - [ ] Folio routing
  - [ ] Deposit transfer
  - [ ] Tax invoice generation

- [ ] **E2E Tests**
  - [ ] Complete check-in/check-out flow
  - [ ] Night Audit process
  - [ ] Multi-currency payment
  - [ ] Hardware Bridge communication

---

## 🚀 Deployment

- [ ] **Migration Scripts**
  - [ ] Database migration for new models
  - [ ] Data migration from old Transaction to FolioTransaction
  - [ ] Default TransactionCode seeding
  - [ ] Default ReasonCode seeding

- [ ] **Environment Configuration**
  - [ ] PWA configuration
  - [ ] Redis configuration
  - [ ] Hardware Bridge endpoints
  - [ ] e-Tax Invoice credentials

---

## 📊 Success Metrics

- [ ] **Performance**
  - [ ] Night Audit: < 5 minutes
  - [ ] Check-in: < 2 minutes
  - [ ] Report generation: < 10 seconds

- [ ] **Quality**
  - [ ] Lighthouse: 100/100 all categories
  - [ ] Test coverage: > 80%
  - [ ] i18n coverage: 80% (critical pages)

- [ ] **Compliance**
  - [ ] USALI compliance: 100%
  - [ ] e-Tax Invoice: 100% accuracy
  - [ ] Audit trail: Complete

---

## 📅 Priority Order

### Phase 1: Critical (Next Sprint)

1. **Financial Module Schema**
   - TransactionCode
   - FolioWindow
   - FolioTransaction
   - ReasonCode
   - Budget Model

2. **Core Reports (Minimum Viable)**
   - Daily Revenue Report (DRR)
   - Trial Balance (Basic)
   - Daily Flash Report
   - Tax Invoice Control

3. **Security Foundation**
   - PDPA Consent Management
   - Session Management
   - PCI-DSS Tokenization Setup
   - Audit Logging

4. **i18n Foundation**
   - next-intl setup
   - Message files
   - Remove hardcoded text

### Phase 2: High Priority

1. **Reports (Complete)**
   - P&L Statement (USALI)
   - Cashier Report
   - Rate Variance Report
   - High Balance Report
   - ABF Reports
   - Police Report (TM.30)

2. **Security & Compliance**
   - TM.30 Auto-generation
   - Immutable Ledger
   - 2FA for High-Role Users
   - Backup Strategy

3. **Night Audit Queue System**
4. **Hardware Bridge (POC)**
5. **Deposit Management**
6. **Currency Exchange**

### Phase 3: Medium Priority

1. **Advanced Reports**
   - Interactive Drill-down
   - Market Segment Analysis
   - Forecast Reports
   - Revenue Pace Report

2. **Rate Derivation**
3. **Allotment & Blocks**
4. **Housekeeping Inspection**
5. **PWA Setup**

### Phase 4: Advanced Features

1. Revenue Management System (RMS Lite)
2. Engineering & Maintenance Module (CMMS)
3. Automated Payment Reconciliation
4. Guest Journey & Self-Service
5. Open API Marketplace

---

**Last Updated:** 2025-01-XX
**Status:** In Progress
