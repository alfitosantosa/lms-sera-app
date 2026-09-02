import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!classId || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required parameters: classId, startDate, endDate" }, { status: 400 });
    }

    // Get students in class
    let classStudents;
    if (classId === "all") {
      classStudents = await prisma.userData.findMany({
        where: {
          classId: { not: null },
        },
        select: {
          id: true,
          name: true,
          email: true,
          classId: true,
          avatarUrl: true,
        },
      });
    } else {
      classStudents = await prisma.userData.findMany({
        where: {
          classId: classId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          classId: true,
          avatarUrl: true,
        },
      });
    }

    // Get attendance records for students in this class and date range

    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId: {
          in: classStudents.map((s) => s.id),
        },
        date: {
          gte: new Date(startDate),
          lte: end,
        },
      },
      select: {
        id: true,
        studentId: true,
        date: true,
        status: true,
        notes: true,
        createdAt: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // Get class info
    let classInfo;
    if (classId === "all") {
      classInfo = {
        id: "all",
        name: "Semua Kelas",
      };
    } else {
      classInfo = await prisma.class.findUnique({
        where: {
          id: classId,
        },
        select: {
          id: true,
          name: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        class: classInfo,
        students: classStudents,
        attendance: attendanceRecords,
      },
    });
  } catch (error) {
    return handlePrismaError(error);
  }
}
