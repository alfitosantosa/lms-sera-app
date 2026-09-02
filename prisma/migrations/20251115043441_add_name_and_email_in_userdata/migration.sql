/*
  Warnings:

  - Added the required column `name` to the `user_data` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_data" ADD COLUMN     "email" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;
