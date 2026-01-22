# PURA PMS - Master List of Reports

## สรุปรายงานทั้งหมดที่ต้องมี (Comanche-Level Completeness)

เอกสารนี้อธิบายรายละเอียดรายงานทั้งหมดที่ PURA PMS ต้องมี เพื่อให้เทียบชั้นหรือเหนือกว่า Comanche PMS

---

## 📊 หมวดที่ 1: Financial & Tax Reports (Critical - หัวใจของ Comanche)

### 1.1 Daily Revenue Report (DRR) - รายงานสรุปรายได้ประจำวัน

**วัตถุประสงค์:** รายงานหลักสำหรับ Night Auditor และ GM ตรวจสอบยอดรายได้ประจำวัน

**Columns ที่ต้องมี:**

| Column               | Description               | Calculation                                   |
| -------------------- | ------------------------- | --------------------------------------------- |
| Room Revenue (Net)   | รายได้ค่าห้องสุทธิ        | Sum of room charges - discounts               |
| F&B Revenue          | รายได้อาหารและเครื่องดื่ม | แยกตาม Outlet (Restaurant, Bar, Room Service) |
| Other Revenue        | รายได้อื่นๆ               | Laundry, Spa, Transportation, Parking         |
| Service Charge (10%) | ค่าบริการ                 | 10% of applicable revenue                     |
| VAT (7%)             | ภาษีมูลค่าเพิ่ม           | 7% of (Revenue + Service Charge)              |
| Provincial Tax       | ภาษีท้องถิ่น              | (ถ้ามี - อบจ.)                                |
| Total Revenue        | ยอดรวมสุทธิ               | Sum of all above                              |

**Comparison Columns:**

- Today (เมื่อวาน)
- Month-to-Date (MTD)
- Year-to-Date (YTD)
- Budget (เป้าหมาย)
- Variance (ผลต่าง +/-)
- Last Year (เทียบปีที่แล้ว)
- % Change vs Last Year

**Output Formats:**

- PDF (สำหรับเซ็นชื่อ)
- Excel (Raw Data - สำหรับ Pivot Table)

---

### 1.2 Trial Balance - งบดุลทดลอง

**วัตถุประสงค์:** รายงานหลักสำหรับบัญชีและผู้สอบบัญชี ตรวจสอบความถูกต้องของบัญชี

**Features:**

- **Interactive Drill-down:** คลิกที่ Account Code เพื่อดูรายละเอียดย่อย
- **Date Range:** เลือกช่วงวันที่ได้ (Daily, Monthly, Yearly)
- **Multi-Property:** รวมยอดหลายสาขาได้ (สำหรับ Hotel Chain)

**Columns:**

- Account Code (GL Code)
- Account Name
- Debit Balance
- Credit Balance
- Net Balance
- Budget (ถ้ามี)
- Variance

**Drill-down Capability:**

- คลิก Account → ดู Journal Entries
- คลิก Journal Entry → ดู Folio Transactions
- คลิก Transaction → ดู Folio Detail

---

### 1.3 Profit & Loss Statement (P&L) - งบกำไรขาดทุน

**วัตถุประสงค์:** รายงานสำหรับ Owner และ GM ดูผลประกอบการ

**Format (USALI Compliant):**

```
REVENUE
  Room Revenue
  Food Revenue
  Beverage Revenue
  Other Revenue
  Total Revenue

COST OF SALES
  Food Cost
  Beverage Cost
  Total Cost of Sales

GROSS PROFIT

OPERATING EXPENSES
  Salaries & Wages
  Utilities
  Marketing
  Maintenance
  Other Expenses
  Total Operating Expenses

NET OPERATING INCOME
```

**Comparison Columns:**

- Actual
- Budget
- Variance
- Last Year
- % of Revenue

**Features:**

- **Departmental P&L:** แยกตาม Department (Room, F&B, Spa)
- **Market Segment P&L:** แยกตาม Market Segment (Corporate, Leisure, Group)

---

### 1.4 Tax Invoice Control Report - รายงานคุมใบกำกับภาษี

**วัตถุประสงค์:** ควบคุมการออกใบกำกับภาษีให้ถูกต้องตามกฎหมาย

**Data Points:**

- วันที่ออกใบ
- เลขที่เล่ม (Book Number)
- เลขที่ใบกำกับ (Invoice Number)
- ชื่อลูกค้า
- เลขผู้เสียภาษี
- มูลค่าสินค้า (Net)
- VAT (7%)
- จำนวนเงินรวม
- สถานะ (Issued, Void, Canceled)

**Critical Rules:**

- Running Number ต้องครบ ไม่ข้าม
- Void Invoice ต้องแสดงและระบุเหตุผล
- e-Tax Invoice ID (ถ้ามี)
- QR Code สำหรับ e-Tax Invoice

**Export:**

- Excel (สำหรับส่งสรรพากร)
- PDF (สำหรับเก็บไว้)

---

### 1.5 Cashier Report & Shift Closure - รายงานปิดกะแคชเชียร์

**วัตถุประสงค์:** ปิดกะและตรวจสอบยอดเงินสด

**Payment Method Breakdown:**

| Payment Method         | Amount | Count |
| ---------------------- | ------ | ----- |
| Cash (THB)             |        |       |
| Credit Card - Visa     |        |       |
| Credit Card - Master   |        |       |
| Credit Card - JCB      |        |       |
| Credit Card - Amex     |        |       |
| Credit Card - UnionPay |        |       |
| Bank Transfer - KBank  |        |       |
| Bank Transfer - SCB    |        |       |
| Bank Transfer - BBL    |        |       |
| QR Payment (PromptPay) |        |       |
| City Ledger (AR)       |        |       |
| FOC / House Use        |        |       |
| Paid-out               |        |       |
| **Total**              |        |       |

**Additional Information:**

- Opening Cash
- Closing Cash
- Expected Cash (จาก Report)
- Variance (Actual - Expected)
- Shift Number
- Cashier Name
- Shift Start/End Time

---

### 1.6 Rebate & Allowance Report - รายงานการลดหนี้

**วัตถุประสงค์:** ตรวจสอบการลดหนี้เพื่อป้องกันทุจริต

**Data Points:**

- วันที่ทำรายการ
- เลขห้อง
- ชื่อแขก
- จำนวนเงินเดิม
- จำนวนเงินที่ลด
- จำนวนเงินหลังลด
- เหตุผล (Reason Code)
- User ที่ทำรายการ
- User ที่อนุมัติ (ถ้ามี)
- Manager Approval (Yes/No)

**Filters:**

- Date Range
- User
- Reason Code
- Amount Range

**Export:**

- PDF (สำหรับ Audit)
- Excel (สำหรับวิเคราะห์)

---

### 1.7 Deposit Ledger - รายงานเงินมัดจำคงเหลือ

**วัตถุประสงค์:** ตรวจสอบเงินมัดจำที่ยังไม่ได้โอนไป Folio

**Data Points:**

- Reservation Number
- Guest Name
- Check-in Date
- Deposit Amount
- Currency
- Payment Method
- Received Date
- Status (Pending Transfer, Transferred, Refunded)
- Transferred to Folio (Yes/No)

**Summary:**

- Total Deposits (Pending)
- Total Deposits (Transferred)
- Total Deposits (Refunded)

---

### 1.8 Guest Ledger Balance - Trial Balance ฝั่ง Front

**วัตถุประสงค์:** สรุปยอดลูกหนี้ที่ยังพักอยู่ (In-house) ณ สิ้นวัน

**Data Points:**

- Folio Number
- Room Number
- Guest Name
- Check-in Date
- Nights Stayed
- Balance (Outstanding)
- Credit Limit
- Over Limit (Yes/No)

**Sorting:**

- By Balance (High to Low)
- By Room Number
- By Guest Name

---

## 🏨 หมวดที่ 2: Front Office Audit Reports

### 2.1 Rate Variance Report - รายงานตรวจสอบราคา

**วัตถุประสงค์:** ตรวจสอบว่ามีการขายห้องราคาถูกเกินไปหรือไม่

**Data Points:**

- Room Number
- Guest Name
- Check-in Date
- Rack Rate (ราคามาตรฐาน)
- Sold Rate (ราคาที่ขายจริง)
- Variance (Rack - Sold)
- Rate Code
- Source
- User ที่ทำการจอง

**Alerts:**

- Highlight ถ้า Variance > 20%
- Highlight ถ้า Sold Rate = 0 (Complimentary)
- Highlight ถ้าไม่มี Manager Approval

---

### 2.2 High Balance Report - รายงานยอดหนี้เกินวงเงิน

**วัตถุประสงค์:** แจ้งเตือนห้องที่มียอดใช้จ่ายเกิน Credit Limit

**Data Points:**

- Room Number
- Guest Name
- Credit Limit
- Current Balance
- Over Limit Amount
- Payment Method (Credit Card Pre-auth)
- Last Payment Date

**Actions:**

- Alert Front Desk ทันที
- Email to Manager
- Block further charges (Optional)

---

### 2.3 Room Change Report - รายงานการย้ายห้อง

**วัตถุประสงค์:** ตรวจสอบการย้ายห้องเพื่อป้องกันทุจริต

**Data Points:**

- Reservation Number
- Guest Name
- From Room (ห้องเดิม)
- To Room (ห้องใหม่)
- From Rate (ราคาเดิม)
- To Rate (ราคาใหม่)
- Rate Difference
- Reason for Change
- Changed By (User)
- Changed At (Timestamp)

**Audit Points:**

- Highlight ถ้า Rate ลดลง (อาจมีการทุจริต)
- Highlight ถ้าเปลี่ยนห้องบ่อย (อาจมีปัญหา)

---

### 2.4 No-Show & Cancellation Report

**วัตถุประสงค์:** ติดตามการไม่มาพักและการยกเลิก

**Data Points:**

- Reservation Number
- Guest Name
- Original Check-in Date
- Cancellation Date
- Cancellation Reason
- Deposit Amount
- Forfeit Amount (ยึดเงินมัดจำ)
- Refund Amount
- Waive Penalty (Yes/No)
- Waive Reason

**Summary:**

- Total No-Shows
- Total Cancellations
- Total Forfeit Revenue
- Total Refund Amount

---

### 2.5 Complimentary & House Use Report

**วัตถุประสงค์:** ตรวจสอบห้องพักฟรีและห้องที่ผู้บริหารใช้

**Data Points:**

- Room Number
- Guest Name (ถ้ามี)
- Check-in Date
- Check-out Date
- Nights
- Rate (0 or Special Rate)
- Authority (ใครอนุมัติ)
- Purpose (Barter, Fam Trip, Staff, VIP, etc.)
- Department (ถ้าเป็น House Use)

**Summary:**

- Total Complimentary Rooms
- Total House Use Rooms
- Total Revenue Lost

---

### 2.6 Police Report (TM.30 / RR1) - รายงานส่งตม.

**วัตถุประสงค์:** ส่งข้อมูลแขกต่างชาติให้สำนักงานตรวจคนเข้าเมือง

**Data Points:**

- Passport Number
- Full Name
- Nationality
- Date of Birth
- Gender
- Room Number
- Check-in Date
- Check-out Date
- Address in Thailand

**Export Format:**

- Text File (ตาม Format ตม.)
- Excel (สำหรับตรวจสอบก่อนส่ง)
- Auto-upload to ตม. System (ถ้ามี API)

**Timing:**

- ต้องส่งภายใน 24 ชั่วโมงหลัง Check-in
- Auto-generate ทุกเช้า

---

## 🍳 หมวดที่ 3: F&B & Breakfast Reports

### 3.1 Expected Arrival List (ABF) - รายงานคาดการณ์อาหารเช้า

**วัตถุประสงค์:** ให้เชฟเตรียมอาหารเช้าตามจำนวนแขก

**Data Points:**

- Room Number
- Guest Name
- Adults (จำนวนผู้ใหญ่)
- Children (จำนวนเด็ก)
- Meal Plan (Included, Paid, Extra)
- Special Requests (Dietary requirements)
- Check-in Date
- Check-out Date

**Summary:**

- Total Adults (Expected)
- Total Children (Expected)
- Total Extra Pax (Paid separately)

**Timing:**

- Generate ทุกเย็น (สำหรับเช้าวันถัดไป)
- Update Real-time เมื่อมี Check-in/Check-out

---

### 3.2 Daily ABF Report (The "Morning List")

**วัตถุประสงค์:** รายงานสรุปอาหารเช้าที่เกิดขึ้นจริง

**Data Points:**

- Room Number
- Guest Name
- Adults (Included in Rate)
- Adults (Paid Extra)
- Children (Included)
- Children (Paid Extra)
- Total Pax
- Amount (ถ้า Paid Extra)
- Cashier Signature (จาก F&B)
- Cross-check Status (Matched/Unmatched)

**Reconciliation:**

- Compare กับ Expected Arrival List
- Highlight ถ้าไม่ตรงกัน
- Revenue Allocation (แยก Revenue ไป F&B Department)

---

### 3.3 Meal Plan Reconciliation

**วัตถุประสงค์:** แยก Revenue จากค่าอาหารเช้าที่แฝงอยู่ในค่าห้อง

**Data Points:**

- Date
- Room Revenue (Total)
- Meal Plan Allocation (ส่วนที่เป็นค่าอาหาร)
- Room Revenue (Net)
- F&B Revenue (จาก Meal Plan)

**Summary:**

- Total Room Revenue (Net)
- Total F&B Revenue (from Packages)
- Department Allocation

---

## 💳 หมวดที่ 4: Accounts Receivable (City Ledger)

### 4.1 Aging Report - รายงานอายุลูกหนี้

**วัตถุประสงค์:** ติดตามหนี้ที่ค้างชำระ

**Format:**

| Account     | Current | 30 Days | 60 Days | 90 Days | 120+ Days | Total |
| ----------- | ------- | ------- | ------- | ------- | --------- | ----- |
| Agoda       |         |         |         |         |           |       |
| Booking.com |         |         |         |         |           |       |
| Company ABC |         |         |         |         |           |       |
| **Total**   |         |         |         |         |           |       |

**Data Points:**

- Account Name
- Invoice Number
- Invoice Date
- Due Date
- Amount
- Paid Amount
- Outstanding Amount
- Days Overdue

**Actions:**

- Email Reminder (Auto)
- Statement Generation
- Collection Tracking

---

### 4.2 Debit Note / Statement Transfer

**วัตถุประสงค์:** สร้างใบแจ้งหนี้สำหรับบริษัทคู่ค้า

**Features:**

- Select multiple Folios
- Combine into single Invoice
- Generate PDF Statement
- Email to Company
- Track Payment Status

---

## 📊 หมวดที่ 5: Management & Statistics

### 5.1 Daily Flash Report - รายงานสรุปผลการดำเนินงานประจำวัน

**วัตถุประสงค์:** รายงานหลักที่ Owner อ่านทุกเช้า

**Structure:**

**Today (เมื่อวาน):**

- Occupancy %
- ADR (Average Daily Rate)
- RevPAR (Revenue per Available Room)
- F&B Revenue
- Total Revenue

**MTD (Month-to-Date):**

- Occupancy % (MTD)
- ADR (MTD)
- RevPAR (MTD)
- Revenue (MTD)
- Budget (MTD)
- Variance (MTD)

**YTD (Year-to-Date):**

- Occupancy % (YTD)
- ADR (YTD)
- RevPAR (YTD)
- Revenue (YTD)
- Budget (YTD)
- Variance (YTD)

**Forecast:**

- Month End Projection (Occupancy, Revenue)
- Pick-up (Expected new bookings)

**Delivery:**

- Auto-email ทุกเช้า (ก่อน 9 โมง)
- PDF Format
- Dashboard View

---

### 5.2 Nationality & Geographic Report

**วัตถุประสงค์:** วิเคราะห์ตลาดแขกตามสัญชาติ

**Data Points:**

- Nationality (Top 10)
- Room Nights
- Revenue
- Average Rate
- % of Total

**Visualization:**

- Bar Chart
- Pie Chart
- Trend (Month-over-Month)

---

### 5.3 Market Segment Analysis

**วัตถุประสงค์:** วิเคราะห์รายได้ตามกลุ่มตลาด

**Segments:**

- FIT (Wholesale/OTA)
- Corporate
- Government
- Group Tour
- MICE
- Walk-in

**Metrics:**

- Room Nights
- Revenue
- ADR
- % of Total Revenue

---

### 5.4 Source of Business Report

**วัตถุประสงค์:** วิเคราะห์ช่องทางการจอง

**Sources:**

- Direct Web
- Agoda
- Booking.com
- Expedia
- Walk-in
- Telephone
- Email
- Other OTAs

**Metrics:**

- Bookings Count
- Room Nights
- Revenue
- Commission Paid
- Net Revenue

---

### 5.5 Budget vs Actual Report

**วัตถุประสงค์:** เปรียบเทียบผลการดำเนินงานกับงบประมาณ

**Format:**

| Account            | Budget | Actual | Variance | % Variance |
| ------------------ | ------ | ------ | -------- | ---------- |
| Room Revenue       |        |        |          |            |
| F&B Revenue        |        |        |          |            |
| Total Revenue      |        |        |          |            |
| Operating Expenses |        |        |          |            |
| Net Income         |        |        |          |            |

**Periods:**

- Daily
- Monthly
- Yearly

**Drill-down:**

- คลิก Account → ดูรายละเอียดย่อย

---

## 🔍 หมวดที่ 6: Operational Reports

### 6.1 Occupancy Forecast - การคาดการณ์อัตราการเข้าพัก

**วัตถุประสงค์:** วางแผนทรัพยากร (พนักงาน, อาหาร)

**Periods:**

- 3-Day Forecast
- 7-Day Forecast
- 30-Day Forecast
- 12-Month Forecast

**Data Points:**

- Date
- Expected Occupancy %
- Expected Room Nights
- Expected Revenue
- On the Books (Confirmed)
- Pick-up (Expected)

---

### 6.2 Revenue Pace Report

**วัตถุประสงค์:** เปรียบเทียบการจองล่วงหน้ากับปีที่แล้ว

**Format:**

| Date  | This Year | Last Year | Variance | % Change |
| ----- | --------- | --------- | -------- | -------- |
| Jan 1 |           |           |          |          |
| Jan 2 |           |           |          |          |
| ...   |           |           |          |          |

**Visualization:**

- Line Chart (This Year vs Last Year)

---

### 6.3 Out of Order/Service Analysis

**วัตถุประสงค์:** วิเคราะห์สาเหตุที่ปิดห้อง

**Data Points:**

- Room Number
- Status (OOO/OOS)
- Start Date
- End Date
- Reason (AC Broken, Water Leak, Renovation, etc.)
- Days Out
- Revenue Lost

**Summary:**

- Total OOO Days
- Total OOS Days
- Most Common Reasons
- Revenue Impact

---

## 📋 สรุป: Report Requirements

### Output Formats

- **PDF:** สำหรับเซ็นชื่อ, ส่งราชการ, เก็บไว้
- **Excel:** Raw Data สำหรับวิเคราะห์ต่อ (Pivot Table)
- **Dashboard:** Interactive Web View (Drill-down)

### Delivery Methods

- **Email:** Auto-send (Scheduled)
- **Print:** Direct print
- **Download:** Manual download

### Access Control

- **Role-based:** แต่ละ Role เห็น Report ที่เกี่ยวข้องเท่านั้น
- **Audit Log:** บันทึกว่าใครดู/ดาวน์โหลด Report อะไร

---

**Last Updated:** 2025-01-XX
**Status:** ✅ Complete - Ready for Implementation
