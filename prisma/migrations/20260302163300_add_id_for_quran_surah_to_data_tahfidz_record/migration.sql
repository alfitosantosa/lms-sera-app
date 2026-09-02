/*
  Warnings:

  - You are about to drop the column `surahQuran` on the `tahfidz_records` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tahfidz_records" DROP CONSTRAINT "tahfidz_records_surahQuran_fkey";

-- AlterTable
ALTER TABLE "tahfidz_records" DROP COLUMN "surahQuran",
ADD COLUMN     "surahQuranId" TEXT;

-- AddForeignKey
ALTER TABLE "tahfidz_records" ADD CONSTRAINT "tahfidz_records_surahQuranId_fkey" FOREIGN KEY ("surahQuranId") REFERENCES "surah_quran"("id") ON DELETE SET NULL ON UPDATE CASCADE;
