-- CreateEnum
CREATE TYPE "RegistrationCardStatus" AS ENUM ('DRAFT', 'SIGNED', 'VOID');

-- CreateTable
CREATE TABLE "RegistrationCard" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "RegistrationCardStatus" NOT NULL DEFAULT 'DRAFT',
    "guestSnapshot" JSONB NOT NULL,
    "staySnapshot" JSONB NOT NULL,
    "propertySnapshot" JSONB NOT NULL,
    "signatureData" TEXT,
    "signedAt" TIMESTAMP(3),
    "signedByGuestName" TEXT,
    "voidReason" TEXT,
    "voidedAt" TIMESTAMP(3),
    "voidedBy" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistrationCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RegistrationCard_reservationId_status_idx" ON "RegistrationCard"("reservationId", "status");

-- CreateIndex
CREATE INDEX "RegistrationCard_propertyId_createdAt_idx" ON "RegistrationCard"("propertyId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationCard_reservationId_version_key" ON "RegistrationCard"("reservationId", "version");

-- AddForeignKey
ALTER TABLE "RegistrationCard" ADD CONSTRAINT "RegistrationCard_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationCard" ADD CONSTRAINT "RegistrationCard_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
