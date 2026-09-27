-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'ESSAY');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'GRADED');

-- CreateTable
CREATE TABLE "exam" (
    "id" TEXT NOT NULL,
    "foundationId" TEXT NOT NULL,
    "majorId" TEXT,
    "classId" TEXT,
    "subjectId" TEXT,
    "createdBy" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER,
    "passingScore" INTEGER,
    "status" "ExamStatus" NOT NULL DEFAULT 'DRAFT',
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_question" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "exam_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "question" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_option" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "option" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "question_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_attempt" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "score" INTEGER,

    CONSTRAINT "exam_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_answer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptionId" TEXT,
    "answerText" TEXT,
    "isCorrect" BOOLEAN,
    "points" INTEGER,

    CONSTRAINT "exam_answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exam_foundationId_idx" ON "exam"("foundationId");

-- CreateIndex
CREATE INDEX "exam_majorId_idx" ON "exam"("majorId");

-- CreateIndex
CREATE INDEX "exam_classId_idx" ON "exam"("classId");

-- CreateIndex
CREATE INDEX "exam_subjectId_idx" ON "exam"("subjectId");

-- CreateIndex
CREATE INDEX "exam_createdBy_idx" ON "exam"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "exam_question_examId_questionId_key" ON "exam_question"("examId", "questionId");

-- CreateIndex
CREATE INDEX "exam_attempt_examId_idx" ON "exam_attempt"("examId");

-- CreateIndex
CREATE INDEX "exam_attempt_studentId_idx" ON "exam_attempt"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_answer_attemptId_questionId_key" ON "exam_answer"("attemptId", "questionId");

-- AddForeignKey
ALTER TABLE "exam" ADD CONSTRAINT "exam_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_question" ADD CONSTRAINT "exam_question_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_question" ADD CONSTRAINT "exam_question_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_option" ADD CONSTRAINT "question_option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempt" ADD CONSTRAINT "exam_attempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempt" ADD CONSTRAINT "exam_attempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_answer" ADD CONSTRAINT "exam_answer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "exam_attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_answer" ADD CONSTRAINT "exam_answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_answer" ADD CONSTRAINT "exam_answer_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "question_option"("id") ON DELETE SET NULL ON UPDATE CASCADE;
