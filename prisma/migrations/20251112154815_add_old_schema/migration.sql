/*
  Warnings:

  - You are about to drop the `UserDatas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserDatas" DROP CONSTRAINT "UserDatas_academicYearId_fkey";

-- DropForeignKey
ALTER TABLE "UserDatas" DROP CONSTRAINT "UserDatas_classId_fkey";

-- DropForeignKey
ALTER TABLE "UserDatas" DROP CONSTRAINT "UserDatas_majorId_fkey";

-- DropForeignKey
ALTER TABLE "UserDatas" DROP CONSTRAINT "UserDatas_roleId_fkey";

-- DropForeignKey
ALTER TABLE "UserDatas" DROP CONSTRAINT "UserDatas_userId_fkey";

-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_studentId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_studentId_fkey";

-- DropForeignKey
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "violations" DROP CONSTRAINT "violations_studentId_fkey";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "UserDatas";

-- CreateTable
CREATE TABLE "user_data" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "academicYearId" TEXT,
    "address" TEXT,
    "avatarUrl" TEXT,
    "birthDate" TIMESTAMP(3),
    "birthPlace" TEXT,
    "classId" TEXT,
    "employeeId" TEXT,
    "endDate" TIMESTAMP(3),
    "enrollmentDate" TIMESTAMP(3),
    "gender" TEXT,
    "graduationDate" TIMESTAMP(3),
    "majorId" TEXT,
    "nik" TEXT,
    "nisn" TEXT,
    "parentPhone" TEXT,
    "position" TEXT,
    "relation" TEXT,
    "roleId" TEXT,
    "startDate" TIMESTAMP(3),
    "status" TEXT DEFAULT 'active',
    "studentIds" TEXT[],

    CONSTRAINT "user_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ParentStudent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ParentStudent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_data_id_key" ON "user_data"("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_data_userId_key" ON "user_data"("userId");

-- CreateIndex
CREATE INDEX "_ParentStudent_B_index" ON "_ParentStudent"("B");

-- AddForeignKey
ALTER TABLE "user_data" ADD CONSTRAINT "user_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_data" ADD CONSTRAINT "user_data_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_data" ADD CONSTRAINT "user_data_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_data" ADD CONSTRAINT "user_data_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "majors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_data" ADD CONSTRAINT "user_data_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "user_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "violations" ADD CONSTRAINT "violations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParentStudent" ADD CONSTRAINT "_ParentStudent_A_fkey" FOREIGN KEY ("A") REFERENCES "user_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParentStudent" ADD CONSTRAINT "_ParentStudent_B_fkey" FOREIGN KEY ("B") REFERENCES "user_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;
