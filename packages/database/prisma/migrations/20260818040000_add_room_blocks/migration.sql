-- CreateEnum
CREATE TYPE "BlockKind" AS ENUM ('ALLOTMENT', 'GROUP');

-- CreateEnum
CREATE TYPE "BlockInventoryMode" AS ENUM ('GENERAL', 'DEDICATED');

-- CreateEnum
CREATE TYPE "BlockStatus" AS ENUM ('OPEN', 'RELEASED', 'CLOSED');

-- CreateTable
CREATE TABLE "RoomBlock" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "BlockKind" NOT NULL,
    "inventoryMode" "BlockInventoryMode" NOT NULL DEFAULT 'GENERAL',
    "channel" TEXT,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "cutoffDate" DATE NOT NULL,
    "allottedRooms" INTEGER NOT NULL,
    "releasedRooms" INTEGER NOT NULL DEFAULT 0,
    "status" "BlockStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomBlock_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN "blockId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "RoomBlock_propertyId_code_key" ON "RoomBlock"("propertyId", "code");

-- CreateIndex
CREATE INDEX "RoomBlock_propertyId_status_idx" ON "RoomBlock"("propertyId", "status");

-- CreateIndex
CREATE INDEX "RoomBlock_propertyId_startDate_endDate_idx" ON "RoomBlock"("propertyId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "RoomBlock_cutoffDate_status_idx" ON "RoomBlock"("cutoffDate", "status");

-- CreateIndex
CREATE INDEX "Reservation_blockId_idx" ON "Reservation"("blockId");

-- AddForeignKey
ALTER TABLE "RoomBlock" ADD CONSTRAINT "RoomBlock_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomBlock" ADD CONSTRAINT "RoomBlock_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "RoomBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;
