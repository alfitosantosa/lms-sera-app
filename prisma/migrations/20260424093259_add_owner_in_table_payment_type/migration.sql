/*
  Warnings:

  - Added the required column `owner` to the `payment_types` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payment_types" ADD COLUMN     "owner" TEXT NOT NULL;
