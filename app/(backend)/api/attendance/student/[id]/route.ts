import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

//use params for get id

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const t = await resolveFoundation(request, request.nextUrl.searchParams.get("foundationId"));
  if (!t.ok) return t.response;

  const { id } = await params;
  try {
    const attendance = await prisma.attendance.findMany({
      where: {
        studentId: id,
        student: { foundationId: t.foundationId },
        schedule: { academicYear: { foundationId: t.foundationId } },
      },
      include: {
        schedule: {
          include: {
            class: true,
            subject: true,
            teacher: true,
            academicYear: true,
          },
        },
      },
    });
    return NextResponse.json(attendance);
  } catch (error) {
    return handlePrismaError(error);
  }
}
