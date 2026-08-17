-- CreateEnum
CREATE TYPE "StayPurpose" AS ENUM ('STANDARD', 'COMPLIMENTARY', 'HOUSE_USE');

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN "stayPurpose" "StayPurpose" NOT NULL DEFAULT 'STANDARD';
ALTER TABLE "Reservation" ADD COLUMN "approvedBy" TEXT;
ALTER TABLE "Reservation" ADD COLUMN "stayPurposeNote" TEXT;
ALTER TABLE "Reservation" ADD COLUMN "department" TEXT;

-- CreateIndex
CREATE INDEX "Reservation_stayPurpose_idx" ON "Reservation"("stayPurpose");
