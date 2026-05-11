-- DropForeignKey
ALTER TABLE "subjects" DROP CONSTRAINT "subjects_categoryId_fkey";

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
