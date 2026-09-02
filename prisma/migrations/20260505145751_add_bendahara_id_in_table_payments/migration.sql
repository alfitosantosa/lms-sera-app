/*
  Warnings:

  - You are about to drop the column `BendaharaId` on the `payments` table. All the data in the column will be lost.
  - Added the required column `bendaharaId` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_BendaharaId_fkey";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "BendaharaId",
ADD COLUMN     "bendaharaId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bendaharaId_fkey" FOREIGN KEY ("bendaharaId") REFERENCES "user_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
