import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { classId, bendaharaId, paymentTypeId, amount, dueDate, status, notes, paymentDate, majorId, accountBankId, month } = await request.json();

    if (!classId || !paymentTypeId || !amount || !paymentDate || !accountBankId || !month) {
      return NextResponse.json({ error: "classId, paymentTypeId, amount, paymentDate, accountBankId, and month are required" }, { status: 400 });
    }

    const parsedPaymentDate = new Date(paymentDate);
    if (isNaN(parsedPaymentDate.getTime())) {
      return NextResponse.json({ error: "Invalid paymentDate" }, { status: 400 });
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

    const newPaymentBulk = await prisma.payment.createMany({
      data: students.map((student) => ({
        majorId,
        studentId: student.id,
        bendaharaId,
        accountBankId,
        month,
        amount: parseFloat(amount),
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || "Unpaid",
        notes: notes ? notes : null,
        paymentDate: parsedPaymentDate,
        receiptNumber: `KWT-${crypto.randomUUID().substring(0, 8)}`,
      })),
    });

    return NextResponse.json(newPaymentBulk);
  } catch (error) {
    return handlePrismaError(error);
  }
}
