-- CreateEnum
CREATE TYPE "CardPreauthStatus" AS ENUM ('HELD', 'INCREMENTAL', 'CAPTURED', 'RELEASED', 'EXPIRED');

-- CreateTable
CREATE TABLE "CardPreauth" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "CardPreauthStatus" NOT NULL DEFAULT 'HELD',
    "last4" TEXT NOT NULL,
    "expiryMonth" INTEGER NOT NULL,
    "expiryYear" INTEGER NOT NULL,
    "manualRef" TEXT NOT NULL,
    "capturedAmount" DECIMAL(12,2),
    "folioId" TEXT,
    "folioTransactionId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardPreauth_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CardPreauth_reservationId_status_idx" ON "CardPreauth"("reservationId", "status");

ALTER TABLE "CardPreauth" ADD CONSTRAINT "CardPreauth_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
