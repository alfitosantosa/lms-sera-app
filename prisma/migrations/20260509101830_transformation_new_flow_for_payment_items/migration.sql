/*
  Warnings:

  - You are about to drop the column `skuName` on the `payment_items` table. All the data in the column will be lost.
  - You are about to drop the column `studentName` on the `payment_items` table. All the data in the column will be lost.
  - Added the required column `isFixedAmount` to the `payment_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isFixedQuantity` to the `payment_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month` to the `payment_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `payment_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `payment_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skuType` to the `payment_types` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payment_items" DROP COLUMN "skuName",
DROP COLUMN "studentName",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isFixedAmount" BOOLEAN NOT NULL,
ADD COLUMN     "isFixedQuantity" BOOLEAN NOT NULL,
ADD COLUMN     "isMonthly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "month" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "year" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "payment_types" ADD COLUMN     "skuType" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "payment_types_majorId_idx" ON "payment_types"("majorId");

-- CreateIndex
CREATE INDEX "payment_types_owner_idx" ON "payment_types"("owner");
