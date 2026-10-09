import { handlePrismaError } from "@/lib/errorHandler/errorHandlerBackend";
import { prisma } from "@/lib/api/prisma";
import { resolveFoundation, tenantForbidden } from "@/lib/api/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Verifikasi kepemilikan baris
    const owned = await prisma.teacherAttendance.findFirst({
      where: { id, teacher: { foundationId: t.foundationId } },
      select: { id: true },
    });
    if (!owned) return tenantForbidden("Data tidak ditemukan di yayasan ini");

    const deletedteacherAttendance = await prisma.teacherAttendance.delete({
      where: { id },
    });

    return NextResponse.json(deletedteacherAttendance, { status: 200 });
  } catch (error) {
    return handlePrismaError(error);
  }
}
