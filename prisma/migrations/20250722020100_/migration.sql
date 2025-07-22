/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `HouseholdMember` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "HouseholdMember" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "HouseholdMember_userId_key" ON "HouseholdMember"("userId");

-- AddForeignKey
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
