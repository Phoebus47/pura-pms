-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN "isRoomLocked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Reservation" ADD COLUMN "roomLockNote" TEXT;

-- CreateIndex
CREATE INDEX "Reservation_isRoomLocked_idx" ON "Reservation"("isRoomLocked");
