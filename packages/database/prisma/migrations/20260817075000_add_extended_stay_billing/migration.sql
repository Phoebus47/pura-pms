-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('NIGHTLY', 'WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN "billingCycle" "BillingCycle" NOT NULL DEFAULT 'NIGHTLY';
ALTER TABLE "Reservation" ADD COLUMN "lastInterimBillingDate" DATE;
ALTER TABLE "Folio" ADD COLUMN "isInterim" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Reservation_billingCycle_idx" ON "Reservation"("billingCycle");
