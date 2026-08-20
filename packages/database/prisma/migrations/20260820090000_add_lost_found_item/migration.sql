-- CreateEnum
CREATE TYPE "LostFoundStatus" AS ENUM ('FOUND', 'CLAIMED', 'RETURNED', 'DISPOSED');

-- CreateTable
CREATE TABLE "LostFoundItem" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "itemDescription" TEXT NOT NULL,
    "locationFound" TEXT NOT NULL,
    "roomNumber" TEXT,
    "foundBy" TEXT NOT NULL,
    "foundAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "guestId" TEXT,
    "status" "LostFoundStatus" NOT NULL DEFAULT 'FOUND',
    "claimedAt" TIMESTAMP(3),
    "claimedBy" TEXT,
    "returnedAt" TIMESTAMP(3),
    "returnedTo" TEXT,
    "disposedAt" TIMESTAMP(3),
    "disposedBy" TEXT,
    "disposeReason" TEXT,
    "retentionDays" INTEGER NOT NULL DEFAULT 90,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LostFoundItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LostFoundItem_propertyId_status_foundAt_idx" ON "LostFoundItem"("propertyId", "status", "foundAt");

-- AddForeignKey
ALTER TABLE "LostFoundItem" ADD CONSTRAINT "LostFoundItem_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostFoundItem" ADD CONSTRAINT "LostFoundItem_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
