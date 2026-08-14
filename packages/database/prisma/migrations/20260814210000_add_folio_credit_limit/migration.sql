-- AlterTable
ALTER TABLE "Property" ADD COLUMN "defaultCreditLimit" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Folio" ADD COLUMN "creditLimit" DECIMAL(12,2);
