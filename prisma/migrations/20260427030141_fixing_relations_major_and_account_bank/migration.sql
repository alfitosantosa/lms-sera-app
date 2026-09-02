/*
  Warnings:

  - You are about to drop the `AccountBank` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AccountBankToMajor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AccountBankToMajor" DROP CONSTRAINT "_AccountBankToMajor_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccountBankToMajor" DROP CONSTRAINT "_AccountBankToMajor_B_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_accountBankId_fkey";

-- DropTable
DROP TABLE "AccountBank";

-- DropTable
DROP TABLE "_AccountBankToMajor";

-- CreateTable
CREATE TABLE "account_bank" (
    "id" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountBank" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "majorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_bank_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_accountBankId_fkey" FOREIGN KEY ("accountBankId") REFERENCES "account_bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_bank" ADD CONSTRAINT "account_bank_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "majors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
