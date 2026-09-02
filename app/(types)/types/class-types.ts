import { z } from "zod";

export const ClassSchema = z.object({
  id: z.string().min(1, "id not be null"),
  name: z.string().min(1, "name not be null"),
  grade: z.number().min(1, "grade not be null"),
  majorId: z.string().min(1, "majorId not be null"),
  academicYearId: z.string().min(1, "academicYearId not be null"),
  capacity: z.number().min(1, "capacity not be null"),
  academicYear: z.object({
    id: z.string().min(1, "id not be null"),
    year: z.string().min(1, "year not be null"),
  }),
  major: z.object({
    id: z.string().min(1, "id not be null"),
    name: z.string().min(1, "name not be null"),
  }),
  _count: z.object({
    students: z.number().min(1, "students not be null"),
  }),
  students: z
    .array(
      z.object({
        id: z.string().min(1, "id not be null"),
        name: z.string().min(1, "name not be null"),
        nisn: z.string().min(1, "nisn not be null"),
      }),
    )
    .nullable(),
});

export type ClassDataTypes = z.infer<typeof ClassSchema>;

export const classSchemaForm = z.object({
  name: z.string().min(1, "Nama kelas wajib diisi"),
  grade: z.number().min(1, "Tingkat kelas minimal 1").max(12, "Tingkat kelas maksimal 12"),
  majorId: z.string().min(1, "Jurusan wajib dipilih"),
  academicYearId: z.string().min(1, "Tahun ajaran wajib dipilih"),
  capacity: z.number().min(1, "Kapasitas minimal 1").max(50, "Kapasitas maksimal 50"),
});

export type ClassFormValues = z.infer<typeof classSchemaForm>;
