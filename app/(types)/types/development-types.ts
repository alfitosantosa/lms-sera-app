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

// =====================================================
// CLASS PROGRESS (Phase 3 — dashboard guru)
// =====================================================

export type ClassProgressStudentDTO = {
  id: string;
  name: string;
  nisn: string | null;
  avatarUrl: string | null;
  logCount: number;
  hasLogToday: boolean;
  lastLogAt: string | null;
};

export type ClassProgressDTO = {
  students: ClassProgressStudentDTO[];
  totalStudents: number;
  loggedToday: number;
  pendingToday: number;
  percentLogbook: number;
  /** Penilaian per indikator (matrix) pada periode aktif — 0 bila belum ada. */
  percentAssessment: number;
};

// =====================================================
// ASSESSMENT (Phase 4)
// =====================================================

export const assessmentUpsertSchema = z.object({
  studentId: z.string().min(1, "Siswa wajib dipilih"),
  periodId: z.string().min(1, "Periode penilaian wajib dipilih"),
  indicatorId: z.string().min(1, "Indikator wajib dipilih"),
  scaleId: z.string().min(1, "Skala wajib dipilih"),
  score: z.coerce.number().nullable().optional(),
  note: z.string().nullable().optional(),
  // Opsional seperti log harian: client mengunggah berkas dulu, kirim metadata.
  evidences: z.array(evidenceInputSchema).optional(),
});

export const assessmentUpdateSchema = z.object({
  scaleId: z.string().min(1).optional(),
  score: z.coerce.number().nullable().optional(),
  note: z.string().nullable().optional(),
  evidences: z.array(evidenceInputSchema).optional(),
});

export const bulkAssessmentEntrySchema = z.object({
  studentId: z.string().min(1, "Siswa wajib dipilih"),
  scaleId: z.string().min(1, "Skala wajib dipilih"),
  note: z.string().nullable().optional(),
});

export const bulkAssessmentInputSchema = z.object({
  classId: z.string().min(1, "Kelas wajib dipilih"),
  periodId: z.string().min(1, "Periode penilaian wajib dipilih"),
  indicatorId: z.string().min(1, "Indikator wajib dipilih"),
  entries: z.array(bulkAssessmentEntrySchema).min(1, "Minimal satu entri"),
});

export type AssessmentUpsertInput = z.infer<typeof assessmentUpsertSchema>;
export type AssessmentUpdateInput = z.infer<typeof assessmentUpdateSchema>;
export type BulkAssessmentEntryInput = z.infer<
  typeof bulkAssessmentEntrySchema
>;
export type BulkAssessmentInput = z.infer<typeof bulkAssessmentInputSchema>;

export type StudentAssessmentDTO = {
  id: string;
  foundationId: string;
  branchId: string;
  classId: string;
  studentId: string;
  teacherId: string;
  periodId: string;
  indicatorId: string;
  scaleId: string;
  score: number | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  student?: StudentRefDTO | null;
  teacher?: TeacherRefDTO | null;
  indicator?: {
    id: string;
    name: string;
    developmentArea?: DevelopmentAreaRef | null;
  } | null;
  scale?: AssessmentScaleRefDTO | null;
  period?: {
    id: string;
    name: string;
    status: AssessmentPeriodStatusTypes;
  } | null;
  evidences?: EvidenceDTO[];
};

export type ClassMatrixIndicatorDTO = {
  id: string;
  name: string;
  order: number;
  area: DevelopmentAreaRef | null;
};

export type ClassMatrixCellDTO = {
  studentId: string;
  indicatorId: string;
  assessmentId: string | null;
  scaleId: string | null;
  scale: AssessmentScaleRefDTO | null;
  score: number | null;
  note: string | null;
  updatedAt: string | null;
};

export type ClassMatrixDTO = {
  classId: string;
  period: {
    id: string;
    name: string;
    status: AssessmentPeriodStatusTypes;
  } | null;
  indicators: ClassMatrixIndicatorDTO[];
  students: StudentRefDTO[];
  cells: ClassMatrixCellDTO[];
};

export type StudentOverviewAreaDTO = {
  areaId: string;
  areaName: string;
  count: number;
  latest: {
    indicatorId: string;
    indicatorName: string;
    scale: AssessmentScaleRefDTO | null;
    periodName: string;
    updatedAt: string;
  } | null;
  highest: {
    indicatorId: string;
    indicatorName: string;
    scale: (AssessmentScaleRefDTO & { value: number }) | null;
    periodName: string;
    value: number;
  } | null;
};

export type StudentOverviewDTO = {
  student: {
    id: string;
    name: string;
    nisn: string | null;
    classId: string | null;
  };
  areas: StudentOverviewAreaDTO[];
};

export type TimelineLogEntryDTO = {
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

/**
 * Bukti tugas yang ditautkan ke indikator perkembangan (Phase 5, PRD §15).
 * Muncul di timeline yang sama dengan log harian.
 */
export type TimelineAssignmentEvidenceDTO = {
  kind: "assignment-evidence";
  id: string;
  date: string;
  parentVisible: boolean;
  assignmentId: string;
  assignmentTitle: string;
  subject: string | null;
  score: number | null;
  maxScore: number | null;
  feedback: string | null;
  type: EvidenceTypeTypes;
  url: string;
};

export type TimelineEntryDTO =
  TimelineLogEntryDTO | TimelineAssignmentEvidenceDTO;

/** Type guard: konsumen grafik/bukti hanya peduli entri log harian. */
export const isLogEntry = (
  entry: TimelineEntryDTO,
): entry is TimelineLogEntryDTO => entry.kind === "log";

// =====================================================
// ASSIGNMENT & GRADE (Phase 5)
// =====================================================

export const gradeTypeInputSchema = z.object({
  name: z.string().min(1, "Nama jenis penilaian wajib diisi"),
  description: z.string().nullable().optional(),
  weight: z.coerce.number().int().min(0).default(0),
  order: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

/**
 * `scheduleId` wajib; `classId`/`subjectId`/`teacherId` TIDAK diterima dari
 * client — backend menurunkannya dari jadwal yang dipilih.
 */
export const assignmentInputSchema = z.object({
  scheduleId: z.string().min(1, "Jadwal wajib dipilih"),
  title: z.string().min(1, "Judul tugas wajib diisi"),
  description: z.string().min(1, "Deskripsi tugas wajib diisi"),
  assignedDate: z.coerce.date().optional(),
  dueDate: z.coerce.date(),
  allowLateSubmission: z.boolean().default(false),
  maxScore: z.coerce
    .number()
    .positive("Nilai maksimal harus lebih dari 0")
    .default(100),
  gradeTypeId: z.string().min(1).nullable().optional(),
  developmentAreaId: z.string().min(1).nullable().optional(),
  indicatorId: z.string().min(1).nullable().optional(),
  isPublished: z.boolean().default(false),
  attachments: z.array(evidenceInputSchema).default([]),
});

/** Jadwal tidak boleh dipindah setelah tugas dibuat (turunan teacherId). */
export const assignmentUpdateSchema = assignmentInputSchema
  .omit({ scheduleId: true })
  .partial();

export const assignmentSubmissionInputSchema = z.object({
  notes: z.string().nullable().optional(),
  attachments: z.array(evidenceInputSchema).default([]),
});

export const assignmentGradeInputSchema = z.object({
  score: z.coerce.number().min(0, "Nilai tidak boleh negatif"),
  feedback: z.string().nullable().optional(),
  // Kosong → 400 "Jenis penilaian wajib dipilih" (dicek di service).
  gradeTypeId: z.string().min(1).nullable().optional(),
});

export type GradeTypeInput = z.infer<typeof gradeTypeInputSchema>;
export type AssignmentInput = z.infer<typeof assignmentInputSchema>;
export type AssignmentUpdateInput = z.infer<typeof assignmentUpdateSchema>;
export type AssignmentSubmissionInput = z.infer<
  typeof assignmentSubmissionInputSchema
>;
export type AssignmentGradeInput = z.infer<typeof assignmentGradeInputSchema>;

export type GradeTypeDTO = {
  id: string;
  name: string;
  description: string | null;
  code: string;
  weight: number;
  order: number;
  isActive: boolean;
};

export type AssignmentRefDTO = {
  id: string;
  title: string;
  dueDate: string;
  maxScore: number;
  isPublished: boolean;
  classId: string;
  subjectId: string;
};

export type AssignmentDTO = {
  id: string;
  scheduleId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  title: string;
  description: string;
  attachments: EvidenceInput[] | null;
  assignmentType: string | null;
  assignedDate: string;
  dueDate: string;
  allowLateSubmission: boolean;
  maxScore: number;
  gradeTypeId: string | null;
  developmentAreaId: string | null;
  indicatorId: string | null;
  isPublished: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  class?: { id: string; name: string } | null;
  subject?: { id: string; name: string; code: string | null } | null;
  teacher?: { id: string; name: string } | null;
  schedule?: {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  } | null;
  gradeType?: GradeTypeDTO | null;
  developmentArea?: DevelopmentAreaRef | null;
  indicator?: {
    id: string;
    name: string;
    developmentArea?: DevelopmentAreaRef | null;
  } | null;
  _count?: { submissions: number };
};

// =====================================================
// PORTAL ORANG TUA & SISWA (Phase 8)
// =====================================================

/**
 * Catatan guru yang boleh dibaca orang tua/siswa. Diturunkan dari timeline —
 * sumber yang sama yang sudah memaksa `parentVisible: true`, bukan query kedua
 * yang bisa berbeda filternya.
 */
export type DevelopmentMeNoteDTO = {
  logId: string;
  date: string;
  activity: string;
  teacherNote: string;
  teacherName: string | null;
};

/** Rapor yang boleh dilihat orang tua/siswa — selalu `PUBLISHED`. */
export type DevelopmentMeReportDTO = {
  id: string;
  periodId: string;
  periodName: string;
  publishedAt: string | null;
};

/** Satu anak (atau diri sendiri untuk siswa) dalam ringkasan portal. */
export type DevelopmentMeStudentDTO = {
  student: {
    id: string;
    name: string;
    nisn: string | null;
    classId: string | null;
  };
  areas: StudentOverviewAreaDTO[];
  /** Timeline lengkap yang boleh dilihat aktor (query sudah menyaring). */
  timeline: TimelineEntryDTO[];
  teacherNotes: DevelopmentMeNoteDTO[];
  reports: DevelopmentMeReportDTO[];
};

/**
 * `GET /api/development/me` — identitas selalu dari sesi; tidak ada
 * `studentId`/`parentId` dari klien yang bisa menimpanya.
 */
export type DevelopmentMeDTO = {
  role: "parent" | "student";
  students: DevelopmentMeStudentDTO[];
};

export type AssignmentSubmissionDTO = {
  id: string;
  assignmentId: string;
  studentId: string;
  attachments: EvidenceInput[] | null;
  notes: string | null;
  submittedAt: string;
  isLate: boolean;
  score: number | null;
  feedback: string | null;
  gradedAt: string | null;
  gradedBy: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  student?: StudentRefDTO | null;
  assignment?: AssignmentRefDTO | null;
  evidences?: EvidenceDTO[];
};
