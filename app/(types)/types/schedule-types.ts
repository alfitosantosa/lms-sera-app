"use client";

// Schedule Types
export interface ScheduleTypes {
  id: string;
  classId?: string | null;
  subjectId: string;
  teacherId: string;
  academicYearId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string | null;
  isActive?: boolean;
  tahfidzGroupId?: string | null;
  // Relations
  class?: ClassScheduleTypes | null;
  subject?: SubjectScheduleTypes;
  teacher?: TeacherScheduleTypes;
  academicYear?: AcademicYearScheduleTypes;
  tahfidzGroup?: TahfidzGroupScheduleTypes | null;
  attendances?: AttendanceScheduleTypes[];
}

interface ClassScheduleTypes {
  id: string;
  name: string;
  grade: number;
  majorId: string;
}

interface SubjectScheduleTypes {
  id: string;
  code: string;
  name: string;
  credits: number;
}

interface TeacherScheduleTypes {
  id: string;
  name: string;
  email?: string | null;
  employeeId?: string | null;
  avatarUrl?: string | null;
}

interface AcademicYearScheduleTypes {
  id: string;
  year: string;
  isActive: boolean;
}

interface TahfidzGroupScheduleTypes {
  id: string;
  name: string;
  grade: number;
}

interface AttendanceScheduleTypes {
  id: string;
  studentId: string;
  status: string;
  date: Date | string;
}

// Input types
export interface ScheduleInput {
  classId?: string | null;
  subjectId: string;
  teacherId: string;
  academicYearId: string;
  dayOfWeek: number | string;
  startTime: string;
  endTime: string;
  room?: string | null;
  isActive?: boolean;
  tahfidzGroupId?: string | null;
}

export interface ScheduleBulkInput {
  classId: string;
  subjectId: string;
  teacherId: string;
  academicYearId: string;
  dayOfWeek: number | string;
  startTime: string;
  endTime: string;
  room?: string | null;
  isActive?: boolean;
}
