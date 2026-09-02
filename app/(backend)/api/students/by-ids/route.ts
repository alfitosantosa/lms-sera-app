// app/api/students/by-ids/route.ts
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json({ error: "IDs required" }, { status: 400 });
    }

    const ids = idsParam.split(",");

    const students = await prisma.userData.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: { class: true, major: true, academicYear: true, role: true },
    });

    return NextResponse.json(students);
  } catch (error) {
    return handlePrismaError(error);
  }
}
