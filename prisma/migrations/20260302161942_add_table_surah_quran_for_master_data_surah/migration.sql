/*
  Warnings:

  - You are about to drop the column `surah` on the `tahfidz_records` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tahfidz_records" DROP COLUMN "surah",
ADD COLUMN     "surahQuran" TEXT;

-- CreateTable
CREATE TABLE "surah_quran" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameLatin" TEXT NOT NULL,
    "verseCount" INTEGER NOT NULL,
    "revelationPlace" TEXT NOT NULL,

    CONSTRAINT "surah_quran_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tahfidz_records" ADD CONSTRAINT "tahfidz_records_surahQuran_fkey" FOREIGN KEY ("surahQuran") REFERENCES "surah_quran"("id") ON DELETE SET NULL ON UPDATE CASCADE;
