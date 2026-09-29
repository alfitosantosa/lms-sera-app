-- CreateTable
CREATE TABLE "student_reports" (
    "id" TEXT NOT NULL,
    "foundationId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "teacherNarrative" TEXT,
    "homeroomNote" TEXT,
    "principalNote" TEXT,
    "snapshot" JSONB,
    "completion" JSONB,
    "generatedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_reports_foundationId_branchId_classId_idx" ON "student_reports"("foundationId", "branchId", "classId");

-- CreateIndex
CREATE INDEX "student_reports_classId_periodId_idx" ON "student_reports"("classId", "periodId");

-- CreateIndex
CREATE INDEX "student_reports_status_idx" ON "student_reports"("status");

-- CreateIndex
CREATE UNIQUE INDEX "student_reports_studentId_periodId_key" ON "student_reports"("studentId", "periodId");

-- AddForeignKey
ALTER TABLE "evidences" ADD CONSTRAINT "evidences_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "student_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_reports" ADD CONSTRAINT "student_reports_foundationId_fkey" FOREIGN KEY ("foundationId") REFERENCES "foundation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_reports" ADD CONSTRAINT "student_reports_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branchs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_reports" ADD CONSTRAINT "student_reports_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_reports" ADD CONSTRAINT "student_reports_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_reports" ADD CONSTRAINT "student_reports_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "assessment_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_reports" ADD CONSTRAINT "student_reports_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "user_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

