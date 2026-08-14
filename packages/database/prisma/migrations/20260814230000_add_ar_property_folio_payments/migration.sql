-- AlterTable
ALTER TABLE "ARAccount" ADD COLUMN "propertyId" TEXT,
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill ARAccount.propertyId from oldest property
UPDATE "ARAccount"
SET "propertyId" = (SELECT id FROM "Property" ORDER BY "createdAt" ASC LIMIT 1)
WHERE "propertyId" IS NULL;

DELETE FROM "ARAccount" WHERE "propertyId" IS NULL;

-- AlterTable
ALTER TABLE "ARAccount" ALTER COLUMN "propertyId" SET NOT NULL;

-- DropIndex
ALTER TABLE "ARAccount" DROP CONSTRAINT IF EXISTS "ARAccount_accountNumber_key";
DROP INDEX IF EXISTS "ARAccount_accountNumber_key";

-- CreateIndex
CREATE UNIQUE INDEX "ARAccount_propertyId_accountNumber_key" ON "ARAccount"("propertyId", "accountNumber");

-- CreateIndex
CREATE INDEX "ARAccount_propertyId_isActive_idx" ON "ARAccount"("propertyId", "isActive");

-- AddForeignKey
ALTER TABLE "ARAccount" ADD CONSTRAINT "ARAccount_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN "propertyId" TEXT,
ADD COLUMN "folioId" TEXT;

UPDATE "Invoice" AS inv
SET "propertyId" = (
  SELECT a."propertyId"
  FROM "ARAccount" AS a
  WHERE a.id = inv."arAccountId"
)
WHERE inv."propertyId" IS NULL;

UPDATE "Invoice"
SET "propertyId" = (SELECT id FROM "Property" ORDER BY "createdAt" ASC LIMIT 1)
WHERE "propertyId" IS NULL;

DELETE FROM "Invoice" WHERE "propertyId" IS NULL;

ALTER TABLE "Invoice" ALTER COLUMN "propertyId" SET NOT NULL;

ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_invoiceNumber_key";
DROP INDEX IF EXISTS "Invoice_invoiceNumber_key";

CREATE UNIQUE INDEX "Invoice_propertyId_invoiceNumber_key" ON "Invoice"("propertyId", "invoiceNumber");

CREATE INDEX "Invoice_propertyId_invoiceDate_idx" ON "Invoice"("propertyId", "invoiceDate");

CREATE INDEX "Invoice_arAccountId_status_idx" ON "Invoice"("arAccountId", "status");

CREATE INDEX "Invoice_folioId_idx" ON "Invoice"("folioId");

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_folioId_fkey" FOREIGN KEY ("folioId") REFERENCES "Folio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "InvoicePayment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "method" TEXT NOT NULL,
    "reference" TEXT,
    "paidBy" TEXT NOT NULL,
    "businessDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoicePayment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InvoicePayment_invoiceId_idx" ON "InvoicePayment"("invoiceId");

ALTER TABLE "InvoicePayment" ADD CONSTRAINT "InvoicePayment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
