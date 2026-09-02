import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ idTeacher: string }> }) {
  const { idTeacher } = await params;

  if (!idTeacher) {
    return NextResponse.json({ error: "Student ID required" }, { status: 400 });
  }

  try {
    const tahfidzRecordByIdTeacher = await prisma.tahfidzRecord.findMany({
      where: {
        teacherId: idTeacher,
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
