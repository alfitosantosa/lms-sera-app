/*
  Warnings:

  - You are about to drop the `_AccountBankToPayment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `accountBankId` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `majorId` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_AccountBankToPayment" DROP CONSTRAINT "_AccountBankToPayment_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccountBankToPayment" DROP CONSTRAINT "_AccountBankToPayment_B_fkey";

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "accountBankId" TEXT NOT NULL,
ADD COLUMN     "majorId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_AccountBankToPayment";

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "majors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_accountBankId_fkey" FOREIGN KEY ("accountBankId") REFERENCES "AccountBank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
