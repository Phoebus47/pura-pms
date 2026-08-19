-- CreateEnum
CREATE TYPE "WakeUpCallStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'MISSED', 'CANCELLED');

-- CreateTable
CREATE TABLE "WakeUpCall" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "scheduledDate" DATE NOT NULL,
    "status" "WakeUpCallStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "scheduledBy" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "missedAt" TIMESTAMP(3),
    "missedBy" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" TEXT,
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WakeUpCall_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WakeUpCall_propertyId_scheduledDate_status_idx" ON "WakeUpCall"("propertyId", "scheduledDate", "status");

-- CreateIndex
CREATE INDEX "WakeUpCall_reservationId_scheduledDate_idx" ON "WakeUpCall"("reservationId", "scheduledDate");

-- AddForeignKey
ALTER TABLE "WakeUpCall" ADD CONSTRAINT "WakeUpCall_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WakeUpCall" ADD CONSTRAINT "WakeUpCall_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WakeUpCall" ADD CONSTRAINT "WakeUpCall_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
