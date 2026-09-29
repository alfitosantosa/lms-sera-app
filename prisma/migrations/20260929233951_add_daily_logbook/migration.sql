-- CreateTable
CREATE TABLE "daily_logs" (
    "id" TEXT NOT NULL,
    "foundationId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "activity" TEXT NOT NULL,
    "achievement" TEXT,
    "challenge" TEXT,
    "teacherNote" TEXT,
    "status" "DailyLogStatus" NOT NULL DEFAULT 'DRAFT',
    "parentVisible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_observations" (
    "id" TEXT NOT NULL,
    "dailyLogId" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "scaleId" TEXT,
    "observation" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidences" (
    "id" TEXT NOT NULL,
    "dailyLogId" TEXT,
    "assessmentId" TEXT,
    "submissionId" TEXT,
    "reportId" TEXT,
    "type" "EvidenceType" NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "title" TEXT,
    "description" TEXT,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_logs_foundationId_branchId_classId_idx" ON "daily_logs"("foundationId", "branchId", "classId");

-- CreateIndex
CREATE INDEX "daily_logs_studentId_date_idx" ON "daily_logs"("studentId", "date");

-- CreateIndex
CREATE INDEX "daily_logs_classId_date_idx" ON "daily_logs"("classId", "date");

-- CreateIndex
CREATE INDEX "daily_logs_teacherId_date_idx" ON "daily_logs"("teacherId", "date");

-- CreateIndex
CREATE INDEX "daily_observations_dailyLogId_idx" ON "daily_observations"("dailyLogId");

-- CreateIndex
CREATE INDEX "daily_observations_indicatorId_idx" ON "daily_observations"("indicatorId");

-- CreateIndex
CREATE INDEX "evidences_dailyLogId_idx" ON "evidences"("dailyLogId");

-- CreateIndex
CREATE INDEX "evidences_assessmentId_idx" ON "evidences"("assessmentId");

-- CreateIndex
CREATE INDEX "evidences_submissionId_idx" ON "evidences"("submissionId");

-- CreateIndex
CREATE INDEX "evidences_reportId_idx" ON "evidences"("reportId");

-- AddForeignKey
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_foundationId_fkey" FOREIGN KEY ("foundationId") REFERENCES "foundation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branchs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "user_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_observations" ADD CONSTRAINT "daily_observations_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "daily_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_observations" ADD CONSTRAINT "daily_observations_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "development_indicators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_observations" ADD CONSTRAINT "daily_observations_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "assessment_scales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidences" ADD CONSTRAINT "evidences_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "daily_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidences" ADD CONSTRAINT "evidences_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

