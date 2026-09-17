import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation } from "@/lib/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ idTeacher: string }> },
) {
  const t = await resolveFoundation(
    request,
    request.nextUrl.searchParams.get("foundationId"),
  );
  if (!t.ok) return t.response;

  const { idTeacher } = await params;

  if (!idTeacher) {
    return NextResponse.json({ error: "Student ID required" }, { status: 400 });
  }

  try {
    const tahfidzRecordByIdTeacher = await prisma.tahfidzRecord.findMany({
      where: {
        teacherId: idTeacher,
        teacher: { foundationId: t.foundationId },
      },
      include: {
        student: true,
        teacher: true,
        surah: true,
      },
      orderBy: {
        date: "desc",
      },
    });
    return NextResponse.json(tahfidzRecordByIdTeacher);
  } catch (error) {
    return handlePrismaError(error);
  }
}
