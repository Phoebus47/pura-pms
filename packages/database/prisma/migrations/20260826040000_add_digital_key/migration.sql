-- CreateEnum
CREATE TYPE "DigitalKeyTransport" AS ENUM ('BLE', 'NFC');

-- CreateEnum
CREATE TYPE "DigitalKeyStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateTable
CREATE TABLE "DigitalKey" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "transport" "DigitalKeyTransport" NOT NULL DEFAULT 'BLE',
    "status" "DigitalKeyStatus" NOT NULL DEFAULT 'ACTIVE',
    "issuedBy" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "revokedBy" TEXT,
    "revokedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DigitalKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DigitalKey_token_key" ON "DigitalKey"("token");

-- CreateIndex
CREATE INDEX "DigitalKey_propertyId_status_idx" ON "DigitalKey"("propertyId", "status");

-- CreateIndex
CREATE INDEX "DigitalKey_reservationId_status_idx" ON "DigitalKey"("reservationId", "status");

-- AddForeignKey
ALTER TABLE "DigitalKey" ADD CONSTRAINT "DigitalKey_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalKey" ADD CONSTRAINT "DigitalKey_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

