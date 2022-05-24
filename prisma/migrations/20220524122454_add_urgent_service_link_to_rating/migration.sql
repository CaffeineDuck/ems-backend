/*
  Warnings:

  - A unique constraint covering the columns `[serviceId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[urgentServiceId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `serviceId` to the `Rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urgentServiceId` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "serviceId" TEXT NOT NULL,
ADD COLUMN     "urgentServiceId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Rating_serviceId_key" ON "Rating"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_urgentServiceId_key" ON "Rating"("urgentServiceId");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_urgentServiceId_fkey" FOREIGN KEY ("urgentServiceId") REFERENCES "UrgentService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
