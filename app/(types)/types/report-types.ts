import { z } from "zod";

// =====================================================
// REPORT STATUS (mirror enum ReportStatus di Prisma)
// =====================================================

export const reportStatusSchema = z.enum([
  "DRAFT",
  "REVIEW",
  "APPROVED",
  "PUBLISHED",
]);

export type ReportStatusTypes = z.infer<typeof reportStatusSchema>;

/** Label Bahasa Indonesia untuk badge/tab. */
export const REPORT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  REVIEW: "Ditinjau",
  APPROVED: "Disetujui",
  PUBLISHED: "Dipublikasikan",
};

// =====================================================
// INPUT SCHEMAS (trust boundary — dipakai API route)
// =====================================================

/**
 * Body `POST /api/reports/generate`. Persis satu dari `classId` (massal
 * seluruh kelas) atau `studentId` (satu siswa) wajib ada — `foundationId`
 * selalu diturunkan server dari sesi.
 */
export const reportGenerateSchema = z
  .object({
    classId: z.string().min(1).optional(),
    studentId: z.string().min(1).optional(),
    periodId: z.string().min(1, "Periode wajib dipilih"),
  })
  .refine((v) => Boolean(v.classId) !== Boolean(v.studentId), {
    message: "Pilih salah satu: kelas atau siswa",
  });

/** PATCH narasi — hanya boleh pada status DRAFT/REVIEW (ditegakkan server). */
export const reportUpdateSchema = z.object({
  teacherNarrative: z.string().nullable().optional(),
  homeroomNote: z.string().nullable().optional(),
  principalNote: z.string().nullable().optional(),
});

export type ReportGenerateInput = z.infer<typeof reportGenerateSchema>;
export type ReportUpdateInput = z.infer<typeof reportUpdateSchema>;

// =====================================================
// DTO / READ MODEL
// =====================================================

export type ReportDevelopmentIndicator = {
  indicator: string;
  scale: string;
  scaleValue: number;
  note: string | null;
};

export type ReportDevelopmentArea = {
  area: string;
  indicators: ReportDevelopmentIndicator[];
  /** Modus skala per indikator (fallback rata-rata dibulatkan saat seri). */
  finalScale: { code: string; label: string; value: number } | null;
};

export type ReportAcademicRow = {
  subject: string;
  finalScore: number;
  letterGrade: string | null;
  predicate: string | null;
};

export type ReportAssignmentRow = {
  title: string;
  subject: string;
  score: number | null;
  maxScore: number;
};

export type ReportAttendance = {
  present: number;
  late: number;
  sick: number;
  excused: number;
  absent: number;
  total: number;
  /** Persentase kehadiran (hadir + terlambat), 0 bila tidak ada data. */
  percent: number;
};

export type ReportCompletion = {
  academic: boolean;
  assessment: boolean;
  attendance: boolean;
  narrative: boolean;
  review: boolean;
  percent: number;
};

/**
 * Agregat rapor (PRD §35). Dipakai `buildReportAggregate` sebagai sumber
 * narasi & snapshot; tanggal masih `Date` sebelum diserialkan ke JSON.
 */
export type ReportAggregate = {
  student: {
    id: string;
    name: string;
    nisn: string | null;
    class: string;
    branch: string;
    foundation: string;
    avatarUrl: string | null;
  };
  period: {
    id: string;
    name: string;
    semester: number;
    startDate: Date;
    endDate: Date;
  };
  academicYear: string | null;
  development: ReportDevelopmentArea[];
  /** Mapel dormant `ReportCard`; array kosong = section tidak ditampilkan. */
  academic: ReportAcademicRow[];
  assignments: ReportAssignmentRow[];
  attendance: ReportAttendance;
  completion: ReportCompletion;
};

/**
 * Bentuk `snapshot` tersimpan (Json). Tanggal sudah menjadi ISO string setelah
 * diserialkan Prisma; `version` menyiapkan migrasi bentuk snapshot di Phase
 * berikutnya.
 */
export type ReportSnapshot = Omit<ReportAggregate, "period"> & {
  version: number;
  period: Omit<ReportAggregate["period"], "startDate" | "endDate"> & {
    startDate: string;
    endDate: string;
  };
};

export type StudentReportRefDTO = {
  id: string;
  name: string;
  nisn: string | null;
  avatarUrl: string | null;
};

export type StudentReportDTO = {
  id: string;
  foundationId: string;
  branchId: string;
  classId: string;
  studentId: string;
  periodId: string;
  status: ReportStatusTypes;
  teacherNarrative: string | null;
  homeroomNote: string | null;
  principalNote: string | null;
  snapshot: ReportSnapshot | null;
  completion: ReportCompletion | null;
  generatedAt: string | null;
  approvedAt: string | null;
  publishedAt: string | null;
  approvedById: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  student?: StudentReportRefDTO | null;
  period?: { id: string; name: string; status: string } | null;
  class?: { id: string; name: string } | null;
  approvedBy?: { id: string; name: string } | null;
};
