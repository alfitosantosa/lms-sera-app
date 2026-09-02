-- AlterTable
ALTER TABLE "academic_years" ALTER COLUMN "isActive" SET DEFAULT true;

-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "user_data" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
