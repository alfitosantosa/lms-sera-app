// model PaymentItems {
//   id              String      @id  @default(uuid())
//   paymentId       String?     // ✅ NULLABLE
//   studentId       String
//   name            String
//   skuType         String
//   paymentTypeId   String
//   month           String
//   year            String
//   isPaid          Boolean      @default(false)
//   isMonthly       Boolean      @default(false)
//   isActive        Boolean      @default(true)
//   isFixedAmount   Boolean
//   isFixedQuantity Boolean
//   quantity        Int
//   amount          Int
//   subtotal        Int

//   payment         Payment?    @relation(fields: [paymentId], references: [id])
//   PaymentType     PaymentType @relation(fields: [paymentTypeId], references: [id])
//   student         UserData    @relation(fields: [studentId], references: [id])

//   @@map("payment_items")
// }

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, skuType, paymentTypeId, month, year, isPaid, isMonthly, isActive, isFixedAmount, isFixedQuantity, quantity, amount, subtotal, classId } = await request.json();

    if (!name || !paymentTypeId || !month || !year || !quantity || !amount || !subtotal) {
      return NextResponse.json({ error: "name, paymentTypeId, month, year, quantity, amount, and subtotal are required" }, { status: 400 });
    }

    let students;

    if (classId === "all") {
      students = await prisma.userData.findMany({
        where: {
          role: {
            name: "Student",
          },
        },
      });
    } else {
      students = await prisma.userData.findMany({
        where: {
          classId: classId,
          role: {
            name: "Student",
          },
        },
      });
    }

    const newPaymentItemBulk = await prisma.paymentItems.createMany({
      data: students.map((student) => ({
        name,
        skuType,
        paymentTypeId,
        month,
        year,
        isPaid: typeof isPaid === "boolean" ? isPaid : isPaid === "true",
        isMonthly: typeof isMonthly === "boolean" ? isMonthly : isMonthly === "true",
        isActive: typeof isActive === "boolean" ? isActive : isActive === "true",
        isFixedAmount: typeof isFixedAmount === "boolean" ? isFixedAmount : isFixedAmount === "true",
        isFixedQuantity: typeof isFixedQuantity === "boolean" ? isFixedQuantity : isFixedQuantity === "true",
        quantity: parseInt(quantity),
        amount: parseInt(amount),
        subtotal: parseInt(subtotal),
        studentId: student.id,
      })),
    });

    return NextResponse.json(newPaymentItemBulk);
  } catch (error) {
    return handlePrismaError(error);
  }
}

//     if (!classId || !paymentTypeId || !amount || !paymentDate || !accountBankId || !month) {
//       return NextResponse.json({ error: "classId, paymentTypeId, amount, paymentDate, accountBankId, and month are required" }, { status: 400 });
//     }

//     const parsedPaymentDate = new Date(paymentDate);
//     if (isNaN(parsedPaymentDate.getTime())) {
//       return NextResponse.json({ error: "Invalid paymentDate" }, { status: 400 });
//     }

//     let students;

//     if (classId === "all") {
//       students = await prisma.userData.findMany({
//         where: {
//           role: {
//             name: "Student",
//           },
//         },
//       });
//     } else {
//       students = await prisma.userData.findMany({
//         where: {
//           classId: classId,
//           role: {
//             name: "Student",
//           },
//         },
//       });
//     }

//     const newPaymentBulk = await prisma.payment.createMany({
//       data: students.map((student) => ({
//         majorId,
//         studentId: student.id,
//         bendaharaId,
//         accountBankId,
//         month,
//         amount: parseFloat(amount),
//         dueDate: dueDate ? new Date(dueDate) : null,
//         status: status || "Unpaid",
//         notes: notes ? notes : null,
//         paymentDate: parsedPaymentDate,
//         receiptNumber: `KWT-${uuidv4()}`,
//       })),
//     });

//     return NextResponse.json(newPaymentBulk);
//   } catch (error) {
//     console.error("Error creating payment:", error);
//     return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
//   }
// }
