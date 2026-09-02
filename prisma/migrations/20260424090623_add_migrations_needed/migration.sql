/*
  Warnings:

  - You are about to drop the `PaymentItems` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PaymentItems" DROP CONSTRAINT "PaymentItems_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentItems" DROP CONSTRAINT "PaymentItems_paymentTypeId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentItems" DROP CONSTRAINT "PaymentItems_studentId_fkey";

-- DropForeignKey
ALTER TABLE "_StudentPaymentItems" DROP CONSTRAINT "_StudentPaymentItems_A_fkey";

-- DropTable
DROP TABLE "PaymentItems";

-- CreateTable
CREATE TABLE "payment_items" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "paymentTypeId" TEXT NOT NULL,
    "skuName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,

    CONSTRAINT "payment_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payment_items" ADD CONSTRAINT "payment_items_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_items" ADD CONSTRAINT "payment_items_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_items" ADD CONSTRAINT "payment_items_paymentTypeId_fkey" FOREIGN KEY ("paymentTypeId") REFERENCES "payment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentPaymentItems" ADD CONSTRAINT "_StudentPaymentItems_A_fkey" FOREIGN KEY ("A") REFERENCES "payment_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
