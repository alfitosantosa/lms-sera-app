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
import { resolveFoundation, tenantForbidden } from "@/lib/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id, receiptNumber } = await request.json();

    const owned = await prisma.payment.findFirst({
      where: { id, branch: { foundationId: t.foundationId } },
      select: { id: true },
    });
    if (!owned) return tenantForbidden("Data tidak ditemukan di yayasan ini");

    //check receiptNumber in db
    // penomoran resi dicek global karena kolom receiptNumber unik global
    const checkReceipt = await prisma.payment.findFirst({
      where: { receiptNumber },
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
