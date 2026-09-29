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

// =====================================================
// DAILY LOG (Phase 2)
// =====================================================

export const dailyLogStatusSchema = z.enum(["DRAFT", "SUBMITTED", "REVIEWED"]);
export const evidenceTypeSchema = z.enum([
  "IMAGE",
  "VIDEO",
  "DOCUMENT",
  "AUDIO",
  "LINK",
]);

export type DailyLogStatusTypes = z.infer<typeof dailyLogStatusSchema>;
export type EvidenceTypeTypes = z.infer<typeof evidenceTypeSchema>;

export const DAILY_LOG_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Dikirim",
  REVIEWED: "Ditinjau",
};

export const EVIDENCE_TYPE_LABELS: Record<string, string> = {
  IMAGE: "Gambar",
  VIDEO: "Video",
  DOCUMENT: "Dokumen",
  AUDIO: "Audio",
  LINK: "Tautan",
};

export const dailyObservationInputSchema = z.object({
  indicatorId: z.string().min(1, "Indikator wajib dipilih"),
  scaleId: z.string().min(1).nullable().optional(),
  observation: z.string().min(1, "Observasi wajib diisi"),
  note: z.string().nullable().optional(),
});

export const evidenceInputSchema = z.object({
  type: evidenceTypeSchema,
  url: z.string().min(1, "URL bukti wajib diisi"),
  fileName: z.string().nullable().optional(),
  mimeType: z.string().nullable().optional(),
  fileSize: z.coerce.number().int().nullable().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const dailyLogInputSchema = z.object({
  studentId: z.string().min(1, "Siswa wajib dipilih"),
  // Hanya dipakai untuk validasi scope; nilai sebenarnya selalu diturunkan
  // server dari data siswa.
  classId: z.string().min(1).optional(),
  branchId: z.string().min(1).optional(),
  date: z.coerce.date(),
  subjectId: z.string().min(1).nullable().optional(),
  activity: z.string().min(1, "Kegiatan wajib diisi"),
  achievement: z.string().nullable().optional(),
  challenge: z.string().nullable().optional(),
  teacherNote: z.string().nullable().optional(),
  parentVisible: z.boolean().default(false),
  observations: z.array(dailyObservationInputSchema).default([]),
  evidences: z.array(evidenceInputSchema).default([]),
});

export const dailyLogUpdateSchema = z.object({
  date: z.coerce.date().optional(),
  subjectId: z.string().min(1).nullable().optional(),
  activity: z.string().min(1, "Kegiatan wajib diisi").optional(),
  achievement: z.string().nullable().optional(),
  challenge: z.string().nullable().optional(),
  teacherNote: z.string().nullable().optional(),
  parentVisible: z.boolean().optional(),
  observations: z.array(dailyObservationInputSchema).optional(),
  evidences: z.array(evidenceInputSchema).optional(),
});

export const bulkDailyLogEntrySchema = z.object({
  studentId: z.string().min(1, "Siswa wajib dipilih"),
  activity: z.string().min(1, "Kegiatan wajib diisi"),
  observation: z.string().min(1, "Observasi wajib diisi"),
  indicatorId: z.string().min(1, "Indikator wajib dipilih"),
  scaleId: z.string().min(1).nullable().optional(),
});

export const bulkDailyLogInputSchema = z.object({
  classId: z.string().min(1, "Kelas wajib dipilih"),
  date: z.coerce.date(),
  subjectId: z.string().min(1).nullable().optional(),
  parentVisible: z.boolean().default(false),
  entries: z.array(bulkDailyLogEntrySchema).min(1, "Minimal satu entri"),
});

export type DailyObservationInput = z.infer<typeof dailyObservationInputSchema>;
export type EvidenceInput = z.infer<typeof evidenceInputSchema>;
export type DailyLogInput = z.infer<typeof dailyLogInputSchema>;
export type DailyLogUpdateInput = z.infer<typeof dailyLogUpdateSchema>;
export type BulkDailyLogEntryInput = z.infer<typeof bulkDailyLogEntrySchema>;
export type BulkDailyLogInput = z.infer<typeof bulkDailyLogInputSchema>;

export type DateRange = {
  fromDate?: Date;
  toDate?: Date;
};

export type EvidenceDTO = {
  id: string;
  type: EvidenceTypeTypes;
  url: string;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  title: string | null;
  description: string | null;
  createdAt: string;
};

export type AssessmentScaleRefDTO = {
  id: string;
  code: string;
  label: string;
  color: string | null;
};

export type DailyObservationDTO = {
  id: string;
  indicatorId: string;
  scaleId: string | null;
  observation: string;
  note: string | null;
  indicator?: {
    id: string;
    name: string;
    developmentArea?: DevelopmentAreaRef | null;
  } | null;
  scale?: AssessmentScaleRefDTO | null;
};

export type StudentRefDTO = {
  id: string;
  name: string;
  nisn: string | null;
  avatarUrl: string | null;
};

export type TeacherRefDTO = {
  id: string;
  name: string;
};

export type DailyLogDTO = {
  id: string;
  foundationId: string;
  branchId: string;
  classId: string;
  studentId: string;
  teacherId: string;
  subjectId: string | null;
  date: string;
  activity: string;
  achievement: string | null;
  challenge: string | null;
  teacherNote: string | null;
  status: DailyLogStatusTypes;
  parentVisible: boolean;
  createdAt: string;
  updatedAt: string;
  student?: StudentRefDTO | null;
  teacher?: TeacherRefDTO | null;
  observations?: DailyObservationDTO[];
  evidences?: EvidenceDTO[];
  _count?: { evidences: number };
};

export type TimelineEntryDTO = {
  kind: "log";
  id: string;
  date: string;
  activity: string;
  teacherNote: string | null;
  parentVisible: boolean;
  teacher: TeacherRefDTO | null;
  observations: {
    indicator: string;
    area: string | null;
    scale: AssessmentScaleRefDTO | null;
    observation: string;
  }[];
  evidences: { type: EvidenceTypeTypes; url: string }[];
};
