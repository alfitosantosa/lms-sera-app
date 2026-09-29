-- CreateEnum
CREATE TYPE "AssessmentPeriodStatus" AS ENUM ('DRAFT', 'OPEN', 'LOCKED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "DailyLogStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWED');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO', 'LINK');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "assessment_periods" (
    "id" TEXT NOT NULL,
    "foundationId" TEXT NOT NULL,
    "academicYearId" TEXT,
    "name" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "AssessmentPeriodStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_scales" (
    "id" TEXT NOT NULL,
    "foundationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "value" INTEGER NOT NULL,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_scales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "development_areas" (
    "id" TEXT NOT NULL,
    "foundationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "development_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "development_indicators" (
    "id" TEXT NOT NULL,
    "developmentAreaId" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "development_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "foundationId" TEXT,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assessment_periods_foundationId_idx" ON "assessment_periods"("foundationId");

-- CreateIndex
CREATE INDEX "assessment_periods_status_idx" ON "assessment_periods"("status");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_periods_foundationId_academicYearId_semester_nam_key" ON "assessment_periods"("foundationId", "academicYearId", "semester", "name");

-- CreateIndex
CREATE INDEX "assessment_scales_foundationId_idx" ON "assessment_scales"("foundationId");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_scales_foundationId_code_key" ON "assessment_scales"("foundationId", "code");

-- CreateIndex
CREATE INDEX "development_areas_foundationId_idx" ON "development_areas"("foundationId");

-- CreateIndex
CREATE UNIQUE INDEX "development_areas_foundationId_name_key" ON "development_areas"("foundationId", "name");

-- CreateIndex
CREATE INDEX "development_indicators_developmentAreaId_idx" ON "development_indicators"("developmentAreaId");

-- CreateIndex
CREATE UNIQUE INDEX "development_indicators_developmentAreaId_name_key" ON "development_indicators"("developmentAreaId", "name");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_createdAt_idx" ON "audit_logs"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_foundationId_createdAt_idx" ON "audit_logs"("foundationId", "createdAt");

-- AddForeignKey
ALTER TABLE "assessment_periods" ADD CONSTRAINT "assessment_periods_foundationId_fkey" FOREIGN KEY ("foundationId") REFERENCES "foundation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_periods" ADD CONSTRAINT "assessment_periods_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_scales" ADD CONSTRAINT "assessment_scales_foundationId_fkey" FOREIGN KEY ("foundationId") REFERENCES "foundation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "development_areas" ADD CONSTRAINT "development_areas_foundationId_fkey" FOREIGN KEY ("foundationId") REFERENCES "foundation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "development_indicators" ADD CONSTRAINT "development_indicators_developmentAreaId_fkey" FOREIGN KEY ("developmentAreaId") REFERENCES "development_areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
