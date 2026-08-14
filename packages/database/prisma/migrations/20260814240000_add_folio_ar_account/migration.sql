-- AlterTable
ALTER TABLE "Folio" ADD COLUMN "arAccountId" TEXT;

-- CreateIndex
CREATE INDEX "Folio_arAccountId_idx" ON "Folio"("arAccountId");

-- AddForeignKey
ALTER TABLE "Folio" ADD CONSTRAINT "Folio_arAccountId_fkey" FOREIGN KEY ("arAccountId") REFERENCES "ARAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
