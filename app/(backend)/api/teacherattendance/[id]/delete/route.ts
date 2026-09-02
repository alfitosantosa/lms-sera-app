import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deletedteacherAttendance = await prisma.teacherAttendance.delete({
      where: { id },
    });

    return NextResponse.json(deletedteacherAttendance, { status: 200 });
  } catch (error) {
    return handlePrismaError(error);
  }
}
