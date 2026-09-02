// model Attendance {
//   id         String   @id @default(cuid())
//   studentId  String
//   scheduleId String
//   status     String
//   notes      String?
//   createdAt  DateTime @default(now())
//   date       DateTime
//   schedule   Schedule @relation(fields: [scheduleId], references: [id])
//   student    User     @relation("StudentAttendance", fields: [studentId], references: [id])

//   @@unique([studentId, scheduleId, date])
//   @@map("attendances")
// }

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // ✅ Optimized: Field-selection to reduce N+1 risk from 3-level include
    // Dropping: academicYear (not accessed), full student/schedule objects
    // Keeping: only fields accessed by UI
    const attendances = await prisma.attendance.findMany({
      select: {
        id: true,
        status: true,
        notes: true,
        date: true,
        createdAt: true,
        student: {
          select: { id: true, name: true, email: true, nisn: true },
        },
        schedule: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            dayOfWeek: true,
            room: true,
            class: { select: { id: true, name: true } },
            subject: { select: { id: true, name: true, code: true } },
            teacher: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(attendances);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: NextRequest) {
  const { studentId, scheduleId, status, notes, date } = await request.json();

  try {
    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        scheduleId,
        status,
        notes,
        date,
      },
    });
    return NextResponse.json(attendance);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(request: NextRequest) {
  const { id, studentId, scheduleId, status, notes, date } = await request.json();

  try {
    const attendance = await prisma.attendance.update({
      where: { id },
      data: {
        studentId,
        scheduleId,
        status,
        notes,
        date,
      },
    });
    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();

  try {
    const attendance = await prisma.attendance.delete({
      where: { id },
    });
    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return NextResponse.json({ error: "Failed to delete attendance" }, { status: 500 });
  }
}

//create attendance bulk
