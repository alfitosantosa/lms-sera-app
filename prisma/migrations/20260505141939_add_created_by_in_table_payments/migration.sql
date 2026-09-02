/*
  Warnings:

  - Added the required column `BendaharaId` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "BendaharaId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_BendaharaId_fkey" FOREIGN KEY ("BendaharaId") REFERENCES "user_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
