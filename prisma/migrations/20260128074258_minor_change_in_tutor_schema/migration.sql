/*
  Warnings:

  - You are about to drop the column `rating` on the `tutor_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tutor_profiles" DROP COLUMN "rating",
ADD COLUMN     "avgRating" DECIMAL(2,1) NOT NULL DEFAULT 0;
