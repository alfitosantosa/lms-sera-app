"use server";
import { handlePrismaError } from "@/lib/errorHandler/errorHandlerBackend";
import { prisma } from "@/lib/api/prisma";
import { resolveFoundation } from "@/lib/api/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const t = await resolveFoundation(
    request,
    request.nextUrl.searchParams.get("foundationId"),
  );
  if (!t.ok) return t.response;

  const { id } = await params;
  try {
    const student = await prisma.userData.findMany({
      where: { tahfidzGroup: { id }, foundationId: t.foundationId },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    });
    return NextResponse.json(student);
  } catch (error) {
    return handlePrismaError(error);
  }
}
