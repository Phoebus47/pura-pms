-- CreateTable
CREATE TABLE "PackageSplitRule" (
    "id" TEXT NOT NULL,
    "rateCode" TEXT NOT NULL,
    "trxCodeId" TEXT NOT NULL,
    "percent" DECIMAL(5,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackageSplitRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PackageSplitRule_rateCode_isActive_idx" ON "PackageSplitRule"("rateCode", "isActive");

-- AddForeignKey
ALTER TABLE "PackageSplitRule" ADD CONSTRAINT "PackageSplitRule_trxCodeId_fkey" FOREIGN KEY ("trxCodeId") REFERENCES "TransactionCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
