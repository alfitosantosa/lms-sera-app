import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation } from "@/lib/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ branchId: string }> },
) {
  const { branchId } = await params;

  if (!branchId) {
    return NextResponse.json({ error: "Student ID required" }, { status: 400 });
  }

  const explicit = request.nextUrl.searchParams.get("foundationId");
  const t = await resolveFoundation(request, explicit);
  if (!t.ok) return t.response;

  try {
    const accountBank = await prisma.accountBank.findMany({
      where: {
        branchId: branchId,
        branchs: { foundationId: t.foundationId },
      },
      include: { branchs: true },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(accountBank);
  } catch (error) {
    return handlePrismaError(error);
  }
}
