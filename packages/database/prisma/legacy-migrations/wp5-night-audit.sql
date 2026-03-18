-- Migration: WP5 Night Audit hardening
-- Generated offline via `prisma migrate diff` (from schema.head.prisma -> schema.prisma)

-- DropIndex
DROP INDEX "NightAudit_businessDate_key";

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "businessDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "NightAudit" ADD COLUMN     "propertyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ReportArchive" ADD COLUMN     "propertyId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "NightAudit_propertyId_businessDate_key" ON "NightAudit"("propertyId", "businessDate");

-- CreateIndex
CREATE INDEX "ReportArchive_propertyId_idx" ON "ReportArchive"("propertyId");

-- AddForeignKey
ALTER TABLE "NightAudit" ADD CONSTRAINT "NightAudit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportArchive" ADD CONSTRAINT "ReportArchive_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

