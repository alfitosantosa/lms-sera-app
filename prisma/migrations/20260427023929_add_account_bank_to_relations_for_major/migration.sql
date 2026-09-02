/*
  Warnings:

  - Added the required column `majorId` to the `AccountBank` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AccountBank" ADD COLUMN     "majorId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_AccountBankToMajor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AccountBankToMajor_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AccountBankToMajor_B_index" ON "_AccountBankToMajor"("B");

-- AddForeignKey
ALTER TABLE "AccountBank" ADD CONSTRAINT "AccountBank_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "majors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountBankToMajor" ADD CONSTRAINT "_AccountBankToMajor_A_fkey" FOREIGN KEY ("A") REFERENCES "AccountBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountBankToMajor" ADD CONSTRAINT "_AccountBankToMajor_B_fkey" FOREIGN KEY ("B") REFERENCES "majors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
