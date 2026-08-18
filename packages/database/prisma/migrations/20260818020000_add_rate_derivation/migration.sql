-- CreateEnum
CREATE TYPE "RateDeriveMode" AS ENUM ('PERCENT_OFFSET', 'AMOUNT_OFFSET');

-- AlterTable
ALTER TABLE "Rate" ADD COLUMN "parentRateId" TEXT;
ALTER TABLE "Rate" ADD COLUMN "deriveMode" "RateDeriveMode";
ALTER TABLE "Rate" ADD COLUMN "deriveValue" DECIMAL(10,4);

-- CreateIndex
CREATE INDEX "Rate_parentRateId_idx" ON "Rate"("parentRateId");
CREATE INDEX "Rate_propertyId_code_idx" ON "Rate"("propertyId", "code");

-- AddForeignKey
ALTER TABLE "Rate" ADD CONSTRAINT "Rate_parentRateId_fkey" FOREIGN KEY ("parentRateId") REFERENCES "Rate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
