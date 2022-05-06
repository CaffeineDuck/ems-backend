-- AlterTable
ALTER TABLE "Workshop" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "WorkshopDocuments" (
    "id" SERIAL NOT NULL,
    "citizenShipId" TEXT NOT NULL,
    "citizenshipImage" TEXT NOT NULL,
    "panNumber" TEXT NOT NULL,
    "panImage" TEXT NOT NULL,
    "vatNumber" TEXT NOT NULL,
    "vatImage" TEXT NOT NULL,
    "shopImage" TEXT NOT NULL,
    "workshopId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkshopDocuments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkshopDocuments_citizenShipId_key" ON "WorkshopDocuments"("citizenShipId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkshopDocuments_panNumber_key" ON "WorkshopDocuments"("panNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WorkshopDocuments_vatNumber_key" ON "WorkshopDocuments"("vatNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WorkshopDocuments_workshopId_key" ON "WorkshopDocuments"("workshopId");

-- AddForeignKey
ALTER TABLE "WorkshopDocuments" ADD CONSTRAINT "WorkshopDocuments_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
