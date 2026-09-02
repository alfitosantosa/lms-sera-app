/*
  Warnings:

  - Added the required column `skuType` to the `payment_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payment_items" ADD COLUMN     "skuType" TEXT NOT NULL;
