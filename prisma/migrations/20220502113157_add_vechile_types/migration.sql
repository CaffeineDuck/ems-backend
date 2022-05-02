/*
  Warnings:

  - You are about to drop the column `service` on the `Workshop` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VechileType" AS ENUM ('B', 'S', 'C');

-- AlterTable
ALTER TABLE "Workshop" DROP COLUMN "service",
ADD COLUMN     "vechileTypes" "VechileType"[];

-- DropEnum
DROP TYPE "Service";

-- CreateTable
CREATE TABLE "UrgentService" (
    "id" SERIAL NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "vechileType" "VechileType" NOT NULL,
    "description" TEXT,
    "price" INTEGER,
    "endTime" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "workShopId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UrgentService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UrgentService_userId_key" ON "UrgentService"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UrgentService_workShopId_key" ON "UrgentService"("workShopId");

-- AddForeignKey
ALTER TABLE "UrgentService" ADD CONSTRAINT "UrgentService_workShopId_fkey" FOREIGN KEY ("workShopId") REFERENCES "Workshop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UrgentService" ADD CONSTRAINT "UrgentService_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
