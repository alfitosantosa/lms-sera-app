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

import { ScheduleTypes } from "./schedule-types";
import { UserDataTypes } from "./userData";

export type attendanceTypes = {
  id: string;
  studentId: string;
  scheduleId: string;
  status: string;
  notes?: string;
  createdAt: string;
  date: string;
  schedule: ScheduleTypes;
  student: UserDataTypes; // Changed from 'students' to 'student' to match Prisma schema
};

export type attendanceClassResponseTypes = {
  success: boolean;
  data: {
    class: {
      id: string;
      name: string;
    };
    students: UserDataTypes[];
    attendances: attendanceTypes[];
  };
};
