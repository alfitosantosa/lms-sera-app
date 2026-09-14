// app/api/students/by-ids/route.ts
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const t = await resolveFoundation(request, request.nextUrl.searchParams.get("foundationId"));
  if (!t.ok) return t.response;

  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json({ error: "IDs required" }, { status: 400 });
    }

    const ids = idsParam.split(",");

    const students = await prisma.violation.findMany({
      where: {
        studentId: {
          in: ids,
        },
        student: { foundationId: t.foundationId },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        violationType: {
          select: {
            id: true,
            name: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    return handlePrismaError(error);
  }
}
