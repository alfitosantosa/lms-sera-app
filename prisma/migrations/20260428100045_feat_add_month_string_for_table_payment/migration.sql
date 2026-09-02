/*
  Warnings:

  - You are about to drop the `_PaymentToPaymentType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `month` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_PaymentToPaymentType" DROP CONSTRAINT "_PaymentToPaymentType_A_fkey";

-- DropForeignKey
ALTER TABLE "_PaymentToPaymentType" DROP CONSTRAINT "_PaymentToPaymentType_B_fkey";

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "month" TEXT NOT NULL;

-- DropTable
DROP TABLE "_PaymentToPaymentType";
