-- AlterEnum
ALTER TYPE "ReservationStatus" ADD VALUE 'WALKED';

-- CreateTable
CREATE TABLE "PartnerHotel" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "contactPerson" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerHotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Walk" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "partnerHotelId" TEXT NOT NULL,
    "reason" TEXT,
    "cost" DECIMAL(12,2) NOT NULL,
    "compensationAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "compensationNotes" TEXT,
    "walkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "walkedBy" TEXT NOT NULL,

    CONSTRAINT "Walk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartnerHotel_propertyId_name_key" ON "PartnerHotel"("propertyId", "name");

-- CreateIndex
CREATE INDEX "PartnerHotel_propertyId_isActive_idx" ON "PartnerHotel"("propertyId", "isActive");

-- CreateIndex
CREATE INDEX "Walk_reservationId_walkedAt_idx" ON "Walk"("reservationId", "walkedAt");

-- CreateIndex
CREATE INDEX "Walk_partnerHotelId_idx" ON "Walk"("partnerHotelId");

-- AddForeignKey
ALTER TABLE "PartnerHotel" ADD CONSTRAINT "PartnerHotel_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Walk" ADD CONSTRAINT "Walk_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Walk" ADD CONSTRAINT "Walk_partnerHotelId_fkey" FOREIGN KEY ("partnerHotelId") REFERENCES "PartnerHotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
