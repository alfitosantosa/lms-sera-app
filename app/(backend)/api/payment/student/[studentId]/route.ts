import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;

  if (!studentId) {
    return NextResponse.json({ error: "Student ID required" }, { status: 400 });
  }

  try {
    const payments = await prisma.payment.findMany({
      where: { studentId: studentId },
      include: {
        student: true,
        paymentTransaction: true,
      },
      orderBy: { dueDate: "asc" },
    });
    return NextResponse.json(payments);
  } catch (error) {
    return handlePrismaError(error);
  }
}
