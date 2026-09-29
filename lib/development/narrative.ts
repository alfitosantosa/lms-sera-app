import { type ReportAggregate } from "@/app/(types)";

/**
 * Draft narasi rapor (Bahasa Indonesia) — template murni, **tanpa LLM**
 * (PRD §20: narasi selalu berstatus draft menunggu peninjauan guru).
 *
 * Fungsi ini deterministik: masukan agregat yang sama selalu menghasilkan teks
 * yang sama, sehingga aman untuk regenerasi & audit.
 */
export function buildNarrativeDraft(aggregate: ReportAggregate): string {
  const { student, period, development, academic, assignments, attendance } =
    aggregate;
  const lines: string[] = [];

  lines.push(
    `Rapor perkembangan ananda ${student.name} pada periode ${period.name} (semester ${period.semester}) di kelas ${student.class}.`,
  );

  if (development.length === 0) {
    lines.push(
      "Belum ada catatan penilaian perkembangan pada periode ini.",
    );
  } else {
    lines.push("");
    lines.push("Capaian perkembangan:");
    for (const area of development) {
      const scale = area.finalScale
        ? `${area.finalScale.label} (${area.finalScale.code})`
        : "belum dinilai";
      lines.push(`- ${area.area}: ${scale}.`);
    }
  }

  // Section akademik hanya muncul bila ada baris rapor (jangan isi 0 palsu).
  if (academic.length > 0) {
    lines.push("");
    lines.push("Capaian akademik:");
    for (const row of academic) {
      const grade = row.letterGrade ? ` (${row.letterGrade})` : "";
      lines.push(`- ${row.subject}: ${row.finalScore}${grade}.`);
    }
  }

  lines.push("");
  lines.push(
    attendance.total > 0
      ? `Kehadiran ${attendance.percent}%: hadir ${attendance.present}, terlambat ${attendance.late}, sakit ${attendance.sick}, izin ${attendance.excused}, alfa ${attendance.absent}.`
      : "Belum ada data kehadiran pada periode ini.",
  );

  if (assignments.length > 0) {
    lines.push(`Tugas yang dikumpulkan: ${assignments.length} tugas.`);
  }

  lines.push("");
  lines.push(
    "Catatan ini merupakan draft yang menunggu peninjauan dan persetujuan guru.",
  );
  return lines.join("\n");
}
