-- DropForeignKey
ALTER TABLE "evidences" DROP CONSTRAINT "evidences_reportId_fkey";

-- DropIndex
DROP INDEX "evidences_reportId_idx";

-- AlterTable
ALTER TABLE "evidences" DROP COLUMN "reportId";
