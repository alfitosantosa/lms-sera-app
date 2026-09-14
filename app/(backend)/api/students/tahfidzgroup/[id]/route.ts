"use server";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const t = await resolveFoundation(request, request.nextUrl.searchParams.get("foundationId"));
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
