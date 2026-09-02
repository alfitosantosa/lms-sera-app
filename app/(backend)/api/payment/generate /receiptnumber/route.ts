// model Payment {
//   id            String      @id @default(cuid())
//   studentId     String
//   paymentTypeId String
//   amount        Decimal
//   dueDate       DateTime?
//   status        String      @default("pending")
//   notes         String?
//   createdAt     DateTime    @default(now())
//   updatedAt     DateTime    @updatedAt
//   paymentDate   DateTime
//   receiptNumber String?
//   paymentType   PaymentType @relation(fields: [paymentTypeId], references: [id])
//   student       UserData    @relation("StudentPayment", fields: [studentId], references: [id], onDelete: Cascade)

//   @@map("payments")
// }

// receiptNumber = oderid in midtrans;

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { id, receiptNumber } = await request.json();

    //check receiptNumber in db

    const checkReceipt = await prisma.payment.findFirst({
      where: receiptNumber,
    });

    if (!checkReceipt) {
      const newPayment = await prisma.payment.update({
        where: {
          id,
        },
        data: {
          status: "pending",
          receiptNumber,
        },
      });
      return NextResponse.json(newPayment);
    }
    if (checkReceipt) {
      return NextResponse.json({ message: "receipt number already exist" });
      // generarate again
    }
  } catch (error) {
    return handlePrismaError(error);
  }
}
