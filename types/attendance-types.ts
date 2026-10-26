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

import { type ScheduleTypes } from "./schedule-types";
import { type UserDataTypes } from "./userData-types";

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

export type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "excused"
  | "sick";

export type AttendanceSummary = {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  sick: number;
  attendanceRate: number;
};

export type AttendanceDailyPoint = AttendanceSummary & { date: string };

export type AttendanceByClass = AttendanceSummary & {
  classId: string | null;
  className: string;
};

export type AttendanceFilterOptions = {
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
};

export type AttendancePagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore: boolean;
};

export type AttendancePaginatedResponse = {
  data: attendanceTypes[];
  pagination: AttendancePagination;
  summary: AttendanceSummary;
  daily: AttendanceDailyPoint[];
  byClass: AttendanceByClass[];
  filterOptions: AttendanceFilterOptions;
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
