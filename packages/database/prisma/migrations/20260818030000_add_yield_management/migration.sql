-- CreateEnum
CREATE TYPE "YieldRecommendationStatus" AS ENUM ('PENDING', 'APPLIED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "YieldRecommendReason" AS ENUM ('HIGH_DEMAND', 'SLOW_PACE', 'COMP_UNDERCUT');

-- CreateTable
CREATE TABLE "CompetitorRate" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "competitorName" TEXT NOT NULL,
    "roomTypeId" TEXT,
    "stayDate" DATE NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitorRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YieldRecommendation" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "rateId" TEXT NOT NULL,
    "stayDate" DATE NOT NULL,
    "currentAmount" DECIMAL(10,2) NOT NULL,
    "recommendedAmount" DECIMAL(10,2) NOT NULL,
    "occupancyPct" DECIMAL(5,2) NOT NULL,
    "paceDeltaPct" DECIMAL(6,2),
    "competitorAmount" DECIMAL(10,2),
    "reason" "YieldRecommendReason" NOT NULL,
    "status" "YieldRecommendationStatus" NOT NULL DEFAULT 'PENDING',
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YieldRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompetitorRate_propertyId_stayDate_idx" ON "CompetitorRate"("propertyId", "stayDate");

-- CreateIndex
CREATE INDEX "CompetitorRate_roomTypeId_stayDate_idx" ON "CompetitorRate"("roomTypeId", "stayDate");

-- CreateIndex
CREATE INDEX "YieldRecommendation_propertyId_status_idx" ON "YieldRecommendation"("propertyId", "status");

-- CreateIndex
CREATE INDEX "YieldRecommendation_propertyId_stayDate_idx" ON "YieldRecommendation"("propertyId", "stayDate");

-- CreateIndex
CREATE INDEX "YieldRecommendation_rateId_stayDate_idx" ON "YieldRecommendation"("rateId", "stayDate");

-- AddForeignKey
ALTER TABLE "CompetitorRate" ADD CONSTRAINT "CompetitorRate_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorRate" ADD CONSTRAINT "CompetitorRate_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YieldRecommendation" ADD CONSTRAINT "YieldRecommendation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YieldRecommendation" ADD CONSTRAINT "YieldRecommendation_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YieldRecommendation" ADD CONSTRAINT "YieldRecommendation_rateId_fkey" FOREIGN KEY ("rateId") REFERENCES "Rate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
