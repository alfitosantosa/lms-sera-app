/*
  Warnings:

  - You are about to drop the column `userId` on the `tahfidz_records` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tahfidz_records" DROP CONSTRAINT "tahfidz_records_userId_fkey";

-- DropForeignKey
ALTER TABLE "teacher_attendances" DROP CONSTRAINT "teacher_attendances_createdBy_fkey";

-- DropIndex
DROP INDEX "report_cards_studentId_subjectId_academicYearId_semester_key";

-- AlterTable
ALTER TABLE "tahfidz_records" DROP COLUMN "userId",
ADD COLUMN     "studentId" TEXT,
ADD COLUMN     "teacherId" TEXT;

-- AddForeignKey
ALTER TABLE "tahfidz_records" ADD CONSTRAINT "tahfidz_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahfidz_records" ADD CONSTRAINT "tahfidz_records_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "user_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_attendances" ADD CONSTRAINT "teacher_attendances_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;
