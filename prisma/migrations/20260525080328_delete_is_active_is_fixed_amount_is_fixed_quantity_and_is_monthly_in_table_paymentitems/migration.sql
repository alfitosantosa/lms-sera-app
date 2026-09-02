/*
  Warnings:

  - You are about to drop the column `isActive` on the `payment_items` table. All the data in the column will be lost.
  - You are about to drop the column `isFixedAmount` on the `payment_items` table. All the data in the column will be lost.
  - You are about to drop the column `isFixedQuantity` on the `payment_items` table. All the data in the column will be lost.
  - You are about to drop the column `isMonthly` on the `payment_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payment_items" DROP COLUMN "isActive",
DROP COLUMN "isFixedAmount",
DROP COLUMN "isFixedQuantity",
DROP COLUMN "isMonthly";
