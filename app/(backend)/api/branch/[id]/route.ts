import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation } from "@/lib/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const explicit = request.nextUrl.searchParams.get("foundationId");
  const t = await resolveFoundation(request, explicit);
  if (!t.ok) return t.response;

  const { id } = await params;

  try {
    const branch = await prisma.branch.findFirst({
      where: { id, foundationId: t.foundationId },
    });

    if (!branch) {
      return NextResponse.json(
        { success: false, message: "Branch not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(branch);
  } catch (error) {
    return handlePrismaError(error);
  }
}
