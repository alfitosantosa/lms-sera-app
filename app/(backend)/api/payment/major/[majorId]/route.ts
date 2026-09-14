import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ majorId: string }> }) {
  const { majorId } = await params;

  if (!majorId) {
    return NextResponse.json({ error: "Student ID required" }, { status: 400 });
  }

  const t = await resolveFoundation(request, request.nextUrl.searchParams.get("foundationId"));
  if (!t.ok) return t.response;

  try {
    const payments = await prisma.payment.findMany({
      where: {
        majorId: majorId,
        major: { foundationId: t.foundationId },
      },
      include: {
        student: {
          include: {
            class: true,
          },
        },
        major: true,
        accountBank: true,
        createdBy: true,
        paymentItems: true,
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
