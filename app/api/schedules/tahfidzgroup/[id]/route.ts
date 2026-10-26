import { handlePrismaError } from "@/services/errorHandler";
import { prisma } from "@/services/prisma";
import { resolveFoundation } from "@/services/tenant";
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
    const schedules = await prisma.schedule.findMany({
      where: {
        tahfidzGroupId: id,
        academicYear: { foundationId: t.foundationId },
      },
      include: {
        class: true,
        subject: true,
        teacher: true,
        academicYear: true,
      },
    });
    return NextResponse.json(schedules);
  } catch (error) {
    return handlePrismaError(error);
  }
}
