/*
  Warnings:

  - Made the column `availabilityId` on table `bookings` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_availabilityId_fkey";

-- DropIndex
DROP INDEX "bookings_availabilityId_key";

-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "availabilityId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "availability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
