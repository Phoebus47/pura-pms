-- CreateTable
CREATE TABLE "ReservationStay" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "nights" INTEGER NOT NULL,
    "roomId" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "roomRate" DECIMAL(10,2) NOT NULL,
    "rateCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReservationStay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReservationStay_reservationId_sequence_key" ON "ReservationStay"("reservationId", "sequence");

-- CreateIndex
CREATE INDEX "ReservationStay_reservationId_startDate_idx" ON "ReservationStay"("reservationId", "startDate");

-- CreateIndex
CREATE INDEX "ReservationStay_roomId_startDate_endDate_idx" ON "ReservationStay"("roomId", "startDate", "endDate");

-- AddForeignKey
ALTER TABLE "ReservationStay" ADD CONSTRAINT "ReservationStay_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationStay" ADD CONSTRAINT "ReservationStay_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationStay" ADD CONSTRAINT "ReservationStay_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
