/*
  Warnings:

  - You are about to drop the column `paymentTypeId` on the `payments` table. All the data in the column will be lost.
  - Added the required column `majorId` to the `payment_types` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_paymentTypeId_fkey";

-- AlterTable
ALTER TABLE "payment_types" ADD COLUMN     "majorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "paymentTypeId";

-- CreateTable
CREATE TABLE "_PaymentToPaymentType" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PaymentToPaymentType_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PaymentToPaymentType_B_index" ON "_PaymentToPaymentType"("B");

-- AddForeignKey
ALTER TABLE "payment_types" ADD CONSTRAINT "payment_types_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "majors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaymentToPaymentType" ADD CONSTRAINT "_PaymentToPaymentType_A_fkey" FOREIGN KEY ("A") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaymentToPaymentType" ADD CONSTRAINT "_PaymentToPaymentType_B_fkey" FOREIGN KEY ("B") REFERENCES "payment_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
