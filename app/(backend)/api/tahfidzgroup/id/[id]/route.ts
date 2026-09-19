"use server";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation } from "@/lib/tenant";
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
    // TahfidzGroup hanya menyimpan branchId (tanpa relasi), jadi scope lewat daftar branch yayasan
    const branchs = await prisma.branch.findMany({
      where: { foundationId: t.foundationId },
      select: { id: true },
    });
    const branchIds = branchs.map((branch) => branch.id);

    const tahfidzGroup = await prisma.tahfidzGroup.findFirst({
      where: { id, branchId: { in: branchIds } },
      include: {
        students: {
          orderBy: {
            name: "asc",
          },
        },
        schedules: true,
        _count: { select: { students: true, schedules: true } },
      },
    });
    if (!tahfidzGroup) {
      return NextResponse.json(
        { error: "Tahfidz group not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(tahfidzGroup);
  } catch (error) {
    return handlePrismaError(error);
  }
}
