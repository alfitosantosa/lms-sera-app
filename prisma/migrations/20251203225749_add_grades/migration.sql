/*
  Warnings:

  - You are about to drop the column `gradeType` on the `grades` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `grades` table. All the data in the column will be lost.
  - Added the required column `gradeTypeId` to the `grades` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "grades" DROP COLUMN "gradeType",
DROP COLUMN "weight",
ADD COLUMN     "gradeTypeId" TEXT NOT NULL,
ADD COLUMN     "title" TEXT;

-- CreateTable
CREATE TABLE "grade_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "weight" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_configurations" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT,
    "classId" TEXT,
    "academicYearId" TEXT NOT NULL,
    "gradeTypeId" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "minEntries" INTEGER NOT NULL DEFAULT 1,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_cards" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "taskAverage" DECIMAL(65,30),
    "dailyTestAverage" DECIMAL(65,30),
    "midExamScore" DECIMAL(65,30),
    "finalExamScore" DECIMAL(65,30),
    "practiceAverage" DECIMAL(65,30),
    "finalScore" DECIMAL(65,30) NOT NULL,
    "letterGrade" TEXT,
    "predicate" TEXT,
    "isPassed" BOOLEAN NOT NULL DEFAULT false,
    "teacherNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "report_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_scales" (
    "id" TEXT NOT NULL,
    "academicYearId" TEXT,
    "minScore" DECIMAL(65,30) NOT NULL,
    "maxScore" DECIMAL(65,30) NOT NULL,
    "letterGrade" TEXT NOT NULL,
    "predicate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_scales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "grade_types_code_key" ON "grade_types"("code");

-- CreateIndex
CREATE INDEX "grade_configurations_subjectId_idx" ON "grade_configurations"("subjectId");

-- CreateIndex
CREATE INDEX "grade_configurations_classId_idx" ON "grade_configurations"("classId");

-- CreateIndex
CREATE INDEX "grade_configurations_academicYearId_idx" ON "grade_configurations"("academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "grade_configurations_gradeTypeId_subjectId_classId_academic_key" ON "grade_configurations"("gradeTypeId", "subjectId", "classId", "academicYearId");

-- CreateIndex
CREATE INDEX "report_cards_studentId_idx" ON "report_cards"("studentId");

-- CreateIndex
CREATE INDEX "report_cards_subjectId_idx" ON "report_cards"("subjectId");

-- CreateIndex
CREATE INDEX "report_cards_classId_idx" ON "report_cards"("classId");

-- CreateIndex
CREATE INDEX "report_cards_academicYearId_idx" ON "report_cards"("academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "report_cards_studentId_subjectId_academicYearId_semester_key" ON "report_cards"("studentId", "subjectId", "academicYearId", "semester");

-- CreateIndex
CREATE INDEX "grade_scales_academicYearId_idx" ON "grade_scales"("academicYearId");

-- CreateIndex
CREATE INDEX "grades_gradeTypeId_idx" ON "grades"("gradeTypeId");

-- CreateIndex
CREATE INDEX "grades_date_idx" ON "grades"("date");

-- AddForeignKey
ALTER TABLE "grade_configurations" ADD CONSTRAINT "grade_configurations_gradeTypeId_fkey" FOREIGN KEY ("gradeTypeId") REFERENCES "grade_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_configurations" ADD CONSTRAINT "grade_configurations_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_configurations" ADD CONSTRAINT "grade_configurations_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_configurations" ADD CONSTRAINT "grade_configurations_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_gradeTypeId_fkey" FOREIGN KEY ("gradeTypeId") REFERENCES "grade_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_scales" ADD CONSTRAINT "grade_scales_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;
