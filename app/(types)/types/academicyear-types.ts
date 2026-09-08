// Academic Year Types
import { z } from "zod";

export interface AcademicYearTypes {
  id: string;
  year: string;
  startDate: Date | string;
  endDate: Date | string;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  // Relations
  classes?: ClassAcademicYearTypes[];
  schedules?: ScheduleAcademicYearTypes[];
  students?: StudentAcademicYearTypes[];
  _count?: {
    students: number;
    schedules: number;
    calendarEvents: number;
    classes: number;
  };
}

interface ClassAcademicYearTypes {
  id: string;
  name: string;
  grade: number;
}

interface ScheduleAcademicYearTypes {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface StudentAcademicYearTypes {
  id: string;
  name: string;
}

// Zod schema for form validation
const academicYearDataTypes = z.object({
  id: z.string().cuid(),
  year: z.string().min(1, "Tahun ajaran wajib diisi"),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
  isActive: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  _count: z.object({
    students: z.number().min(0),
    schedules: z.number().min(0),
    calendarEvents: z.number().min(0),
    classes: z.number().min(0),
  }),
});

export type AcademicYearDataTypes = z.infer<typeof academicYearDataTypes>;

// Form schema
export const academicYearSchema = z
  .object({
    year: z.string().min(1, "Tahun ajaran wajib diisi"),
    startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
    endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
    isActive: z.boolean(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return start < end;
    },
    {
      message: "Tanggal selesai harus setelah tanggal mulai",
      path: ["endDate"],
    },
  );

export type AcademicYearForm = z.infer<typeof academicYearSchema>;

export type AcademicYearInputData = Omit<AcademicYearTypes, "id" | "createdAt" | "updatedAt" | "_count">;

export type AcademicYearUpdateData = Omit<AcademicYearTypes, "createdAt" | "updatedAt" | "_count">;
