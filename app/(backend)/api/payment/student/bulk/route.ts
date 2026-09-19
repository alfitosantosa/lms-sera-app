import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation, tenantForbidden } from "@/lib/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const {
      classId,
      bendaharaId,
      paymentTypeId,
      amount,
      dueDate,
      status,
      notes,
      paymentDate,
      branchId,
      accountBankId,
      month,
    } = await request.json();

    if (
      !classId ||
      !paymentTypeId ||
      !amount ||
      !paymentDate ||
      !accountBankId ||
      !month
    ) {
      return NextResponse.json(
        {
          error:
            "classId, paymentTypeId, amount, paymentDate, accountBankId, and month are required",
        },
        { status: 400 },
      );
    }

    const parsedPaymentDate = new Date(paymentDate);
    if (isNaN(parsedPaymentDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid paymentDate" },
        { status: 400 },
      );
    }

    const [branch, accountBank, bendahara] = await Promise.all([
      prisma.branch.findFirst({
        where: { id: branchId, foundationId: t.foundationId },
        select: { id: true },
      }),
      prisma.accountBank.findFirst({
        where: { id: accountBankId, branchs: { foundationId: t.foundationId } },
        select: { id: true },
      }),
      prisma.userData.findFirst({
        where: { id: bendaharaId, foundationId: t.foundationId },
        select: { id: true },
      }),
    ]);

    if (!branch || !accountBank || !bendahara) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    let students;

    if (classId === "all") {
      students = await prisma.userData.findMany({
        where: {
          foundationId: t.foundationId,
          role: {
            name: "Student",
          },
        },
      });
    } else {
      students = await prisma.userData.findMany({
        where: {
          classId: classId,
          foundationId: t.foundationId,
          role: {
            name: "Student",
          },
        },
      });
    }

    const newPaymentBulk = await prisma.payment.createMany({
      data: students.map((student) => ({
        branchId,
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
