/*
  Warnings:

  - You are about to drop the column `createdBy` on the `dashboard_contents` table. All the data in the column will be lost.
  - You are about to drop the `_ParentStudent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ParentStudent" DROP CONSTRAINT "_ParentStudent_A_fkey";

-- DropForeignKey
ALTER TABLE "_ParentStudent" DROP CONSTRAINT "_ParentStudent_B_fkey";

-- AlterTable
ALTER TABLE "dashboard_contents" DROP COLUMN "createdBy",
ADD COLUMN     "userId" TEXT;

-- DropTable
DROP TABLE "_ParentStudent";

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "linkUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tahfidz_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "surah" TEXT,
    "startVerse" INTEGER,
    "endVerse" INTEGER,
    "grade" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tahfidz_records_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dashboard_contents" ADD CONSTRAINT "dashboard_contents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahfidz_records" ADD CONSTRAINT "tahfidz_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;
