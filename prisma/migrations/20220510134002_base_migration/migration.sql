-- Create Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'WORKSHOP', 'ADMIN');

-- CreateEnum
CREATE TYPE "VechileType" AS ENUM ('B', 'S', 'C');

-- CreateTable
CREATE TABLE "UrgentService" (
    "id" SERIAL NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "vechileType" "VechileType" NOT NULL,
    "started" BOOLEAN NOT NULL DEFAULT false,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "cancelled" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "price" INTEGER,
    "endTime" TIMESTAMP(3),
    "startTime" TIMESTAMP(3),
    "geolocation" GEOGRAPHY(POINT),
    "userId" TEXT NOT NULL,
    "workShopId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UrgentService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workshop" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "vechileTypes" "VechileType"[],
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "geolocation" GEOGRAPHY(POINT),
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workshop_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Rating" (
    "id" SERIAL NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "userId" TEXT NOT NULL,
    "workShopId" INTEGER NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "onBoarded" BOOLEAN NOT NULL DEFAULT false,
    "phoneNumber" TEXT NOT NULL,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT E'USER',
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "password" TEXT,
    "passwordUpdated" TIMESTAMP(3),
    "deviceToken" TEXT,
    "userProfileId" INTEGER,
    "workshopId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Workshop_ownerId_key" ON "Workshop"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkshopDocuments_citizenShipId_key" ON "WorkshopDocuments"("citizenShipId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkshopDocuments_panNumber_key" ON "WorkshopDocuments"("panNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WorkshopDocuments_vatNumber_key" ON "WorkshopDocuments"("vatNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WorkshopDocuments_workshopId_key" ON "WorkshopDocuments"("workshopId");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_userProfileId_key" ON "User"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "User_workshopId_key" ON "User"("workshopId");

-- AddForeignKey
ALTER TABLE "UrgentService" ADD CONSTRAINT "UrgentService_workShopId_fkey" FOREIGN KEY ("workShopId") REFERENCES "Workshop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UrgentService" ADD CONSTRAINT "UrgentService_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workshop" ADD CONSTRAINT "Workshop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkshopDocuments" ADD CONSTRAINT "WorkshopDocuments_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_workShopId_fkey" FOREIGN KEY ("workShopId") REFERENCES "Workshop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
