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
import { resolveFoundation, tenantForbidden } from "@/lib/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const t = await resolveFoundation(
    request,
    request.nextUrl.searchParams.get("foundationId"),
  );
  if (!t.ok) return t.response;

  const transactions = await prisma.paymentTransaction.findMany({
    where: { payment: { major: { foundationId: t.foundationId } } },
  });
  return NextResponse.json(transactions);
}

export async function POST(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const {
      paymentId,
      transactionId,
      orderId,
      grossAmount,
      paymentType,
      transactionTime,
      transactionStatus,
      fraudStatus,
      finishRedirectUrl,
    } = await request.json();

    const owned = await prisma.payment.findFirst({
      where: { id: paymentId, major: { foundationId: t.foundationId } },
      select: { id: true },
    });
    if (!owned) return tenantForbidden("Data tidak ditemukan di yayasan ini");

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
