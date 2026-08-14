-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN "propertyId" TEXT;

UPDATE "JournalEntry"
SET "propertyId" = (SELECT id FROM "Property" ORDER BY "createdAt" ASC LIMIT 1)
WHERE "propertyId" IS NULL;

DELETE FROM "JournalEntry" WHERE "propertyId" IS NULL;

ALTER TABLE "JournalEntry" ALTER COLUMN "propertyId" SET NOT NULL;

UPDATE "JournalEntry" SET "source" = 'MANUAL' WHERE "source" IS NULL;

ALTER TABLE "JournalEntry" ALTER COLUMN "source" SET NOT NULL;

ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "JournalEntry_propertyId_entryDate_source_key" ON "JournalEntry"("propertyId", "entryDate", "source");

CREATE INDEX "JournalEntry_propertyId_entryDate_idx" ON "JournalEntry"("propertyId", "entryDate");
