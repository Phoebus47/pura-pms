-- CreateEnum
CREATE TYPE "HardwareDeviceType" AS ENUM ('PRINTER', 'KEY_CARD_ENCODER', 'PASSPORT_SCANNER', 'SMART_CARD_READER');

-- CreateEnum
CREATE TYPE "HardwareVendor" AS ENUM ('GENERIC', 'VINGCARD', 'SALTO', 'HAFELE');

-- CreateEnum
CREATE TYPE "HardwareJobType" AS ENUM ('PRINT', 'KEYCARD_ENCODE', 'PASSPORT_SCAN', 'ID_CARD_READ');

-- CreateEnum
CREATE TYPE "HardwareJobStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "HardwareAgent" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HardwareAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HardwareDevice" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "type" "HardwareDeviceType" NOT NULL,
    "vendor" "HardwareVendor" NOT NULL DEFAULT 'GENERIC',
    "label" TEXT NOT NULL,
    "externalId" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HardwareDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HardwareJob" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "agentId" TEXT,
    "deviceId" TEXT,
    "type" "HardwareJobType" NOT NULL,
    "status" "HardwareJobStatus" NOT NULL DEFAULT 'PENDING',
    "idempotencyKey" TEXT,
    "reservationId" TEXT,
    "requestedBy" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "result" JSONB,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HardwareJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HardwareAgent_propertyId_machineId_key" ON "HardwareAgent"("propertyId", "machineId");

-- CreateIndex
CREATE INDEX "HardwareAgent_propertyId_isActive_idx" ON "HardwareAgent"("propertyId", "isActive");

-- CreateIndex
CREATE INDEX "HardwareDevice_agentId_type_idx" ON "HardwareDevice"("agentId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "HardwareJob_idempotencyKey_key" ON "HardwareJob"("idempotencyKey");

-- CreateIndex
CREATE INDEX "HardwareJob_propertyId_status_createdAt_idx" ON "HardwareJob"("propertyId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "HardwareJob_agentId_createdAt_idx" ON "HardwareJob"("agentId", "createdAt");

-- AddForeignKey
ALTER TABLE "HardwareAgent" ADD CONSTRAINT "HardwareAgent_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HardwareDevice" ADD CONSTRAINT "HardwareDevice_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "HardwareAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HardwareJob" ADD CONSTRAINT "HardwareJob_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HardwareJob" ADD CONSTRAINT "HardwareJob_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "HardwareAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HardwareJob" ADD CONSTRAINT "HardwareJob_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "HardwareDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
