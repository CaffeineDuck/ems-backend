/*
  Warnings:

  - You are about to drop the column `workShopId` on the `Rating` table. All the data in the column will be lost.
  - The primary key for the `UrgentService` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `distance` on the `UrgentService` table. All the data in the column will be lost.
  - You are about to drop the column `workShopId` on the `UrgentService` table. All the data in the column will be lost.
  - Added the required column `workshopId` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_workShopId_fkey";

-- DropForeignKey
ALTER TABLE "UrgentService" DROP CONSTRAINT "UrgentService_workShopId_fkey";

-- AlterTable
ALTER TABLE "Rating" DROP COLUMN "workShopId",
ADD COLUMN     "workshopId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UrgentService" DROP CONSTRAINT "UrgentService_pkey",
DROP COLUMN "distance",
DROP COLUMN "workShopId",
ADD COLUMN     "finalGeolocation" GEOGRAPHY(POINT),
ADD COLUMN     "workshopId" INTEGER,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "UrgentService_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "UrgentService_id_seq";

-- AddForeignKey
ALTER TABLE "UrgentService" ADD CONSTRAINT "UrgentService_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
