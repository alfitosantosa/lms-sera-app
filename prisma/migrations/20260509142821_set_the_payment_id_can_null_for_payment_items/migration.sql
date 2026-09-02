-- DropForeignKey
ALTER TABLE "payment_items" DROP CONSTRAINT "payment_items_paymentId_fkey";

-- AlterTable
ALTER TABLE "payment_items" ALTER COLUMN "paymentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "payment_items" ADD CONSTRAINT "payment_items_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
