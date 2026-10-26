import { handlePrismaError } from "@/services/errorHandler";
import { prisma } from "@/services/prisma";
import { resolveFoundation } from "@/services/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { studentId } = await params;

  if (!studentId) {
    return NextResponse.json({ error: "Student ID required" }, { status: 400 });
  }

  const t = await resolveFoundation(
    request,
    request.nextUrl.searchParams.get("foundationId"),
  );
  if (!t.ok) return t.response;

  try {
    const payments = await prisma.payment.findMany({
      where: { studentId: studentId, branch: { foundationId: t.foundationId } },
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
