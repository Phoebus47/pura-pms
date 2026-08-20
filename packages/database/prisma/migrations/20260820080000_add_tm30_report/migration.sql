-- CreateEnum
CREATE TYPE "Tm30Status" AS ENUM ('PENDING', 'SUBMITTED', 'CONFIRMED', 'FAILED');

-- CreateTable
CREATE TABLE "Tm30Report" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "passportNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "dateOfBirth" DATE,
    "roomNumber" TEXT NOT NULL,
    "arrivalDate" DATE NOT NULL,
    "departureDate" DATE,
    "addressInThailand" TEXT,
    "status" "Tm30Status" NOT NULL DEFAULT 'PENDING',
    "dueAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "referenceNo" TEXT,
    "generatedBy" TEXT NOT NULL,
    "submittedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tm30Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tm30Report_reservationId_guestId_key" ON "Tm30Report"("reservationId", "guestId");

-- CreateIndex
CREATE INDEX "Tm30Report_propertyId_status_arrivalDate_idx" ON "Tm30Report"("propertyId", "status", "arrivalDate");

-- CreateIndex
CREATE INDEX "Tm30Report_propertyId_dueAt_status_idx" ON "Tm30Report"("propertyId", "dueAt", "status");

-- AddForeignKey
ALTER TABLE "Tm30Report" ADD CONSTRAINT "Tm30Report_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tm30Report" ADD CONSTRAINT "Tm30Report_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tm30Report" ADD CONSTRAINT "Tm30Report_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
