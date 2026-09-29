import { z } from "zod";

// =====================================================
// ENUMS (mirror prisma enums)
// =====================================================

export const assessmentPeriodStatusSchema = z.enum([
  "DRAFT",
  "OPEN",
  "LOCKED",
  "PUBLISHED",
]);

export type AssessmentPeriodStatusTypes = z.infer<
  typeof assessmentPeriodStatusSchema
>;

/** Label Bahasa Indonesia untuk dropdown/select. */
export const ASSESSMENT_PERIOD_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  OPEN: "Dibuka",
  LOCKED: "Dikunci",
  PUBLISHED: "Dipublikasikan",
};

// =====================================================
// INPUT SCHEMAS (trust boundary — dipakai API route)
// =====================================================

export const assessmentPeriodInputSchema = z
  .object({
    academicYearId: z.string().min(1).optional(),
    name: z.string().min(1, "Nama periode wajib diisi"),
    semester: z.coerce.number().int().min(1).max(2),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    status: assessmentPeriodStatusSchema.default("DRAFT"),
  })
  .refine((v) => v.endDate > v.startDate, {
    message: "Tanggal selesai harus setelah tanggal mulai",
  });

export const developmentAreaInputSchema = z.object({
  name: z.string().min(1, "Nama area wajib diisi"),
  description: z.string().optional(),
  order: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const developmentIndicatorInputSchema = z.object({
  developmentAreaId: z.string().min(1),
  code: z.string().optional(),
  name: z.string().min(1, "Nama indikator wajib diisi"),
  description: z.string().optional(),
  order: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const assessmentScaleInputSchema = z.object({
  code: z.string().min(1, "Kode skala wajib diisi"),
  label: z.string().min(1, "Label skala wajib diisi"),
  description: z.string().optional(),
  value: z.coerce.number().int().min(1),
  color: z.string().optional(),
  order: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type AssessmentPeriodInput = z.infer<
  typeof assessmentPeriodInputSchema
>;
export type DevelopmentAreaInput = z.infer<typeof developmentAreaInputSchema>;
export type DevelopmentIndicatorInput = z.infer<
  typeof developmentIndicatorInputSchema
>;
export type AssessmentScaleInput = z.infer<typeof assessmentScaleInputSchema>;

// =====================================================
// DTOs (read model — dipakai hooks & komponen UI)
// =====================================================

export type AcademicYearRef = {
  id: string;
  year: string;
};

export type DevelopmentAreaRef = {
  id: string;
  name: string;
};

export type AssessmentPeriodDTO = {
  id: string;
  foundationId: string;
  academicYearId: string | null;
  name: string;
  semester: number;
  startDate: string;
  endDate: string;
  status: AssessmentPeriodStatusTypes;
  createdAt: string;
  updatedAt: string;
  academicYear?: AcademicYearRef | null;
};

export type DevelopmentAreaDTO = {
  id: string;
  foundationId: string;
  name: string;
  description: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { indicators: number };
};

export type DevelopmentIndicatorDTO = {
  id: string;
  developmentAreaId: string;
  code: string | null;
  name: string;
  description: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  developmentArea?: DevelopmentAreaRef | null;
};

export type AssessmentScaleDTO = {
  id: string;
  foundationId: string;
  code: string;
  label: string;
  description: string | null;
  value: number;
  color: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BootstrapResultDTO = {
  areas: number;
  indicators: number;
  scales: number;
};
