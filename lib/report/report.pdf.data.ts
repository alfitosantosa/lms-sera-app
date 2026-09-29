import { type ReportSnapshot } from "@/app/(types)";

/**
 * Bentuk data PDF rapor (PRD §64) — hasil pemetaan **murni** dari `snapshot`
 * yang sudah membeku, bukan dari query live. Dipakai bersama oleh dokumen PDF
 * (`studentReport.tsx`) dan preview cetak (`report-preview.tsx`) supaya tidak
 * ada dua sumber kebenaran tata letak.
 *
 * Section yang tidak ada pada snapshot dipetakan ke **koleksi kosong / `null`**,
 * bukan angka nol palsu — dokumen lalu menyembunyikan section tersebut.
 */
export type ReportPdfIndicator = {
  indicator: string;
  scale: string;
  scaleValue: number;
  note: string | null;
};

export type ReportPdfDevelopmentRow = {
  area: string;
  indicators: ReportPdfIndicator[];
  finalScale: { code: string; label: string; value: number } | null;
};

export type ReportPdfAcademicRow = {
  subject: string;
  finalScore: number;
  letterGrade: string | null;
  predicate: string | null;
};

/**
 * Data yang dimiliki baris `StudentReport` tetapi **tidak** ikut membeku di
 * dalam `snapshot` (narasi adalah kolom terpisah, bukan bagian agregat).
 * Semuanya opsional: pemanggil tanpa data ini tetap mendapat bentuk lengkap.
 */
export type ReportPdfContext = {
  teacherNarrative?: string | null;
  homeroomNote?: string | null;
  principalNote?: string | null;
  /** Nama wali kelas yang menyetujui (`approvedBy.name`). */
  approvedByName?: string | null;
  /** Aset branding yayasan — tidak disimpan di snapshot. */
  logoUrl?: string | null;
  branchSignatureUrl?: string | null;
};

export type ReportPdfData = {
  school: {
    foundationName: string;
    branchName: string;
    className: string;
    /** `null` bila pemanggil tidak punya URL logo; dokumen menyembunyikannya. */
    logoUrl: string | null;
  };
  student: {
    name: string;
    nisn: string | null;
    avatarUrl: string | null;
  };
  period: {
    name: string;
    academicYear: string | null;
    semester: number;
    semesterLabel: string;
    startDate: string;
    endDate: string;
  };
  development: ReportPdfDevelopmentRow[];
  academic: ReportPdfAcademicRow[];
  /** `null` bila tidak ada data kehadiran — jangan tampilkan tabel nol. */
  attendance: ReportSnapshot["attendance"] | null;
  narrative: {
    teacherNarrative: string | null;
    homeroomNote: string | null;
    principalNote: string | null;
    /** True bila minimal satu catatan terisi. */
    hasAny: boolean;
  };
  signature: {
    branchSignatureUrl: string | null;
    homeroomName: string | null;
    principalName: string | null;
  };
};

const semesterLabel = (semester: number): string =>
  semester === 2 ? "Semester 2 (Genap)" : "Semester 1 (Ganjil)";

/**
 * Pemetaan murni snapshot → data PDF. Tidak ada I/O, tidak ada `Date.now()`,
 * tidak ada query live — masukan yang sama selalu menghasilkan keluaran sama.
 */
export function toReportPdfData(
  snapshot: ReportSnapshot,
  context: ReportPdfContext = {},
): ReportPdfData {
  const development: ReportPdfDevelopmentRow[] = (
    snapshot.development ?? []
  ).map((area) => ({
    area: area.area,
    indicators: (area.indicators ?? []).map((indicator) => ({
      indicator: indicator.indicator,
      scale: indicator.scale,
      scaleValue: indicator.scaleValue,
      note: indicator.note,
    })),
    finalScale: area.finalScale,
  }));

  const academic: ReportPdfAcademicRow[] = (snapshot.academic ?? []).map(
    (row) => ({
      subject: row.subject,
      finalScore: row.finalScore,
      letterGrade: row.letterGrade,
      predicate: row.predicate,
    }),
  );

  const attendance = snapshot.attendance;
  const hasAttendance = Boolean(attendance && attendance.total > 0);

  const teacherNarrative = context.teacherNarrative ?? null;
  const homeroomNote = context.homeroomNote ?? null;
  const principalNote = context.principalNote ?? null;

  return {
    school: {
      foundationName: snapshot.student.foundation,
      branchName: snapshot.student.branch,
      className: snapshot.student.class,
      logoUrl: context.logoUrl ?? null,
    },
    student: {
      name: snapshot.student.name,
      nisn: snapshot.student.nisn,
      avatarUrl: snapshot.student.avatarUrl,
    },
    period: {
      name: snapshot.period.name,
      academicYear: snapshot.academicYear,
      semester: snapshot.period.semester,
      semesterLabel: semesterLabel(snapshot.period.semester),
      startDate: snapshot.period.startDate,
      endDate: snapshot.period.endDate,
    },
    development,
    academic,
    attendance: hasAttendance ? attendance : null,
    narrative: {
      teacherNarrative,
      homeroomNote,
      principalNote,
      hasAny: Boolean(teacherNarrative || homeroomNote || principalNote),
    },
    signature: {
      branchSignatureUrl: context.branchSignatureUrl ?? null,
      homeroomName: context.approvedByName ?? null,
      principalName: null,
    },
  };
}
