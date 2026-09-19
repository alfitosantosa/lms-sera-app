import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation } from "@/lib/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const explicit = request.nextUrl.searchParams.get("foundationId");
  const t = await resolveFoundation(request, explicit);
  if (!t.ok) return t.response;

  try {
    const paymentTypes = await prisma.paymentType.findMany({
      where: {
        branchId: id,
        branch: { foundationId: t.foundationId },
      },
      include: {
        branch: true,
      },
    });
    return NextResponse.json(paymentTypes);
  } catch (error) {
    return handlePrismaError(error);
  }
}
