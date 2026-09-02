/*
  Warnings:

  - You are about to drop the `_StudentPaymentItems` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_StudentPaymentItems" DROP CONSTRAINT "_StudentPaymentItems_A_fkey";

-- DropForeignKey
ALTER TABLE "_StudentPaymentItems" DROP CONSTRAINT "_StudentPaymentItems_B_fkey";

-- DropTable
DROP TABLE "_StudentPaymentItems";
