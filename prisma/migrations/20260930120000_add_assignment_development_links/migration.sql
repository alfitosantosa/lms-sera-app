ALTER TABLE "assignments" ADD COLUMN     "developmentAreaId" TEXT,
ADD COLUMN     "indicatorId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "grades_studentId_scheduleId_gradeTypeId_title_key" ON "grades"("studentId", "scheduleId", "gradeTypeId", "title");

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_developmentAreaId_fkey" FOREIGN KEY ("developmentAreaId") REFERENCES "development_areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "development_indicators"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidences" ADD CONSTRAINT "evidences_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "assignment_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

