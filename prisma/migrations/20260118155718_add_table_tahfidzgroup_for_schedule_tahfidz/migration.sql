-- DropForeignKey
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_classId_fkey";

-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "tahfidzGroupId" TEXT,
ALTER COLUMN "classId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_data" ADD COLUMN     "tahfidzGroupId" TEXT;

-- CreateTable
CREATE TABLE "tahfidz_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 40,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tahfidz_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tahfidz_groups_grade_idx" ON "tahfidz_groups"("grade");

-- CreateIndex
CREATE UNIQUE INDEX "tahfidz_groups_name_key" ON "tahfidz_groups"("name");

-- AddForeignKey
ALTER TABLE "user_data" ADD CONSTRAINT "user_data_tahfidzGroupId_fkey" FOREIGN KEY ("tahfidzGroupId") REFERENCES "tahfidz_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_tahfidzGroupId_fkey" FOREIGN KEY ("tahfidzGroupId") REFERENCES "tahfidz_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
