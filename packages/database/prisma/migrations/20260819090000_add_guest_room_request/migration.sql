-- CreateEnum
CREATE TYPE "GuestRoomRequest" AS ENUM ('NONE', 'DND', 'MUR');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN "guestRequest" "GuestRoomRequest" NOT NULL DEFAULT 'NONE';
ALTER TABLE "Room" ADD COLUMN "guestRequestNote" TEXT;
ALTER TABLE "Room" ADD COLUMN "guestRequestUpdatedAt" TIMESTAMP(3);
ALTER TABLE "Room" ADD COLUMN "guestRequestUpdatedBy" TEXT;

-- CreateIndex
CREATE INDEX "Room_propertyId_guestRequest_idx" ON "Room"("propertyId", "guestRequest");
