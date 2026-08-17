-- CreateEnum
CREATE TYPE "TaxExemptReason" AS ENUM ('DIPLOMATIC', 'GOVERNMENT', 'INTERNATIONAL_ORG', 'OTHER');

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN "taxExempt" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Reservation" ADD COLUMN "taxExemptReason" "TaxExemptReason";
ALTER TABLE "Reservation" ADD COLUMN "taxExemptDocumentRef" TEXT;
ALTER TABLE "Reservation" ADD COLUMN "taxExemptApprovedBy" TEXT;

-- CreateIndex
CREATE INDEX "Reservation_taxExempt_idx" ON "Reservation"("taxExempt");
