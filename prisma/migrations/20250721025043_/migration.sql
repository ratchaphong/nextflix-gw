/*
  Warnings:

  - Made the column `updatedAt` on table `SubscriptionPackage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SubscriptionPackage" ALTER COLUMN "updatedAt" SET NOT NULL;
