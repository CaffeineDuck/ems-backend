-- AlterTable
ALTER TABLE "UrgentService" ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "cancelledBy" "Role",
ADD COLUMN     "reachedDestination" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rejected" BOOLEAN NOT NULL DEFAULT false;
