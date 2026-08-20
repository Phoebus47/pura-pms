-- CreateEnum
CREATE TYPE "GuestComplaintSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "GuestComplaintStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "GuestComplaint" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "guestId" TEXT,
    "reservationId" TEXT,
    "category" TEXT NOT NULL,
    "severity" "GuestComplaintSeverity" NOT NULL DEFAULT 'MEDIUM',
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "GuestComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "openedBy" TEXT NOT NULL,
    "assignedTo" TEXT,
    "resolutionNote" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "closedAt" TIMESTAMP(3),
    "closedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestComplaint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuestComplaint_propertyId_status_createdAt_idx" ON "GuestComplaint"("propertyId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "GuestComplaint_guestId_idx" ON "GuestComplaint"("guestId");

-- AddForeignKey
ALTER TABLE "GuestComplaint" ADD CONSTRAINT "GuestComplaint_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestComplaint" ADD CONSTRAINT "GuestComplaint_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestComplaint" ADD CONSTRAINT "GuestComplaint_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
