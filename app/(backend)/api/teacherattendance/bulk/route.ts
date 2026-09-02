import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teacherIds, date, status, notes, createdBy, checkinTime } = body;

    // Validate required fields
    if (!teacherIds || !Array.isArray(teacherIds) || teacherIds.length === 0) {
      return NextResponse.json({ error: "Missing or invalid teacherIds array" }, { status: 400 });
    }

    if (!date || !createdBy) {
      return NextResponse.json({ error: "Missing required fields: date, createdBy" }, { status: 400 });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check for existing attendances for these teachers on this date
    const existingAttendances = await prisma.teacherAttendance.findMany({
      where: {
        teacherId: { in: teacherIds },
        date: attendanceDate,
      },
      select: { teacherId: true },
    });

    const existingTeacherIds = existingAttendances.map((a) => a.teacherId);
    const newTeacherIds = teacherIds.filter((id: string) => !existingTeacherIds.includes(id));

    if (newTeacherIds.length === 0) {
      return NextResponse.json({ error: "All selected teachers already have attendance recorded for this date" }, { status: 409 });
    }

    // Create bulk attendance records
    const createdAttendances = await prisma.teacherAttendance.createMany({
      data: newTeacherIds.map((teacherId: string) => ({
        teacherId,
        date: attendanceDate,
        status: status || "hadir",
        notes,
        createdBy,
        checkinTime: checkinTime ? new Date(checkinTime) : new Date(),
      })),
      skipDuplicates: true,
    });

    // Fetch the created records with relations
    const attendances = await prisma.teacherAttendance.findMany({
      where: {
        teacherId: { in: newTeacherIds },
        date: attendanceDate,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
            avatarUrl: true,
            position: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: `Successfully created ${createdAttendances.count} attendance records. ${existingTeacherIds.length} teachers already had attendance recorded.`,
      created: createdAttendances.count,
      alreadyExists: existingTeacherIds.length,
      data: attendances,
    });
  } catch (error) {
    return handlePrismaError(error);
  }
}
