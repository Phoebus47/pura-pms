-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN "isDayUse" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Reservation_isDayUse_idx" ON "Reservation"("isDayUse");
