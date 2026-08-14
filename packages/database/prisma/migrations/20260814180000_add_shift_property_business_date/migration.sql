-- AlterTable
ALTER TABLE "Shift" ADD COLUMN "propertyId" TEXT,
ADD COLUMN "businessDate" DATE,
ADD COLUMN "expectedCash" DECIMAL(12,2),
ADD COLUMN "closedBy" TEXT,
ADD COLUMN "managerApprovedBy" TEXT,
ADD COLUMN "managerApprovedAt" TIMESTAMP(3),
ADD COLUMN "varianceReason" TEXT,
ADD COLUMN "handoverToUserId" TEXT,
ADD COLUMN "handoverFromShiftId" TEXT;

-- Backfill propertyId from the oldest Property (one-time repair for leftover rows)
UPDATE "Shift"
SET "propertyId" = (SELECT id FROM "Property" ORDER BY "createdAt" ASC LIMIT 1)
WHERE "propertyId" IS NULL;

-- Backfill businessDate from that property, else startTime::date
UPDATE "Shift" AS s
SET "businessDate" = COALESCE(
  (SELECT p."businessDate" FROM "Property" AS p WHERE p.id = s."propertyId"),
  s."startTime"::date
)
WHERE s."businessDate" IS NULL;

-- Orphan shifts with no Property cannot be valid
DELETE FROM "Shift" WHERE "propertyId" IS NULL;

-- AlterTable
ALTER TABLE "Shift" ALTER COLUMN "propertyId" SET NOT NULL;
ALTER TABLE "Shift" ALTER COLUMN "businessDate" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Shift_propertyId_businessDate_status_idx" ON "Shift"("propertyId", "businessDate", "status");

-- CreateIndex
CREATE INDEX "Shift_userId_status_idx" ON "Shift"("userId", "status");

-- CreateIndex
CREATE INDEX "FolioTransaction_shiftId_idx" ON "FolioTransaction"("shiftId");
