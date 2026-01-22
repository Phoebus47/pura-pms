# PURA PMS - PRD Enhancements & Refinements

## Executive Summary

เอกสารนี้อธิบายการปรับปรุงและเพิ่มเติม PRD เดิม เพื่อให้ PURA PMS เป็นระบบระดับ Enterprise ที่แข่งขันได้จริงในตลาดโรงแรม 5 ดาว โดยอิงจาก:

- การวิจัยตลาด PMS ระดับโลก (Oracle Opera Cloud, Cloudbeds, Mews, Comanche)
- มาตรฐานบัญชีโรงแรมสากล (USALI - Uniform System of Accounts for the Lodging Industry)
- Best practices สำหรับ Cloud-based SaaS PMS

---

## 1. Architecture Decision: Web App vs Desktop

### คำตอบ: **Web Application (Cloud-native) + Hybrid Capability**

### 1.1 ทำไมต้องเป็น Web App?

**ข้อดี:**

- ✅ **Accessibility:** ผู้บริหารดู Dashboard จากมือถือได้, พนักงานแม่บ้านใช้ Tablet ได้
- ✅ **No On-premise Server:** ไม่ต้องติดตั้ง Server ราคาแพงที่โรงแรม
- ✅ **Instant Updates:** อัปเดตเวอร์ชันได้ทันทีโดยไม่ต้องติดตั้ง
- ✅ **Multi-device:** ใช้งานได้จากทุกอุปกรณ์ (Desktop, Tablet, Mobile)
- ✅ **Cost-effective:** ลดค่าใช้จ่าย IT Infrastructure

**ข้อจำกัด:**

- ⚠️ **Internet Dependency:** ถ้าอินเทอร์เน็ตล่ม ระบบหยุดทำงาน
- ⚠️ **Hardware Integration:** Web Browser ทั่วไปสั่งงาน Hardware แบบ Local ได้ยาก

### 1.2 Hybrid Solution: Web App + PWA + Local Bridge

#### A. Progressive Web App (PWA)

- **Offline-first capability:** Cache ข้อมูลบางส่วนให้ทำงานต่อได้ชั่วคราวแม้อินเทอร์เน็ตหลุด
- **Installable:** ติดตั้งลงเครื่องได้เหมือนแอป
- **Background Sync:** Sync ข้อมูลเมื่อกลับมาออนไลน์

#### B. Local Device Agent (Bridge)

โปรแกรมตัวเล็กๆ (Service) ติดตั้งในคอมพิวเตอร์หน้าฟรอนต์ เพื่อเป็นตัวกลางให้ Web App สั่งงาน Hardware:

- **Printer:** สั่งพิมพ์ใบเสร็จ/Registration Card โดยไม่ต้องผ่าน Browser Dialog
- **Key Card Encoder:** ออก Key Card อัตโนมัติ (VingCard, Salto, Hafele)
- **Passport Scanner (OCR):** Auto-fill Guest Profile
- **Smart Card Reader:** อ่านบัตรประชาชนไทย

**Tech Stack สำหรับ Bridge:**

- Option 1: Electron (Node.js + Chromium) - ง่าย, ใช้ JavaScript
- Option 2: Go + Local HTTP Server - เบา, เร็ว, ปลอดภัยกว่า

---

## 2. Database Schema: Financial Module (Enterprise Grade)

### 2.1 Core Concepts ที่ต้องเปลี่ยน

#### Business Date vs. System Date

- **Business Date:** วันที่ทางบัญชีโรงแรม (อาจไม่ตรงกับ System Date)
- **System Date:** วันที่จริงของระบบ
- **สำคัญ:** ธุรกรรมที่เกิดตอนตี 1 (System Time) อาจยังเป็น Business Date ของ "เมื่อวาน" ถ้ายังไม่ปิดรอบ (Night Audit)

#### Folio Windows (การแยกบิล)

- แขก 1 คน ต้องมีหลาย "กระเป๋า" (Window)
  - Window 1: ค่าห้อง (บริษัทจ่าย)
  - Window 2: ส่วนตัว (แขกจ่าย)
  - Window 3: Company Master (สำหรับ Group)

#### Immutable Transactions

- **ห้าม UPDATE ตาราง Transaction เด็ดขาด**
- ถ้าผิดต้องสร้าง Transaction ใหม่มาหักล้าง (Correction/Void)
- เก็บ Audit Trail ครบถ้วน

### 2.2 Enhanced Financial Schema

```prisma
// ==================== TRANSACTION CODES ====================
// ผังบัญชีฝั่ง PMS - เชื่อมโยง PMS Operation เข้ากับ GL Account
model TransactionCode {
  id            String   @id @default(cuid())
  code          String   @unique // e.g., "1000" (Room Charge), "9000" (Cash)
  description   String
  descriptionTh String? // ภาษาไทย
  type          TrxType  // CHARGE, PAYMENT, ADJUSTMENT
  group         TrxGroup // ROOM, FOOD, BEVERAGE, SPA, MISC, TAX, SERVICE

  // Tax & Service Charge Logic
  hasTax        Boolean  @default(true)
  hasService    Boolean  @default(true)
  taxId         String?  // Link to Tax configuration
  serviceRate   Decimal? @default(10.00) @db.Decimal(5, 2) // Service Charge %

  // Mapping to GL (สำคัญสำหรับ Export บัญชี)
  glAccountCode String   // e.g., "4000-01" (Revenue-Room)
  departmentCode String? // สำหรับ USALI

  transactions  FolioTransaction[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum TrxType {
  CHARGE
  PAYMENT
  ADJUSTMENT
  TRANSFER
  DEPOSIT
  REFUND
}

enum TrxGroup {
  ROOM
  FOOD
  BEVERAGE
  SPA
  FITNESS
  LAUNDRY
  TELEPHONE
  INTERNET
  MINIBAR
  PARKING
  MISC
  TAX
  SERVICE
  DISCOUNT
}

// ==================== FOLIO ENHANCEMENT ====================
model Folio {
  id            String        @id @default(cuid())
  folioNumber   String        @unique
  reservationId String?
  reservation   Reservation?  @relation(fields: [reservationId], references: [id])
  type          FolioType     @default(GUEST)
  status        FolioStatus   @default(OPEN)

  // Balance caching (เพื่อความเร็ว Dashboard)
  balance       Decimal       @default(0.00) @db.Decimal(12, 2)

  // Business Date tracking
  businessDate  DateTime      @db.Date

  windows       FolioWindow[]
  transactions  FolioTransaction[]
  createdAt     DateTime      @default(now())
  closedAt      DateTime?
  closedBy      String?
}

enum FolioStatus {
  OPEN
  CLOSED
  POSTED_TO_CITY_LEDGER
  TRANSFERRED
}

// ==================== FOLIO WINDOW (การแยกบิล) ====================
model FolioWindow {
  id           String             @id @default(cuid())
  folioId      String
  folio        Folio              @relation(fields: [folioId], references: [id], onDelete: Cascade)
  windowNumber Int                // 1, 2, 3, 4
  description  String?            // e.g. "Personal Expenses", "Company Charges"
  balance      Decimal            @default(0.00) @db.Decimal(12, 2)
  transactions FolioTransaction[]
  createdAt    DateTime           @default(now())
  @@unique([folioId, windowNumber])
}

// ==================== FOLIO TRANSACTION (ตารางที่ใหญ่และสำคัญที่สุด) ====================
// เก็บทุกความเคลื่อนไหวทางการเงิน ห้ามลบ ห้ามแก้!
model FolioTransaction {
  id            String   @id @default(cuid())
  windowId      String
  window        FolioWindow @relation(fields: [windowId], references: [id])
  trxCodeId     String
  trxCode       TransactionCode @relation(fields: [trxCodeId], references: [id])

  // Dates are Critical
  businessDate  DateTime @db.Date // วันที่ทางบัญชีโรงแรม
  createdAt     DateTime @default(now()) // วันที่บันทึกจริง (System timestamp)

  // Money (ต้องเก็บละเอียด แยก Vat/Service)
  amountNet     Decimal  @db.Decimal(12, 2) // ราคาก่อนภาษี/Service
  amountService Decimal  @default(0) @db.Decimal(12, 2) // Service Charge 10%
  amountTax     Decimal  @default(0) @db.Decimal(12, 2) // VAT 7%
  amountTotal   Decimal  @db.Decimal(12, 2) // Net + Svc + Tax

  // Sign (Charge = +, Payment = -)
  sign          Int      // 1 or -1

  // Reference & Audit
  reference     String?  // e.g., "Room 101", "Check #1234", "POS-001"
  remark        String?
  userId        String   // ใครเป็นคนทำรายการ
  shiftId       String?  // ทำในกะไหน
  nightAuditId  String?  // ถูกปิดรอบไปหรือยัง (ถ้ามีค่า = ห้ามแตะต้องแล้ว)

  // Reason Code (บังคับสำหรับ Void/Adjustment)
  reasonCodeId  String?
  reasonCode    ReasonCode? @relation(fields: [reasonCodeId], references: [id])

  // Correction linkage
  relatedTrxId  String?  // ถ้าเป็นการ Void, Link กลับไปที่รายการเดิม
  isVoid        Boolean  @default(false)
  voidedAt      DateTime?
  voidedBy      String?

  // Indexes for performance
  @@index([businessDate])
  @@index([windowId, businessDate])
  @@index([nightAuditId])
  @@index([trxCodeId])
}

// ==================== REASON CODES ====================
// บังคับให้ user เลือก "เหตุผล" ทุกครั้งที่มีการ Void, Discount, หรือ Move Transaction
model ReasonCode {
  id          String   @id @default(cuid())
  code        String   @unique
  description String
  descriptionTh String?
  category    ReasonCategory
  isActive    Boolean  @default(true)
  transactions FolioTransaction[]
  createdAt   DateTime @default(now())
}

enum ReasonCategory {
  VOID
  DISCOUNT
  ADJUSTMENT
  TRANSFER
  COMPLIMENTARY
  STAFF
  OTHER
}

// ==================== ROUTING INSTRUCTIONS ====================
// การโยนบิลอัตโนมัติ (เช่น "โยนค่าห้อง (Trx 1000) ไปเข้า Window 2 ของ Group Master")
model RoutingInstruction {
  id            String   @id @default(cuid())
  sourceFolioId String
  targetFolioId String
  targetWindow  Int

  trxCodes      String[] // Array of TrxCodes to route (e.g. ["1000", "2000"])
  dateFrom      DateTime @db.Date
  dateTo        DateTime @db.Date
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
}

// ==================== DEPOSIT LEDGER ====================
// เงินมัดจำที่รับมาก่อนแขกเข้าพัก (ยังไม่ถือเป็น Revenue จนกว่าจะ Check-in)
model Deposit {
  id            String   @id @default(cuid())
  reservationId String
  reservation   Reservation @relation(fields: [reservationId], references: [id])
  amount        Decimal  @db.Decimal(12, 2)
  currency      String   @default("THB")
  exchangeRate Decimal? @db.Decimal(10, 4) // ถ้าจ่ายด้วยสกุลอื่น
  method        PaymentMethod
  receivedAt    DateTime @default(now())
  receivedBy    String
  reference     String?
  notes         String?
  // เมื่อ Check-in จะโอนไปเป็น Payment ใน Folio
  transferredToFolio Boolean @default(false)
  transferredAt      DateTime?
}

// ==================== CURRENCY EXCHANGE ====================
model ExchangeRate {
  id            String   @id @default(cuid())
  baseCurrency  String   @default("THB")
  targetCurrency String
  rate          Decimal  @db.Decimal(10, 4)
  effectiveDate DateTime @db.Date
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  @@unique([baseCurrency, targetCurrency, effectiveDate])
}

// ==================== TAX INVOICE (ใบกำกับภาษีเต็มรูป) ====================
model TaxInvoice {
  id            String   @id @default(cuid())
  invoiceNumber String   @unique // Running Number ต้องเป๊ะ ห้ามข้าม
  folioId       String?
  reservationId String?
  businessDate  DateTime @db.Date

  // Taxpayer Info
  taxId         String   // เลขประจำตัวผู้เสียภาษี
  branchNumber  String? // สาขา

  // Amounts
  amountNet     Decimal  @db.Decimal(12, 2)
  amountTax     Decimal  @db.Decimal(12, 2)
  amountTotal   Decimal  @db.Decimal(12, 2)

  // e-Tax Invoice
  eTaxInvoiceId String? // ID จากกรมสรรพากร (ถ้ามี)
  qrCode        String? // QR Code สำหรับ e-Tax Invoice

  // Status
  status        InvoiceStatus @default(OPEN)
  issuedAt      DateTime?
  issuedBy      String?
  createdAt     DateTime @default(now())
}

// ==================== FIXED CHARGES (Recurring) ====================
// รายการที่จะ Post อัตโนมัติทุกคืนนอกจากค่าห้อง
model FixedCharge {
  id            String   @id @default(cuid())
  reservationId String
  reservation   Reservation @relation(fields: [reservationId], references: [id])
  trxCodeId     String
  trxCode       TransactionCode @relation(fields: [trxCodeId], references: [id])
  amount        Decimal  @db.Decimal(12, 2)
  description   String
  startDate     DateTime @db.Date
  endDate       DateTime @db.Date
  isActive      Boolean  @default(true)
  posted        Boolean  @default(false) // ถูก Post แล้วหรือยัง
  createdAt     DateTime @default(now())
}
```

### 2.3 Schema Updates Required

ต้องอัปเดต `Reservation` model เพื่อรองรับ Fixed Charges:

```prisma
model Reservation {
  // ... existing fields ...
  fixedCharges  FixedCharge[]
  deposits      Deposit[]
  taxInvoices   TaxInvoice[]
}
```

---

## 3. Functional Gaps & Enhancements

### 3.1 Front Office & Reservations

#### A. Rate Derivation (Parent/Child Rates)

**ปัจจุบัน:** มีแค่ Rate ทั่วไป

**เพิ่ม:**

- ระบบผูกสูตรราคา เช่น Rate B = Rate A - 10%
- ถ้าแก้ Rate A, Rate B เปลี่ยนตามทันที
- รองรับ Rate Packages (รวมอาหารเช้า, Spa, etc.)

#### B. Allotment & Blocks

**เพิ่ม:**

- ระบบจัดการโควตาห้องให้ Agent/OTA
- ตัดจากกองกลาง (General Inventory) หรือตัดจากโควตาเฉพาะ (Dedicated Block)
- Cut-off date tracking
- Pickup reports

#### C. Share-with / Accompanying Guest

**เพิ่ม:**

- ฟังก์ชันแขกพักหลายคนในห้องเดียว แต่ต้องการแยก Profile หรือแยกบิลกัน
- ไม่ใช่แค่ใส่ชื่อใน Remark

### 3.2 Housekeeping

#### A. Inspection Workflow

**ปัจจุบัน:** มีแค่ Clean/Dirty

**เพิ่ม:**

- สถานะ "Inspected" (ตรวจแล้ว) สำหรับ Supervisor
- Workflow: Dirty → Clean → Inspected → Ready
- Inspection checklist (รายการตรวจสอบ)
- Photo evidence (ถ้าต้องการ)

#### B. Out of Order (OOO) vs. Out of Service (OOS)

**เพิ่ม:**

- **OOO:** ห้องเสีย ขายไม่ได้ (กระทบ Occupancy %)
- **OOS:** ปิดชั่วคราว ขายได้ถ้าจำเป็น (ไม่กระทบ Occupancy %)
- Maintenance tracking (วันที่เริ่มซ่อม, วันที่คาดว่าจะเสร็จ)

### 3.3 Financial & Cashiering

#### A. Currency Exchange Module

**เพิ่ม:**

- ตารางอัตราแลกเปลี่ยนประจำวัน
- รองรับการจ่ายเงินด้วยสกุลต่างประเทศ
- พิมพ์ใบเสร็จโชว์เรทแลกเปลี่ยน

#### B. Deposit Ledger

**เพิ่ม:**

- ระบบจัดการเงินมัดจำที่รับมาก่อนแขกเข้าพัก
- ยังไม่ถือเป็น Revenue จนกว่าจะ Check-in
- ต้องลงบัญชีแยกต่างหาก

#### C. Tax Invoice (ใบกำกับภาษีเต็มรูป)

**เพิ่ม:**

- ระบบออกใบกำกับภาษีที่รองรับ e-Tax Invoice ของกรมสรรพากรไทย
- Running Number ต้องเป๊ะ ห้ามข้าม
- QR Code สำหรับ e-Tax Invoice

### 3.4 System & Security

#### A. Hardware Bridge (Local Agent)

**เพิ่ม:**

- โปรแกรมเล็กๆ (Electron/Go) เพื่อติดตั้งที่เครื่อง Front
- เชื่อมต่อกับ:
  - เครื่องอ่านบัตรประชาชน (Smart Card Reader) → Auto-fill Profile
  - เครื่องสแกน Passport (OCR)
  - Printer (สั่งพิมพ์ทันทีโดยไม่ต้องผ่าน Browser Dialog)
  - Key Card Encoder

#### B. Reason Codes

**เพิ่ม:**

- บังคับให้ user เลือก "เหตุผล" ทุกครั้งที่มีการ Void, Discount, หรือ Move Transaction
- เพื่อ Audit Trail

---

## 4. Internationalization (i18n) Strategy

### 4.1 ทำไมต้องทำ Bilingual?

#### กฎหมายและภาษี

- ใบกำกับภาษี (Tax Invoice) และ ใบเสร็จรับเงิน (Receipt) ในไทย จำเป็นต้องมีภาษาไทย
- หรือเป็น ไทย-อังกฤษ คู่กัน เพื่อความถูกต้องทางสรรพากร

#### หน้างานจริง (Operational Level)

- **Front Office (5 ดาว):** ส่วนใหญ่ใช้ English เป็นหลักได้
- **Housekeeping & Maintenance:** จำเป็นต้องมีภาษาไทย 100% เพราะระดับปฏิบัติการอาจไม่คล่องภาษาอังกฤษ

#### จุดขาย (Selling Point)

- การเป็น "Thai-based Software" ที่เข้าใจภาษาไทยและบริบทไทย คือจุดแข็ง

### 4.2 Development Strategy

#### Phase 1: Foundation (โครงสร้าง)

- **Coding:** ห้าม Hardcode Text ลงใน Code เด็ดขาด!
- ใช้ Library i18n (next-intl สำหรับ Next.js 16 App Router)
- เขียน key เช่น `{t('login.username')}` แทนคำว่า "Username"
- **Database:** ต้องเป็น UTF-8 หรือ UTF-8MB4 เพื่อรองรับชื่อแขกภาษาไทย

#### Phase 2: UI Translation (การแปลหน้าจอ)

- **Admin / Management / Setup:** English Only ไปก่อนได้
- **Front Desk:** English เป็นหลัก (แต่รองรับการพิมพ์ชื่อไทย)
- **Housekeeping / Mobile App:** ควรทำ Thai Translation ตั้งแต่แรก

### 4.3 สิ่งที่ต้อง "รองรับไทย" ทันที

#### เอกสาร (Reports & Forms)

- Registration Card (ใบลงทะเบียนผู้เข้าพัก)
- Tax Invoice / Receipt / Folio

#### ข้อมูล Input (Data Entry)

- ชื่อ-นามสกุลแขก
- ที่อยู่ (สำหรับการออกบิล)
- Remark / Note พิเศษ

#### การค้นหา (Search)

- ต้องค้นหาชื่อแขกด้วยภาษาไทยได้ ("สมชาย", "วิภาวี")

### 4.4 Technical Implementation

**Tech Stack:**

- `next-intl` (App Router compatible)
- Google Fonts: Prompt หรือ Sarabun (สำหรับภาษาไทย)

**Structure:**

```
/messages
  en.json  <-- เริ่มทำไฟล์นี้ก่อน
  th.json  <-- ค่อยมาเติมทีหลัง หรือใช้ AI ช่วยแปลได้ง่ายๆ
```

---

## 5. Architecture & Performance Enhancements

### 5.1 Database Scaling

**ปัญหา:** Prisma อาจจะช้าถ้า Query ซับซ้อนสำหรับ Night Audit และ Historical Report 7 ปี

**แนะนำ:**

- แยก Read Replica สำหรับการออก Report โดยเฉพาะ
- ใช้ Raw SQL ในส่วนที่คำนวณเงินซับซ้อน (GL/Trial Balance) เพื่อประสิทธิภาพสูงสุด
- ใช้ TimescaleDB (Optional) สำหรับเก็บ Log/Audit Trail ระยะยาว

### 5.2 Audit Trail แบบละเอียด

**ปัจจุบัน:** เก็บแค่ oldValue/newValue ใน JSON

**เพิ่ม:**

- บันทึก "Sequence" ของการแก้ไขบิล (Folio)
- บังคับให้ใส่ "Reason Code" ทุกครั้งที่มีการแก้ไข Transaction ทางการเงิน
- เก็บ IP Address, User Agent, Timestamp ครบถ้วน

### 5.3 Queue System for Night Audit

**ปัญหา:** Night Audit อาจทำให้ Web ค้างถ้า Process ใหญ่

**แนะนำ:**

- ใช้ Redis Queue (BullMQ) จัดการ Night Audit
- Process ใน Background
- แจ้งเตือนเมื่อเสร็จ

---

## 6. Tech Stack Refinements

| Component | Current PRD   | Suggested Upgrade                   | Reason                                            |
| --------- | ------------- | ----------------------------------- | ------------------------------------------------- |
| Frontend  | Next.js 16    | Next.js 16 (PWA Mode)               | รองรับการทำงาน Offline เบื้องต้น                  |
| Backend   | NestJS 11     | NestJS + Redis Queue                | ใช้ Queue (BullMQ) จัดการ Night Audit             |
| Database  | PostgreSQL    | PostgreSQL + TimescaleDB (Optional) | เก็บ Log/Audit Trail ระยะยาวได้ดีกว่า             |
| Printing  | Browser Print | Local Agent (Electron/Go)           | สั่งพิมพ์ใบเสร็จ/ออก Key Card โดยไม่ต้องกด Ctrl+P |
| Reporting | PDF Export    | Server-side PDF Gen (Puppeteer)     | สร้าง Report สวยงามระดับ Pixel-perfect            |
| i18n      | -             | next-intl                           | รองรับภาษาไทย-อังกฤษ                              |

---

## 7. Integration Priority Updates

| Integration     | Current Priority | Updated Priority | Reason                                                                     |
| --------------- | ---------------- | ---------------- | -------------------------------------------------------------------------- |
| Key Card System | Medium           | **High**         | Critical สำหรับ 5 ดาว - ต้องทำ Interface เชื่อมกับ VingCard, Salto, Hafele |
| Hardware Bridge | -                | **High**         | จำเป็นสำหรับ Printer, Passport Scanner, Smart Card Reader                  |
| e-Tax Invoice   | -                | **High**         | จำเป็นสำหรับโรงแรมในไทย                                                    |

---

## 8. USALI Compliance (Uniform System of Accounts for the Lodging Industry)

### 8.1 Chart of Accounts Structure

GL Account ต้องจัดหมวดหมู่ตามมาตรฐาน USALI:

```
4000 - REVENUE
  4000-01 - Room Revenue
  4000-02 - Food Revenue
  4000-03 - Beverage Revenue
  4000-04 - Spa Revenue
  4000-05 - Other Revenue

5000 - COST OF SALES
  5000-01 - Food Cost
  5000-02 - Beverage Cost

6000 - OPERATING EXPENSES
  6000-01 - Salaries & Wages
  6000-02 - Utilities
  6000-03 - Marketing
```

### 8.2 Reports ที่ต้องรองรับ USALI

- **P&L Statement:** ตามรูปแบบ USALI
- **Departmental Reports:** แยกตาม Department (Room, F&B, Spa, etc.)
- **Market Segment Reports:** แยกตาม Market Segment (Corporate, Leisure, Group, etc.)

---

## 9. Implementation Priority

### Phase 1: Core Foundation (Current - ✅ Done)

- [x] Project setup & architecture
- [x] Authentication & authorization
- [x] Property & room setup
- [x] Basic reservations
- [x] Guest profiles

### Phase 2: Front Office (Current - ✅ Done)

- [x] Check-in/out workflow
- [x] Folio management (Basic)
- [x] Payment processing (Basic)
- [x] Housekeeping module (Basic)
- [x] Dashboard

### Phase 3: Financial & Audit (Next - 🎯 Priority)

- [ ] **Enhanced Folio System** (Windows, Routing)
- [ ] **Transaction Codes** (Mapping to GL)
- [ ] **Reason Codes** (Audit Trail)
- [ ] **Night Audit System** (Enhanced with Queue)
- [ ] **Shift Management** (Enhanced)
- [ ] **GL/AR/AP modules** (USALI Compliant)
- [ ] **Tax Invoice** (e-Tax Invoice Ready)
- [ ] **Currency Exchange**

### Phase 4: Advanced Features

- [ ] **Rate Derivation** (Parent/Child Rates)
- [ ] **Allotment & Blocks**
- [ ] **Housekeeping Inspection** (Workflow)
- [ ] **Hardware Bridge** (Local Agent)
- [ ] **PWA** (Offline Capability)

### Phase 5: i18n & Localization

- [ ] **i18n Foundation** (next-intl setup)
- [ ] **Thai Translation** (Critical Pages)
- [ ] **Thai Font Support** (PDF Reports)
- [ ] **Thai Search** (Guest Name Search)

---

## 10. Database Migration Plan

### Step 1: Add New Models

1. TransactionCode
2. FolioWindow
3. FolioTransaction (Enhanced)
4. ReasonCode
5. RoutingInstruction
6. Deposit
7. ExchangeRate
8. TaxInvoice
9. FixedCharge

### Step 2: Migrate Existing Data

- สร้าง TransactionCode สำหรับ Transaction ที่มีอยู่
- แปลง Folio เดิมให้มี Window 1 (Default)
- Migrate Transaction เดิมไปเป็น FolioTransaction

### Step 3: Update Application Code

- อัปเดต Folio Service ให้รองรับ Windows
- อัปเดต Transaction Service ให้ใช้ TransactionCode
- เพิ่ม Reason Code validation

---

## 11. Success Metrics (Updated)

| Metric            | Target      | Notes                            |
| ----------------- | ----------- | -------------------------------- |
| Night Audit time  | < 5 minutes | ใช้ Queue System                 |
| Check-in time     | < 2 minutes | รองรับ Hardware Integration      |
| Report accuracy   | 100%        | USALI Compliant                  |
| System uptime     | 99.9%       | Cloud-based + Offline Capability |
| Lighthouse Scores | 100/100     | All categories                   |
| i18n Coverage     | 80%         | Critical pages in Thai           |

---

## 12. Next Steps

1. **Review & Approve:** ทีม Review เอกสารนี้
2. **Database Design:** Finalize Schema สำหรับ Financial Module
3. **i18n Setup:** Setup next-intl ใน Next.js
4. **Hardware Bridge POC:** สร้าง Proof of Concept สำหรับ Local Agent
5. **Migration Plan:** วางแผน Migration จาก Schema เดิมไปใหม่

---

**หมายเหตุ:** เอกสารนี้เป็น Living Document จะอัปเดตตามความคืบหน้าของโปรเจกต์
