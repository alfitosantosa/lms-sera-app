// model Payment {
//   id                 String              @id @default(cuid())
//   studentId          String
//   amount             Decimal
//   dueDate            DateTime?
//   status             String              @default("pending")
//   notes              String?
//   createdAt          DateTime            @default(now())
//   paymentDate        DateTime
//   receiptNumber      String              @unique
//   accountBankId      String
//   transferDate       DateTime?
//   majorId            String
//   month              String
//   bendaharaId        String
//   bankRef            String?
//   paymentItems       PaymentItems[]
//   paymentTransaction PaymentTransaction?
//   accountBank        AccountBank         @relation(fields: [accountBankId], references: [id])
//   createdBy          UserData            @relation("CreatedPayment", fields: [bendaharaId], references: [id])
//   major              Major               @relation(fields: [majorId], references: [id])
//   student            UserData            @relation("StudentPayment", fields: [studentId], references: [id], onDelete: Cascade)

//   @@index([studentId])
//   @@index([majorId])
//   @@index([accountBankId])
//   @@index([bendaharaId])
//   @@index([status])
//   @@index([createdAt])
//   @@index([month])
//   @@map("payments")
// }

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// export async function GET() {
//   try {
//     // ✅ Optimized: Use select to fetch only needed fields
//     // - Dropped: student.class (never accessed), createdBy (only bendaharaId used)
//     // - Kept: all fields accessed in UI (student.name, major.name, accountBank, paymentItems with paymentType)
//     const payments = await prisma.payment.findMany({
//       select: {
//         id: true,
//         amount: true,
//         status: true,
//         createdAt: true,
//         dueDate: true,
//         receiptNumber: true,
//         month: true,
//         bankRef: true,
//         notes: true,
//         paymentDate: true,
//         student: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             parentPhone: true,
//             class: {
//               select: {
//                 name: true,
//               },
//             },
//           },
//         },
//         major: {
//           select: {
//             id: true,
//             name: true,
//             code: true,
//           },
//         },
//         accountBank: {
//           select: {
//             id: true,
//             accountNumber: true,
//             accountName: true,
//             accountBank: true,
//           },
//         },
//         paymentItems: {
//           select: {
//             id: true,
//             paymentId: true,
//             paymentTypeId: true,
//             amount: true,
//             quantity: true,
//             subtotal: true,
//             month: true,
//             year: true,
//             skuType: true,
//             name: true,
//             PaymentType: {
//               select: {
//                 id: true,
//                 name: true,
//               },
//             },
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });
//     return NextResponse.json(payments);
//   } catch (error) {
//     console.error("Error fetching payments:", error);
//     return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
//   }
// }

export async function POST(request: NextRequest) {
  try {
    const { studentId, amount, dueDate, status, notes, paymentDate, receiptNumber, accountBankId, majorId, month, bendaharaId, bankRef, transferDate } = await request.json();

    const newPayment = await prisma.payment.create({
      data: {
        studentId,
        bendaharaId,
        amount: parseFloat(amount),
        accountBankId,
        bankRef,
        majorId,
        month,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status,
        notes,
        paymentDate: new Date(paymentDate),
        transferDate: transferDate ? new Date(transferDate) : undefined,
        receiptNumber,
      },
      include: {
        createdBy: true,
        student: true,
        major: true,
        accountBank: true,
      },
    });

    return NextResponse.json(newPayment);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, studentId, amount, dueDate, status, notes, paymentDate, receiptNumber, accountBankId, majorId, month, bankRef, transferDate } = await request.json();

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        studentId,
        majorId,
        accountBankId,
        month,
        amount: parseFloat(amount),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status,
        notes,
        paymentDate: new Date(paymentDate),
        transferDate: transferDate ? new Date(transferDate) : undefined,
        receiptNumber,
        bankRef,
      },
      include: {
        student: true,
        major: true,
        accountBank: true,
      },
    });

    return NextResponse.json(updatedPayment);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // First, delete payment transaction if exists
    // await prisma.paymentTransaction.deleteMany({
    //   where: { paymentId: id },
    // });

    // Then, payment items edit  associated with this payment
    await prisma.paymentItems.updateMany({
      where: { paymentId: id },
      data: { paymentId: null, isPaid: false },
    });

    // Finally, delete the payment
    const deletedPayment = await prisma.payment.delete({
      where: { id },
    });

    return NextResponse.json(deletedPayment, { status: 200 });
  } catch (error) {
    return handlePrismaError(error);
  }
}
