-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "MessageChannel" AS ENUM ('IN_APP', 'SMS', 'EMAIL', 'WHATSAPP');

-- CreateTable
CREATE TABLE "GuestMessage" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "reservationId" TEXT,
    "direction" "MessageDirection" NOT NULL,
    "channel" "MessageChannel" NOT NULL DEFAULT 'IN_APP',
    "content" TEXT NOT NULL,
    "sentBy" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuestMessage_propertyId_createdAt_idx" ON "GuestMessage"("propertyId", "createdAt");

-- CreateIndex
CREATE INDEX "GuestMessage_guestId_createdAt_idx" ON "GuestMessage"("guestId", "createdAt");

-- AddForeignKey
ALTER TABLE "GuestMessage" ADD CONSTRAINT "GuestMessage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestMessage" ADD CONSTRAINT "GuestMessage_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestMessage" ADD CONSTRAINT "GuestMessage_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
