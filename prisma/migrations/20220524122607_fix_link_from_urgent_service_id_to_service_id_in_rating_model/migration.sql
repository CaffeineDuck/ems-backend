/*
  Warnings:

  - You are about to drop the column `urgentServiceId` on the `Rating` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_urgentServiceId_fkey";

-- DropIndex
DROP INDEX "Rating_urgentServiceId_key";

-- AlterTable
ALTER TABLE "Rating" DROP COLUMN "urgentServiceId";

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "UrgentService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
