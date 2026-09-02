/*
  Warnings:

  - You are about to alter the column `quantity` on the `payment_types` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "payment_items" ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "payment_types" ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION;
