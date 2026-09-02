// model PaymentTransaction {
//   id                String   @id @default(cuid())
//   paymentId         String   @unique
//   transactionId     String   @unique
//   orderId           String   @unique
//   grossAmount       Decimal
//   paymentType       String
//   transactionTime   DateTime
//   transactionStatus String
//   fraudStatus       String
//   finishRedirectUrl String
//   createdAt         DateTime @default(now())
//   payment           Payment  @relation(fields: [paymentId], references: [id], onDelete: Cascade)

//   @@map("payment_transactions")
// }

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const transactions = await prisma.paymentTransaction.findMany();
  return NextResponse.json(transactions);
}

export async function POST(request: NextRequest) {
  try {
    const { paymentId, transactionId, orderId, grossAmount, paymentType, transactionTime, transactionStatus, fraudStatus, finishRedirectUrl } = await request.json();

    const newTransaction = await prisma.paymentTransaction.create({
      data: {
        paymentId,
        transactionId,
        orderId,
        grossAmount: Number(grossAmount),
        paymentType,
        transactionTime: new Date(transactionTime),
        transactionStatus,
        fraudStatus,
        finishRedirectUrl,
      },
    });

    return NextResponse.json(newTransaction);
  } catch (error) {
    return handlePrismaError(error);
  }
}
