import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;

  if (!studentId) {
    return NextResponse.json({ error: "Student ID required" }, { status: 400 });
  }

  const t = await resolveFoundation(request, request.nextUrl.searchParams.get("foundationId"));
  if (!t.ok) return t.response;

  try {
    const payments = await prisma.payment.findMany({
      where: { studentId: studentId, major: { foundationId: t.foundationId } },
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
