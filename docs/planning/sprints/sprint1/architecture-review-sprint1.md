# Architecture Review - Sprint 1: Financial Schema Merge

**Reviewer:** System Architect  
**Date:** 2025-01-XX  
**Sprint:** Phase 3, Sprint 1  
**Status:** ✅ **APPROVED with Recommendations**

---

## 📋 Executive Summary

### Review Scope

- ✅ Task 3.1.1: Merge Financial Schema Enhancements
- ✅ Task 3.1.2: Seed Default Data
- ✅ Architecture compliance with USALI standards
- ✅ Data integrity for split billing
- ✅ Performance considerations
- ✅ Migration strategy

### Overall Assessment

**Status:** ✅ **APPROVED** - Schema design is solid and enterprise-ready, but requires careful migration planning.

**Risk Level:** 🟡 **Medium** - Migration complexity due to Transaction model replacement

---

## ✅ Strengths

### 1. USALI Compliance

- ✅ **TransactionCode** model properly maps PMS operations to GL accounts
- ✅ **GLAccountCode** field ensures proper accounting export
- ✅ **DepartmentCode** supports USALI department structure
- ✅ **Business Date** separation from system date (critical for hotel accounting)

### 2. Data Integrity

- ✅ **Immutable Transactions:** `FolioTransaction` cannot be deleted (only voided)
- ✅ **Audit Trail:** Complete tracking with `userId`, `shiftId`, `nightAuditId`
- ✅ **Split Billing:** `FolioWindow` system supports multiple billing windows
- ✅ **Tax/Service Separation:** Proper breakdown (`amountNet`, `amountService`, `amountTax`)

### 3. Architecture Design

- ✅ **Proper Relations:** All foreign keys correctly defined
- ✅ **Indexes:** Performance indexes on critical fields (`businessDate`, `windowId`, `nightAuditId`)
- ✅ **Constraints:** Unique constraints where needed (`folioId + windowNumber`)
- ✅ **Cascade Deletes:** Properly configured (`onDelete: Cascade` for FolioWindow)

---

## ⚠️ Critical Issues & Recommendations

### 🔴 CRITICAL: Transaction Model Replacement

**Issue:**

- Current `Transaction` model (line 149-165 in schema.prisma) will be **replaced** by `FolioTransaction`
- This is a **breaking change** that requires data migration

**Impact:**

- Existing `Transaction` records must be migrated to `FolioTransaction`
- `Shift.transactions` relation will break
- All existing code referencing `Transaction` model will break

**Recommendations:**

1. **Migration Strategy:**

   ```prisma
   // Step 1: Create FolioTransaction table
   // Step 2: Migrate existing Transaction data:
   //   - Create default FolioWindow for each Folio
   //   - Map Transaction.type to TransactionCode
   //   - Calculate amountNet, amountService, amountTax from existing amount/tax
   // Step 3: Update Shift relation to use FolioTransaction
   // Step 4: Drop Transaction table
   ```

2. **Data Migration Script Required:**
   - Create migration script to convert `Transaction` → `FolioTransaction`
   - Handle missing TransactionCode mappings
   - Create default FolioWindow for existing Folios
   - Preserve audit trail (userId, shiftId, postedAt)

3. **Backward Compatibility:**
   - Consider keeping `Transaction` model temporarily with deprecation flag
   - Or create view/alias for transition period

---

### 🟡 HIGH: Folio Model Enhancement

**Issue:**

- Current `Folio` model (line 137-147) needs enhancement:
  - Add `status: FolioStatus` (currently only has `isClosed: Boolean`)
  - Add `businessDate: DateTime @db.Date`
  - Add `closedAt: DateTime?`
  - Add `closedBy: String?`
  - Add `windows: FolioWindow[]` relation

**Recommendations:**

1. **Migration Path:**

   ```prisma
   // Add new fields as nullable first
   status        FolioStatus? @default(OPEN)
   businessDate  DateTime?     @db.Date
   closedAt      DateTime?
   closedBy      String?

   // Then update existing records:
   // - Set status based on isClosed
   // - Set businessDate from reservation checkIn
   // - Set closedAt/closedBy if isClosed = true
   ```

2. **Data Backfill:**
   - Set `status = CLOSED` where `isClosed = true`
   - Set `businessDate = reservation.checkIn` for existing folios
   - Set `closedAt = updatedAt` where `isClosed = true`

---

### 🟡 HIGH: Reservation Model Relations

**Issue:**

- Need to add relations to Reservation:
  - `fixedCharges: FixedCharge[]`
  - `deposits: Deposit[]`
  - `taxInvoices: TaxInvoice[]`

**Recommendations:**

- ✅ Safe to add (new relations, no breaking changes)
- Ensure proper cascade delete behavior

---

### 🟡 MEDIUM: Enum Conflicts

**Issue:**

- `TransactionType` enum exists (line 389-394) but new schema uses `TrxType`
- Need to ensure compatibility

**Recommendations:**

1. **Option 1:** Rename `TrxType` to `TransactionType` (keep existing enum)
2. **Option 2:** Create mapping between old and new enums during migration
3. **Option 3:** Use `TrxType` for new `FolioTransaction`, keep `TransactionType` for legacy (if keeping Transaction temporarily)

**Recommended:** Option 1 - Rename to maintain consistency

---

### 🟡 MEDIUM: Missing Indexes

**Current Indexes in FolioTransaction:**

- ✅ `@@index([businessDate])`
- ✅ `@@index([windowId, businessDate])`
- ✅ `@@index([nightAuditId])`
- ✅ `@@index([trxCodeId])`

**Additional Recommendations:**

- ⚠️ Add `@@index([userId])` for audit queries
- ⚠️ Add `@@index([isVoid])` for filtering voided transactions
- ⚠️ Add `@@index([relatedTrxId])` for void transaction lookups

---

### 🟡 MEDIUM: Decimal Precision

**Issue:**

- `amountService` and `amountTax` use `Decimal(12, 2)`
- `serviceRate` uses `Decimal(5, 2)` (10.00%)
- Need to ensure calculation precision

**Recommendations:**

- ✅ Current precision is adequate
- Consider using `Decimal(10, 4)` for exchange rates (already correct)
- Ensure calculation logic uses proper rounding

---

## 📊 Performance Analysis

### Database Size Projections

**Assumptions:**

- 100 rooms × 365 days = 36,500 reservations/year
- Average 5 transactions per reservation = 182,500 transactions/year
- 10 years = 1,825,000 transactions

**Index Impact:**

- ✅ Indexes on `businessDate` and `windowId` will support efficient queries
- ✅ Composite index `[windowId, businessDate]` optimal for folio balance calculations
- ⚠️ Consider partitioning by `businessDate` for 10+ years of data

**Recommendations:**

1. **Short-term (1-2 years):** Current indexes sufficient
2. **Long-term (5+ years):** Consider table partitioning by `businessDate`
3. **Query Optimization:** Use `businessDate` in WHERE clauses for all financial queries

---

## 🔒 Data Integrity Checks

### 1. Immutable Transactions

- ✅ `FolioTransaction` has no `delete` operation (only `isVoid` flag)
- ✅ `relatedTrxId` links void transactions to originals
- ✅ `nightAuditId` prevents modification after audit closure

### 2. Split Billing Integrity

- ✅ `FolioWindow` unique constraint `[folioId, windowNumber]` prevents duplicates
- ✅ Balance calculation: `balance = SUM(amountTotal * sign)` per window
- ⚠️ **Recommendation:** Add database trigger or application-level validation to ensure balance consistency

### 3. Tax/Service Calculation

- ✅ Separate fields for `amountNet`, `amountService`, `amountTax`
- ✅ `amountTotal = amountNet + amountService + amountTax`
- ⚠️ **Recommendation:** Add database constraint or application validation:
  ```prisma
  // In application layer:
  assert(amountTotal === amountNet + amountService + amountTax)
  ```

### 4. Business Date vs System Date

- ✅ `businessDate` (accounting date) separate from `createdAt` (system timestamp)
- ✅ Critical for night audit and financial reporting
- ✅ Properly indexed for date-range queries

---

## 🏗️ Migration Strategy

### Phase 1: Schema Addition (Non-breaking)

1. Add new models: `TransactionCode`, `FolioWindow`, `ReasonCode`, etc.
2. Add new enums: `TrxType`, `TrxGroup`, `FolioStatus`, `ReasonCategory`
3. Add new fields to `Folio` (nullable initially)
4. Add new relations to `Reservation`

### Phase 2: Data Migration (Breaking)

1. Create default `FolioWindow` for each existing `Folio`
2. Create `TransactionCode` seed data
3. Migrate `Transaction` → `FolioTransaction`:
   - Map `Transaction.type` to `TransactionCode`
   - Create `FolioWindow` if not exists
   - Calculate `amountNet`, `amountService`, `amountTax`
   - Preserve audit fields

### Phase 3: Schema Cleanup

1. Update `Shift` relation to use `FolioTransaction`
2. Drop `Transaction` model
3. Make new `Folio` fields non-nullable
4. Remove `isClosed` from `Folio` (use `status` instead)

### Rollback Plan

- Keep `Transaction` model backup
- Create migration rollback script
- Test rollback on development database

---

## ✅ Approval Checklist

### Schema Design

- [x] USALI compliant
- [x] Data integrity maintained
- [x] Proper indexes defined
- [x] Relations correctly defined
- [x] Enums properly structured

### Migration Planning

- [ ] Migration script prepared
- [ ] Rollback script prepared
- [ ] Data migration strategy defined
- [ ] Test migration on development database
- [ ] Performance testing completed

### Code Impact

- [ ] Backend services updated
- [ ] API endpoints updated
- [ ] Frontend components updated
- [ ] Tests updated
- [ ] Documentation updated

---

## 🎯 Final Recommendations

### ✅ APPROVED with Conditions

**Conditions:**

1. **Migration Script Required:** Must create comprehensive migration script before merge
2. **Data Backfill Required:** Must backfill existing data properly
3. **Testing Required:** Must test migration on development database with sample data
4. **Rollback Plan Required:** Must have rollback strategy

### Priority Actions

**Before Development:**

1. ✅ Create detailed migration script
2. ✅ Test migration on clean database
3. ✅ Test migration with sample data
4. ✅ Create rollback script
5. ✅ Document migration process

**During Development:**

1. ⚠️ Monitor migration performance
2. ⚠️ Validate data integrity after migration
3. ⚠️ Update all code references from `Transaction` to `FolioTransaction`

**After Migration:**

1. ⚠️ Verify all existing functionality works
2. ⚠️ Run data integrity checks
3. ⚠️ Performance testing

---

## 📝 Additional Notes

### Schema Enhancements Quality

- ✅ **Excellent:** Schema design follows best practices
- ✅ **Enterprise-ready:** Supports complex hotel operations
- ✅ **Scalable:** Can handle 10+ years of data
- ✅ **Maintainable:** Clear structure and naming

### Missing Considerations

- ⚠️ **Currency Support:** `ExchangeRate` model exists but need to verify multi-currency handling
- ⚠️ **Tax Configuration:** `taxId` in TransactionCode references undefined model (may need Tax model)
- ⚠️ **User Relations:** `userId`, `closedBy`, `voidedBy` should reference `User` model (currently String)

**Recommendations:**

- Add `User` relations to `FolioTransaction` (userId, voidedBy)
- Add `User` relation to `Folio` (closedBy)
- Consider creating `Tax` model for tax configuration

---

## 🚀 Ready for Development

**Status:** ✅ **APPROVED** - Schema is ready for development with the above recommendations.

**Next Steps:**

1. Create migration script (Task 3.1.1 - Subtask)
2. Test migration on development database
3. Proceed with schema merge
4. Update backend services
5. Update frontend components

---

**Reviewed By:** System Architect  
**Date:** 2025-01-XX  
**Version:** 1.0
