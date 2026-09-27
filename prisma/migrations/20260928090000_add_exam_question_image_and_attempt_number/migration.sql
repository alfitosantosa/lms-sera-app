-- AlterTable
ALTER TABLE "exam_attempt" ADD COLUMN     "attemptNumber" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "question" ADD COLUMN     "imageUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "exam_attempt_examId_studentId_attemptNumber_key" ON "exam_attempt"("examId", "studentId", "attemptNumber");
