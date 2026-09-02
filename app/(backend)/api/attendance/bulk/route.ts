//create attendance bulk

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

export async function POST(request: NextRequest) {
  const { attendances } = await request.json();

  try {
    const createdAttendances = await prisma.attendance.createMany({
      data: attendances,
    });
    return NextResponse.json(createdAttendances);
  } catch (error) {
    return handlePrismaError(error);
  }
}
// put many attendance

export async function PUT(request: NextRequest) {
  const { attendances } = await request.json();

  try {
    const updatePromises = attendances.map((attendance: { id: string; [key: string]: unknown }) =>
      prisma.attendance.update({
        where: {
          id: attendance.id,
        },
        data: attendance,
      }),
    );
    const updatedAttendances = await Promise.all(updatePromises);
    return NextResponse.json(updatedAttendances);
  } catch (error) {
    return handlePrismaError(error);
  }
}
