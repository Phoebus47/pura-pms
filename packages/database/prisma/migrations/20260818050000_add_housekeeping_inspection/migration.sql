-- CreateEnum
CREATE TYPE "HkStage" AS ENUM ('DIRTY', 'CLEAN', 'READY');

-- CreateEnum
CREATE TYPE "InspectionResult" AS ENUM ('PASSED', 'FAILED');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN "hkStage" "HkStage" NOT NULL DEFAULT 'READY';

UPDATE "Room"
SET "hkStage" = 'DIRTY'
WHERE "status" IN ('VACANT_DIRTY', 'OCCUPIED_DIRTY');

-- CreateTable
CREATE TABLE "HousekeepingInspection" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "businessDate" DATE NOT NULL,
    "result" "InspectionResult" NOT NULL,
    "inspectedBy" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HousekeepingInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HousekeepingInspectionLine" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "notes" TEXT,

    CONSTRAINT "HousekeepingInspectionLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Room_propertyId_hkStage_idx" ON "Room"("propertyId", "hkStage");

-- CreateIndex
CREATE INDEX "HousekeepingInspection_propertyId_businessDate_idx" ON "HousekeepingInspection"("propertyId", "businessDate");

-- CreateIndex
CREATE INDEX "HousekeepingInspection_roomId_createdAt_idx" ON "HousekeepingInspection"("roomId", "createdAt");

-- CreateIndex
CREATE INDEX "HousekeepingInspectionLine_inspectionId_idx" ON "HousekeepingInspectionLine"("inspectionId");

-- AddForeignKey
ALTER TABLE "HousekeepingInspection" ADD CONSTRAINT "HousekeepingInspection_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HousekeepingInspection" ADD CONSTRAINT "HousekeepingInspection_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HousekeepingInspectionLine" ADD CONSTRAINT "HousekeepingInspectionLine_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "HousekeepingInspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
