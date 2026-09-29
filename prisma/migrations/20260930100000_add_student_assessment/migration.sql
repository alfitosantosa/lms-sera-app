-- CreateTable
CREATE TABLE "student_assessments" (
    "id" TEXT NOT NULL,
    "foundationId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "scaleId" TEXT NOT NULL,
    "score" DECIMAL(65,30),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_assessments_foundationId_branchId_classId_idx" ON "student_assessments"("foundationId", "branchId", "classId");

-- CreateIndex
CREATE INDEX "student_assessments_studentId_periodId_idx" ON "student_assessments"("studentId", "periodId");

-- CreateIndex
CREATE INDEX "student_assessments_classId_periodId_idx" ON "student_assessments"("classId", "periodId");

-- CreateIndex
CREATE UNIQUE INDEX "student_assessments_studentId_periodId_indicatorId_key" ON "student_assessments"("studentId", "periodId", "indicatorId");

-- AddForeignKey
ALTER TABLE "evidences" ADD CONSTRAINT "evidences_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "student_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_assessments" ADD CONSTRAINT "student_assessments_foundationId_fkey" FOREIGN KEY ("foundationId") REFERENCES "foundation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_assessments" ADD CONSTRAINT "student_assessments_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branchs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_assessments" ADD CONSTRAINT "student_assessments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_assessments" ADD CONSTRAINT "student_assessments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_assessments" ADD CONSTRAINT "student_assessments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "user_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_assessments" ADD CONSTRAINT "student_assessments_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "assessment_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_assessments" ADD CONSTRAINT "student_assessments_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "development_indicators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_assessments" ADD CONSTRAINT "student_assessments_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "assessment_scales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
