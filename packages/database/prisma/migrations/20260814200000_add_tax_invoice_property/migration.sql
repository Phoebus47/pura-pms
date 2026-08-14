-- AlterTable
ALTER TABLE "TaxInvoice" ADD COLUMN "propertyId" TEXT,
ADD COLUMN "buyerName" TEXT,
ADD COLUMN "voidReason" TEXT,
ADD COLUMN "voidedAt" TIMESTAMP(3),
ADD COLUMN "voidedBy" TEXT;

-- Backfill propertyId from reservation room, then folio reservation, then oldest property
UPDATE "TaxInvoice" AS ti
SET "propertyId" = (
  SELECT rm."propertyId"
  FROM "Reservation" AS r
  JOIN "Room" AS rm ON rm.id = r."roomId"
  WHERE r.id = ti."reservationId"
)
WHERE ti."propertyId" IS NULL AND ti."reservationId" IS NOT NULL;

UPDATE "TaxInvoice" AS ti
SET "propertyId" = (
  SELECT rm."propertyId"
  FROM "Folio" AS f
  JOIN "Reservation" AS r ON r.id = f."reservationId"
  JOIN "Room" AS rm ON rm.id = r."roomId"
  WHERE f.id = ti."folioId"
)
WHERE ti."propertyId" IS NULL AND ti."folioId" IS NOT NULL;

UPDATE "TaxInvoice"
SET "propertyId" = (SELECT id FROM "Property" ORDER BY "createdAt" ASC LIMIT 1)
WHERE "propertyId" IS NULL;

DELETE FROM "TaxInvoice" WHERE "propertyId" IS NULL;

-- AlterTable
ALTER TABLE "TaxInvoice" ALTER COLUMN "propertyId" SET NOT NULL;

-- DropIndex
ALTER TABLE "TaxInvoice" DROP CONSTRAINT IF EXISTS "TaxInvoice_invoiceNumber_key";
DROP INDEX IF EXISTS "TaxInvoice_invoiceNumber_key";

-- CreateIndex
CREATE UNIQUE INDEX "TaxInvoice_propertyId_invoiceNumber_key" ON "TaxInvoice"("propertyId", "invoiceNumber");

-- CreateIndex
CREATE INDEX "TaxInvoice_propertyId_businessDate_idx" ON "TaxInvoice"("propertyId", "businessDate");

-- CreateIndex
CREATE INDEX "TaxInvoice_folioId_idx" ON "TaxInvoice"("folioId");

-- AddForeignKey
ALTER TABLE "TaxInvoice" ADD CONSTRAINT "TaxInvoice_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxInvoice" ADD CONSTRAINT "TaxInvoice_folioId_fkey" FOREIGN KEY ("folioId") REFERENCES "Folio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
