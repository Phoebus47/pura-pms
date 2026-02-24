# Sprint 2: Financial Foundation & Billing

**Theme:** Building the financial backbone of the PMS.
**Goal:** Enable accurate charge posting, folio management, and basic billing operations.
**Duration:** 2 Weeks

---

## 🎯 Objectives

1.  **Transaction Code System**: Implement the "Chart of Accounts" for the PMS (Room Charge, Cash, Visa, Breakfast, etc.).
2.  **Folio Management**: specific UI for managing multiple folios (Windows 1-4) within a reservation.
3.  **Posting Engine**: Backend logic to post charges and payments to folios with correct Tax/Service breakdown.
4.  **Tax & Service Configuration**: Global settings for VAT (7%) and Service Charge (10%).

---

## 📋 Backlog Items

### 1. Master Data (Settings)

- [ ] **Transaction Codes API**: CRUD endpoints for `TransactionCode` model.
- [ ] **Transaction Codes UI**:
  - List view with filtering (Charges vs Payments).
  - Create/Edit dialog (Code, Description, Group, GL Mapping).
  - Toggle Tax/Service applicability.

### 2. Backend Logic (Posting Engine)

- [ ] **Folio Service**:
  - `getFolio(reservationId)`: Fetch all windows and transactions.
  - `createFolio(reservationId)`: Auto-create windows 1-4 on check-in.
- [ ] **Posting Service**:
  - `postCharge(folioId, code, amount)`: Calculate Tax/Service and create `FolioTransaction`.
  - `postPayment(folioId, code, amount)`: Handle negative posting (payments).

### 3. Frontend UI (Billing Tab)

- [ ] **Billing Dashboard (Reservation > Billing)**:
  - Layout showing 4 Folio Windows.
  - Summary of Balance per window.
- [ ] **Transaction List**:
  - Data table showing Date, Code, Description, Amount, User.
- [ ] **Post Charge Dialog**:
  - Select Transaction Code (dropdown).
  - Enter Amount / Qty.
  - "Post" button.
- [ ] **Post Payment Dialog**:
  - Select Payment Method (Cash, Card).
  - Enter Amount.

### 4. Integration Verification

- [ ] Verify that posting a "Room Charge" correctly updates the Folio Balance.
- [ ] Verify that posting "Cash" reduces the Folio Balance.

---

## 📅 Timeline

| Week       | Focus                 | Deliverables                                             |
| :--------- | :-------------------- | :------------------------------------------------------- |
| **Week 1** | Backend & Master Data | Transaction Code CRUD, Posting Service Logic, Unit Tests |
| **Week 2** | Frontend Billing UI   | Folio Windows UI, Posting Dialogs, Integration Tests     |

---

## 🧪 Definition of Done (DoD)

- [ ] API endpoints secured with JWT.
- [ ] UI implemented with shadcn/ui components.
- [ ] Unit tests for Tax/Service calculation logic.
- [ ] E2E test for the "Post Charge -> Pay Balance" flow.
