import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const whereClause: Record<string, unknown> = {};

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Get all teachers (UserData with schedules)
    const teachers = await prisma.userData.findMany({
      where: {
        schedules: {
          some: {},
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        avatarUrl: true,
        position: true,
        teacherAttendances: {
          where: whereClause,
          select: {
            id: true,
            date: true,
            status: true,
            checkinTime: true,
            checkoutTime: true,
            notes: true,
            createdAt: true,
          },
          orderBy: { date: "desc" },
        },
      },
    });

    // Calculate statistics
    const stats = teachers.map((teacher) => {
      const attendance = teacher.teacherAttendances;
      const totalDays = attendance.length;
      const presentDays = attendance.filter((a) => a.status === "hadir").length;
      const sickDays = attendance.filter((a) => a.status === "sakit").length;
      const leaveDays = attendance.filter((a) => a.status === "izin").length;
      const absentDays = attendance.filter((a) => a.status === "alfa").length;
      const lateDays = attendance.filter((a) => a.status === "terlambat").length;

      return {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        employeeId: teacher.employeeId,
        avatarUrl: teacher.avatarUrl,
        position: teacher.position,
        attendances: attendance,
        statistics: {
          totalDays,
          presentDays,
          sickDays,
          leaveDays,
          absentDays,
          lateDays,
          presentPercentage: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : "0",
        },
      };
    });

    return NextResponse.json(stats);
  } catch (error) {
    return handlePrismaError(error);
  }
}
