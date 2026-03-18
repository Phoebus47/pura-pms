-- ==================== MIGRATION SCRIPT ====================
-- Transaction → FolioTransaction Migration
-- 
-- IMPORTANT: This script migrates existing Transaction records to FolioTransaction
-- Run this AFTER schema migration and BEFORE dropping Transaction table
--
-- Prerequisites:
-- 1. Schema migration completed (new tables created)
-- 2. TransactionCode seed data loaded
-- 3. Backup database before running
--
-- ==================== STEP 1: Create Default FolioWindow ====================
-- Create default FolioWindow (Window 1) for each existing Folio

INSERT INTO "FolioWindow" ("id", "folioId", "windowNumber", "description", "balance", "createdAt")
SELECT 
  gen_random_uuid()::text as id,
  f.id as "folioId",
  1 as "windowNumber",
  'Default Window' as description,
  f.balance as balance,
  NOW() as "createdAt"
FROM "Folio" f
WHERE NOT EXISTS (
  SELECT 1 FROM "FolioWindow" fw 
  WHERE fw."folioId" = f.id AND fw."windowNumber" = 1
);

-- ==================== STEP 2: Map Transaction Types to TransactionCodes ====================
-- Create mapping table for Transaction.type → TransactionCode.code
-- This assumes TransactionCode seed data has been loaded

-- Example mappings (adjust based on your TransactionCode seed data):
-- CHARGE → "1000" (Room Revenue) or appropriate code
-- PAYMENT → "9000" (Cash Payment) or appropriate code
-- ADJUSTMENT → "5000" (Discount) or appropriate code
-- TRANSFER → Create appropriate TransactionCode if needed

-- ==================== STEP 3: Migrate Transaction → FolioTransaction ====================
-- This is a template - adjust TransactionCode mappings based on your seed data

INSERT INTO "FolioTransaction" (
  "id",
  "windowId",
  "trxCodeId",
  "businessDate",
  "createdAt",
  "amountNet",
  "amountService",
  "amountTax",
  "amountTotal",
  "sign",
  "reference",
  "remark",
  "userId",
  "shiftId",
  "nightAuditId",
  "reasonCodeId",
  "relatedTrxId",
  "isVoid",
  "voidedAt",
  "voidedBy"
)
SELECT 
  t.id,
  fw.id as "windowId",
  -- Map Transaction.type to TransactionCode.id
  -- This is a placeholder - you need to join with TransactionCode table
  (
    SELECT tc.id 
    FROM "TransactionCode" tc 
    WHERE 
      CASE t.type
        WHEN 'CHARGE' THEN tc.code = '1000' -- Room Revenue (adjust as needed)
        WHEN 'PAYMENT' THEN tc.code = '9000' -- Cash Payment (adjust as needed)
        WHEN 'ADJUSTMENT' THEN tc.code = '5000' -- Discount (adjust as needed)
        WHEN 'TRANSFER' THEN tc.code = '1000' -- Default (adjust as needed)
        ELSE tc.code = '3007' -- Miscellaneous
      END
    LIMIT 1
  ) as "trxCodeId",
  -- Use Folio's businessDate if exists, otherwise use Transaction.postedAt date
  COALESCE(f."businessDate", DATE(t."postedAt")) as "businessDate",
  t."postedAt" as "createdAt",
  -- Calculate amountNet (assuming tax is separate)
  CASE 
    WHEN t.tax > 0 THEN t.amount / 1.17 -- Remove VAT 7% and Service 10%
    ELSE t.amount / 1.1 -- Remove Service 10% only
  END as "amountNet",
  -- Calculate amountService (10% of net)
  CASE 
    WHEN t.tax > 0 THEN (t.amount / 1.17) * 0.1
    ELSE (t.amount / 1.1) * 0.1
  END as "amountService",
  -- Use existing tax
  t.tax as "amountTax",
  -- Total amount
  t.amount as "amountTotal",
  -- Sign: +1 for CHARGE, -1 for PAYMENT
  CASE 
    WHEN t.type = 'PAYMENT' THEN -1
    ELSE 1
  END as sign,
  t.description as "reference",
  t."voidReason" as remark,
  t."postedBy" as "userId",
  t."shiftId",
  NULL as "nightAuditId", -- No night audit yet
  NULL as "reasonCodeId", -- Map voidReason to ReasonCode if needed
  NULL as "relatedTrxId",
  t."isVoid",
  t."voidedAt",
  NULL as "voidedBy" -- Can be set from postedBy if voided
FROM "Transaction" t
INNER JOIN "Folio" f ON t."folioId" = f.id
INNER JOIN "FolioWindow" fw ON fw."folioId" = f.id AND fw."windowNumber" = 1
WHERE NOT EXISTS (
  SELECT 1 FROM "FolioTransaction" ft WHERE ft.id = t.id
);

-- ==================== STEP 4: Update Folio Status ====================
-- Update Folio.status based on isClosed

UPDATE "Folio"
SET 
  "status" = CASE 
    WHEN "isClosed" = true THEN 'CLOSED'::"FolioStatus"
    ELSE 'OPEN'::"FolioStatus"
  END,
  "businessDate" = COALESCE(
    "businessDate",
    (SELECT DATE("checkIn") FROM "Reservation" WHERE id = "Folio"."reservationId")
  ),
  "closedAt" = CASE 
    WHEN "isClosed" = true THEN "createdAt"
    ELSE NULL
  END
WHERE "status" IS NULL;

-- ==================== STEP 5: Validation ====================
-- Verify migration results

-- Check transaction count
SELECT 
  'Transaction' as source_table,
  COUNT(*) as record_count
FROM "Transaction"
UNION ALL
SELECT 
  'FolioTransaction' as source_table,
  COUNT(*) as record_count
FROM "FolioTransaction";

-- Check balance consistency
SELECT 
  f.id,
  f."folioNumber",
  f.balance as "folioBalance",
  COALESCE(SUM(ft."amountTotal" * ft.sign), 0) as "calculatedBalance"
FROM "Folio" f
LEFT JOIN "FolioWindow" fw ON fw."folioId" = f.id
LEFT JOIN "FolioTransaction" ft ON ft."windowId" = fw.id
GROUP BY f.id, f."folioNumber", f.balance;

-- ==================== NOTES ====================
-- 
-- After successful migration:
-- 1. Verify all transactions migrated
-- 2. Check balance consistency
-- 3. Update application code to use FolioTransaction
-- 4. Test all financial operations
-- 5. Drop Transaction table (in separate migration)
--
-- Rollback: Keep Transaction table until fully verified
-- ====================
