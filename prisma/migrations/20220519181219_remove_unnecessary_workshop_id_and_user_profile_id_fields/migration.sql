/*
  Warnings:

  - You are about to drop the column `deviceToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordUpdated` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `userProfileId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `workshopId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_userProfileId_key";

-- DropIndex
DROP INDEX "User_workshopId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "deviceToken",
DROP COLUMN "passwordUpdated",
DROP COLUMN "userProfileId",
DROP COLUMN "workshopId";
