# PURA PMS - Development Roadmap

## Checklist ฟีเจอร์ทั้งหมดสำหรับ PRD v3.2 (24 Modules, 7 Phases)

เอกสารนี้เป็น Checklist สำหรับการพัฒนาฟีเจอร์ทั้งหมดตาม PRD v3.2 Enterprise Edition

---

## 📋 Architecture & Infrastructure

### Web App + Hybrid Solution

- [x] **PWA Setup** (Progressive Web App) (v1: installable + read-only offline)
  - [x] Configure Next.js for PWA (Serwist / Turbopack)
  - [x] Service Worker setup
  - [x] Offline-first capability (query persist + offline banner)
  - [ ] Background sync
  - [ ] Install prompt (custom UX; browser install works)

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

- [x] **Rate Derivation (Parent/Child Rates)**
  - [x] Add parentRateId to Rate model
  - [x] Formula engine (e.g., "Rate B = Rate A - 10%")
  - [x] Auto-update when parent rate changes
  - [x] UI for managing rate relationships

- [ ] **Rate Packages**
  - [ ] Package model (includes breakfast, spa, etc.)
  - [ ] Package pricing logic
  - [ ] Package selection in reservation

### Allotment & Blocks

- [x] **Allotment Model**
  - [x] Create Allotment model
  - [x] Agent/OTA quota management
  - [x] Cut-off date tracking
  - [x] Pickup reports

- [x] **Block Management**
  - [x] Block model for group bookings
  - [x] Block allocation UI
  - [x] Block release logic

### Guest Management

- [ ] **Share-with / Accompanying Guest**
  - [ ] AccompanyingGuest model
  - [ ] Separate profile per guest
  - [ ] Separate billing option

### Edge Cases (Enterprise)

- [x] **Day-use Reservations**
  - [x] Day-use flag on reservation
  - [x] Separate rate structure
  - [x] Skip Night Audit posting for day-use

- [x] **Split Stay**
  - [x] Multiple room types within single reservation
  - [ ] Automatic room move at split point

- [ ] **No-show & Late Cancellation**
  - [ ] CancellationPolicy model
  - [ ] Link rate codes to cancellation policies
  - [x] Auto-post no-show charge during Night Audit
  - [ ] Late cancellation fee calculation

- [x] **Room Move Mid-stay**
  - [x] RoomMove model
  - [x] Auto-transfer folio to new room
  - [x] Re-issue key card trigger
  - [x] Update housekeeping status (old → Dirty, new → Occupied)

- [x] **VIP Room Pre-assignment**
  - [x] Lock room for VIP, prevent auto-reassignment

- [x] **Complimentary / House Use Rooms**
  - [x] Rate code type: COMP / HOUSE
  - [x] Count occupancy but not revenue
  - [x] Authority tracking

- [ ] **Post-departure Charges**
  - [ ] Reopen folio after checkout
  - [ ] Post to city ledger if no card auth

- [x] **Extended Stay Billing**
  - [x] Weekly/monthly billing cycles
  - [x] Auto-generate interim folio

- [x] **Tax Exemption**
  - [x] Flag reservation for VAT exemption
  - [x] Store exemption documents

- [x] **Overbooking Recovery (Walk)**
  - [x] Partner hotel list
  - [x] Walk cost tracking & compensation

---

## 🧹 Housekeeping Enhancements

- [x] **Inspection Workflow**
  - [x] Track inspection on `Room.hkStage` (not `RoomStatus`)
  - [x] Workflow: Dirty → Clean → Inspected → Ready
  - [x] Inspection checklist model
  - [ ] Photo evidence (optional)
  - [x] Supervisor approval UI

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

- [ ] **Credit Card Pre-authorization**
  - [ ] CardAuthorization model
  - [ ] Pre-auth at check-in (hold, not charge)
  - [ ] Incremental authorization for extended stays
  - [ ] Release hold at checkout

- [ ] **Credit Limit Alerts**
  - [ ] Auto-notify when folio exceeds threshold
  - [ ] Force settlement workflow

- [ ] **Rebate vs. Void**
  - [ ] Separate rebate workflow (partial refund)
  - [ ] Distinct from full void

- [ ] **Package Revenue Breakdown**
  - [ ] Split inclusive rate per USALI
  - [ ] Room → 4000-01, F&B → 4000-02

- [ ] **Refund Processing**
  - [ ] Full/partial refund with approval workflow

---

## 🔧 System & Security Enhancements

- [x] **Hardware Bridge** (v1: localhost agent + cloud job log; vendor SDKs wait)
  - [x] Local Agent application (`apps/hardware-bridge`, mock adapters)
  - [x] Printer API
  - [x] Key Card Encoder API
  - [x] Passport Scanner API
  - [x] Smart Card Reader API

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

- [x] **Complimentary & House Use Report**
  - [x] Authority tracking
  - [x] Purpose tracking
  - [x] Revenue lost calculation

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

## 🔒 Compliance & New Modules

### TM30 Immigration Reporting (Module 4.19)

- [ ] TM30Report model
- [ ] Auto-extract passport data from scan/OCR
- [ ] Auto-generate TM30 form
- [ ] Track submission status (Pending/Submitted/Confirmed)
- [ ] Batch submission
- [ ] Alert for overdue submissions

### Lost & Found Management (Module 4.20)

- [x] LostFoundItem model — shipped (manual v1)
- [ ] Item registration with photo evidence — deferred (no object storage)
- [x] Claim / return / dispose workflow — shipped (no guest notification)
- [x] Disposition tracking (returned, disposed) — donated deferred

### Guest Communication Hub (Module 4.21)

- [x] GuestMessage model — shipped (in-app v1)
- [x] In-app messaging (guest ↔ staff) — staff inbox; inbound staff-logged
- [ ] Automated pre-arrival messages — deferred
- [x] Post-stay satisfaction survey — **shipped (manual v1)** (`GuestFeedback` score 1–5; staff `/feedback`)
- [ ] Push notifications — deferred

### Post-stay Feedback (Module 4.21 follow-on)

- [x] GuestFeedback model — shipped (manual v1)
- [x] Score 1–5 + optional comment — staff-recorded
- [x] Review workflow (OPEN → REVIEWED) — shipped
- [ ] Auto email survey after checkout — deferred
- [ ] OTA review sync — deferred

### Central Reservation System (Module 4.22)

- [ ] Cross-property availability search
- [ ] Central rate management
- [ ] Guest profile sharing across properties
- [ ] Loyalty program

### Yield Management (Module 4.23)

- [x] Demand forecasting (historical data) — on-books occupancy over the next 14 days
- [x] Competitor rate monitoring — manual capture
- [x] Automated rate recommendations — rule-based (not ML)
- [x] Pace analysis with alerts

### Self-Service Portal (Module 4.24)

- [x] Kiosk check-in (lobby mock v1)
- [ ] Mobile check-in
- [ ] Guest web portal (view folio, request services)
- [ ] Digital key (BLE/NFC)

### Digital Registration Card

- [ ] Tablet signature capture
- [ ] Digital storage with legal compliance

### Wake-up Call System

- [ ] Manual or PBX integration
- [ ] Track delivery confirmation

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

## 📅 Priority Order (Aligned with PRD v3.2)

### Phase 3: Financial & Audit (Complete ✅)

Closeout P3-PR1–12 shipped. **Wait items:** AP, RD e-Tax, card gateway, P&L/bank rec, cashier PDF/email, delete legacy `Transaction`.

1. Enhanced Folio System (Windows, Routing, Post-departure, Rebate)
2. Transaction Codes (Mapping to GL)
3. Reason Codes (Audit Trail)
4. Night Audit System (Enhanced with Queue)
5. Shift Management (Enhanced)
6. GL journals + Trial Balance + AR (USALI). AP still wait.
7. Tax Invoice (internal number; e-Tax still wait)
8. Currency Exchange
9. Credit Card Pre-authorization (manual ledger; no gateway)
10. Package Revenue Breakdown (USALI split)
11. Credit Limit Alerts & Auto-settlement

### Phase 4: Operations Edge Cases — **complete**

1. Day-use Reservations — **shipped**
2. Split Stay — **shipped**
3. Room Move Mid-stay — **shipped**
4. No-show / Late Cancellation Auto-charges — **shipped**
5. Post-departure Charges — **shipped** (reopen closed folio; settle via existing card-preauth capture or AR transfer)
6. Overbooking Recovery (Walk) — **shipped** (`PartnerHotel` directory, `Walk` record, no AP posting)
7. Complimentary / House Use Rooms — **shipped** (`StayPurpose` COMP/HOUSE, rate 0, Night Audit skip, authority tracking)
8. Extended Stay Billing (weekly/monthly) — **shipped** (`BillingCycle`, cycle-end NA posting, interim folio + archive)
9. Tax Exemption Handling — **shipped** (`taxExempt` + document fields; folio posting skips VAT)
10. VIP Room Pre-assignment & Lock — **shipped** (`isRoomLocked` + note; blocks room change/move; split-stay incompatible)

### Phase 5: Advanced Features

1. Rate Derivation (Parent/Child Rates) — **shipped** (`parentRateId` + percent/amount offset; cascade on parent change)
2. Dynamic Pricing / Yield Management (AI) — **shipped (rule-based v1)** (pace vs last year, competitor capture, HIGH_DEMAND / SLOW_PACE / COMP_UNDERCUT; apply updates parent Rate)
3. Allotment & Blocks — **shipped** (`RoomBlock` allotment/group, cutoff release, pickup report)
4. Housekeeping Inspection (Workflow) — **shipped** (`Room.hkStage` Dirty→Clean→Ready, supervisor checklist; Inspected is the inspection record)
5. Hardware Bridge (Local Agent) — **shipped (mock v1)** (localhost agent + `HardwareJob` audit; vendor SDKs wait)
6. PWA (Offline Capability) — **shipped (read-only v1)** (Serwist SW, manifest, query persist; mutations blocked offline)
7. Digital Registration Card (Tablet Signature) — **shipped** (`RegistrationCard` DRAFT→SIGNED→VOID; tablet sign + print)
8. Wake-up Call System — **shipped (manual v1)** (`WakeUpCall` board; complete/miss/cancel; no PBX)
9. DND/MUR Status Indicators — **shipped** (`Room.guestRequest` NONE|DND|MUR; HK board; block clean while DND)

### Phase 6: Compliance & Communication — **complete**

1. **TM30 Immigration Reporting** — **shipped (manual v1)** (`Tm30Report` generate/submit/export TSV; no immigration API)
2. Lost & Found Management — **shipped (manual v1)** (`LostFoundItem` FOUND→CLAIMED→RETURNED or DISPOSED; 90-day retention; no photos)
3. Guest Communication Hub (In-app messaging) — **shipped (in-app v1)** (`GuestMessage` IN_APP only; staff `/messages`)
4. Post-stay Feedback & Review Management — **shipped (manual v1)** (`GuestFeedback` score 1–5; staff `/feedback`; no OTA/email)
5. Guest Complaints / Service Recovery — **shipped (manual v1)** (`GuestComplaint` OPEN→IN_PROGRESS→RESOLVED→CLOSED; staff `/complaints`; no folio credit)
6. Self-service Kiosk Integration — **shipped (lobby mock v1)** (`POST /kiosk/check-in`; staff `/kiosk`; no ID/payment/key)

### Phase 7: i18n & Multi-Property

1. i18n Foundation (next-intl setup) — **shipped**
2. Thai Translation (Critical Pages) — **shipped**
3. Thai Font Support (PDF Reports) — **shipped**
4. Thai Search (Guest Name Search) — **shipped**
5. Central Reservation System (Multi-property) — **shipped (PropertySwitcher UI v1)**
6. Guest Portal (View folio, request services) — **shipped**
7. Digital Key (BLE/NFC) — **shipped (mock v1)**
8. Mobile Check-in — **shipped**

---

**Last Updated:** August 2026
**Status:** Phase 1–7 complete on `dev`. Phase 3 wait items (AP, e-Tax API, card gateway) remain parked.
