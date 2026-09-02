/*
  Warnings:

  - Added the required column `isFixedAmount` to the `payment_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isFixedQuantity` to the `payment_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `payment_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `payment_types` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payment_types" ADD COLUMN     "isFixedAmount" BOOLEAN NOT NULL,
ADD COLUMN     "isFixedQuantity" BOOLEAN NOT NULL,
ADD COLUMN     "quantity" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "subtotal" DECIMAL(65,30) NOT NULL;

-- CreateTable
CREATE TABLE "PaymentItems" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "paymentTypeId" TEXT NOT NULL,
    "skuName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,

    CONSTRAINT "PaymentItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StudentPaymentItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_StudentPaymentItems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_StudentPaymentItems_B_index" ON "_StudentPaymentItems"("B");

-- AddForeignKey
ALTER TABLE "PaymentItems" ADD CONSTRAINT "PaymentItems_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentItems" ADD CONSTRAINT "PaymentItems_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentItems" ADD CONSTRAINT "PaymentItems_paymentTypeId_fkey" FOREIGN KEY ("paymentTypeId") REFERENCES "payment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentPaymentItems" ADD CONSTRAINT "_StudentPaymentItems_A_fkey" FOREIGN KEY ("A") REFERENCES "PaymentItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentPaymentItems" ADD CONSTRAINT "_StudentPaymentItems_B_fkey" FOREIGN KEY ("B") REFERENCES "user_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;
