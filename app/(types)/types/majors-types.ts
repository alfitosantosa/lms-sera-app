import { z } from "zod";

export const MajorSchema = z.object({
  id: z.string().min(1, "id not be null"),
  code: z.string().min(1, "code not be null"),
  name: z.string().min(1, "name not be null"),
  description: z.string(),
  isActive: z.boolean(),
  _count: z.object({
    classes: z.number(),
    students: z.number(),
    subjects: z.number(),
  }),
});

export type MajorDataTypes = z.infer<typeof MajorSchema>;

export const majorSchemaForm = z.object({
  code: z.string().min(1, "Kode jurusan wajib diisi"),
  name: z.string().min(1, "Nama jurusan wajib diisi"),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  adminName: z.string().optional(),
  signatureUrl: z.string().optional(),
  isActive: z.boolean(),
});

export type MajorFormValues = z.infer<typeof majorSchemaForm>;

// model Major {
//   id          String    @id @default(cuid())
//   code        String    @unique
//   name        String
//   description String?
//   isActive    Boolean   @default(true)
//   adminName   String?
//   signatureUrl String?
//   classes     Class[]
//   students    Student[]
//   subjects    Subject[]
//   paymenttype   // Paymenttype[]

//   @@map("majors")
// }

export type majorTypes = {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  adminName?: string;
  signatureUrl?: string;
  _count: {
    classes: number;
    students: number;
    subjects: number;
  };
};
