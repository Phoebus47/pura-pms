-- CreateTable
CREATE TABLE "RoomMove" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "fromRoomId" TEXT NOT NULL,
    "toRoomId" TEXT NOT NULL,
    "reason" TEXT,
    "movedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "movedBy" TEXT NOT NULL,
    "keyCardReissued" BOOLEAN NOT NULL DEFAULT true,
    "folioTransferred" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RoomMove_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoomMove_reservationId_movedAt_idx" ON "RoomMove"("reservationId", "movedAt");

-- AddForeignKey
ALTER TABLE "RoomMove" ADD CONSTRAINT "RoomMove_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMove" ADD CONSTRAINT "RoomMove_fromRoomId_fkey" FOREIGN KEY ("fromRoomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMove" ADD CONSTRAINT "RoomMove_toRoomId_fkey" FOREIGN KEY ("toRoomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
