import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation } from "@/lib/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ branchId: string }> },
) {
  const { branchId } = await context.params;

  if (!branchId) {
    return NextResponse.json({ error: "branch ID required" }, { status: 400 });
  }

  const t = await resolveFoundation(
    request,
    request.nextUrl.searchParams.get("foundationId"),
  );
  if (!t.ok) return t.response;

  try {
    const payments = await prisma.payment.findMany({
      where: {
        branchId: branchId,
        branch: { foundationId: t.foundationId },
      },
      include: {
        student: {
          include: {
            class: true,
          },
        },
        branch: true,
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
