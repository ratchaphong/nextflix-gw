-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subscriptionPackageId" TEXT;

-- CreateTable
CREATE TABLE "SubscriptionPackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "maxProfiles" INTEGER NOT NULL,
    "maxMembers" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "resolution" TEXT NOT NULL,

    CONSTRAINT "SubscriptionPackage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_subscriptionPackageId_fkey" FOREIGN KEY ("subscriptionPackageId") REFERENCES "SubscriptionPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
