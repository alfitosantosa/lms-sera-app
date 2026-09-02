-- CreateTable
CREATE TABLE "AccountBank" (
    "id" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountBank" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountBank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AccountBankToPayment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AccountBankToPayment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AccountBankToPayment_B_index" ON "_AccountBankToPayment"("B");

-- AddForeignKey
ALTER TABLE "_AccountBankToPayment" ADD CONSTRAINT "_AccountBankToPayment_A_fkey" FOREIGN KEY ("A") REFERENCES "AccountBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountBankToPayment" ADD CONSTRAINT "_AccountBankToPayment_B_fkey" FOREIGN KEY ("B") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
