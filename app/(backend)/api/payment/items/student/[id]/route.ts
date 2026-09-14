import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const explicit = request.nextUrl.searchParams.get("foundationId");
  const t = await resolveFoundation(request, explicit);
  if (!t.ok) return t.response;

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Student ID required" }, { status: 400 });
  }

  try {
    const payments = await prisma.paymentItems.findMany({
      where: {
        studentId: id,
        student: { foundationId: t.foundationId },
      },
      include: {
        PaymentType: true,
        payment: true,
        student: {
          include: {
            class: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(payments);
  } catch (error) {
    return handlePrismaError(error);
  }
}
