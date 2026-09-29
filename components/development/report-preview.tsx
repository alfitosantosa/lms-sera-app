import { type ReportPreviewSnapshot } from "@/app/(types)";
import {
  toReportPdfData,
  type ReportPdfContext,
  type ReportPdfData,
} from "@/lib/report/report.pdf.data";
import { cn } from "@/lib/utils";

const fmtDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-foreground mt-6 mb-2 border-b pb-1 text-sm font-semibold tracking-wide uppercase">
      {children}
    </h3>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 py-0.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

function DataTable({
  head,
  rows,
  empty,
}: {
  head: string[];
  rows: React.ReactNode[][];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="text-muted-foreground text-sm italic">{empty}</p>;
  }
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="bg-muted/60">
          {head.map((h) => (
            <th
              key={h}
              className="border px-2 py-1 text-left text-xs font-semibold"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((cells, index) => (
          <tr key={index}>
            {cells.map((cell, cellIndex) => (
              <td key={cellIndex} className="border px-2 py-1 align-top">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Pemetaan section §64 — yang kosong disembunyikan, bukan tabel kosong. */
function PreviewBody({ data }: { data: ReportPdfData }) {
  return (
    <div className="text-foreground">
      {/* ── Kepala: logo, yayasan, cabang ── */}
      <div className="flex items-center gap-4 border-b pb-4">
        {data.school.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.school.logoUrl}
            alt={data.school.foundationName}
            className="h-16 w-16 object-contain"
          />
        ) : null}
        <div>
          <p className="text-lg font-bold">{data.school.foundationName}</p>
          <p className="text-muted-foreground text-sm">
            {data.school.branchName} · Kelas {data.school.className}
          </p>
          <p className="text-muted-foreground text-xs">
            Tahun Ajaran {data.period.academicYear ?? "-"} ·{" "}
            {data.period.semesterLabel}
          </p>
        </div>
      </div>

      {/* ── Identitas siswa ── */}
      <SectionTitle>Identitas Siswa</SectionTitle>
      <Row label="Nama" value={data.student.name} />
      <Row label="NISN" value={data.student.nisn ?? "-"} />
      <Row label="Kelas" value={data.school.className} />
      <Row label="Periode" value={data.period.name} />
      <Row
        label="Rentang"
        value={`${fmtDate(data.period.startDate)} – ${fmtDate(data.period.endDate)}`}
      />

      {/* ── Hasil perkembangan ── */}
      <SectionTitle>Hasil Perkembangan</SectionTitle>
      <DataTable
        head={["Area", "Indikator", "Skala", "Catatan"]}
        empty="Belum ada data perkembangan pada periode ini."
        rows={data.development.flatMap((area) =>
          area.indicators.length === 0
            ? [[area.area, "-", area.finalScale?.label ?? "-", "-"]]
            : area.indicators.map((indicator, index) => [
                index === 0 ? area.area : "",
                indicator.indicator,
                indicator.scale,
                indicator.note ?? "-",
              ]),
        )}
      />

      {/* ── Hasil akademik (dormant ReportCard) — hanya bila ada baris ── */}
      {data.academic.length > 0 ? (
        <>
          <SectionTitle>Hasil Akademik</SectionTitle>
          <DataTable
            head={["Mata Pelajaran", "Nilai", "Huruf", "Predikat"]}
            empty="Belum ada nilai akademik."
            rows={data.academic.map((row) => [
              row.subject,
              String(row.finalScore),
              row.letterGrade ?? "-",
              row.predicate ?? "-",
            ])}
          />
        </>
      ) : null}

      {/* ── Kehadiran — hanya bila ada data ── */}
      {data.attendance ? (
        <>
          <SectionTitle>Ringkasan Kehadiran</SectionTitle>
          <div className="grid grid-cols-3 gap-2 text-sm sm:grid-cols-6">
            {[
              ["Hadir", data.attendance.present],
              ["Terlambat", data.attendance.late],
              ["Sakit", data.attendance.sick],
              ["Izin", data.attendance.excused],
              ["Alfa", data.attendance.absent],
              ["Persentase", `${data.attendance.percent}%`],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded border p-2 text-center">
                <p className="text-muted-foreground text-xs">{label}</p>
                <p className="font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {/* ── Narasi ── */}
      {data.narrative.teacherNarrative ? (
        <>
          <SectionTitle>Narasi Guru</SectionTitle>
          <p className="text-sm whitespace-pre-wrap">
            {data.narrative.teacherNarrative}
          </p>
        </>
      ) : null}

      {data.narrative.homeroomNote ? (
        <>
          <SectionTitle>Catatan Wali Kelas</SectionTitle>
          <p className="text-sm whitespace-pre-wrap">
            {data.narrative.homeroomNote}
          </p>
        </>
      ) : null}

      {data.narrative.principalNote ? (
        <>
          <SectionTitle>Catatan Kepala Sekolah</SectionTitle>
          <p className="text-sm whitespace-pre-wrap">
            {data.narrative.principalNote}
          </p>
        </>
      ) : null}

      {/* ── Tanda tangan ── */}
      <SectionTitle>Tanda Tangan</SectionTitle>
      <div className="mt-2 grid grid-cols-3 gap-4 text-center text-sm">
        {[
          {
            role: data.signature.approverRole,
            name: data.signature.approverName,
            image: null,
          },
          {
            role: "Kepala Sekolah",
            name: data.signature.principalName,
            image: data.signature.principalSignatureUrl,
          },
          { role: "Orang Tua / Wali", name: null, image: null },
        ].map(({ role, name, image }) => (
          <div key={role ?? "penyetuju"}>
            <div className="h-16">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt={role ?? "Tanda tangan"}
                  className="mx-auto h-16 object-contain"
                />
              ) : null}
            </div>
            <div className="border-t pt-1">
              <p className="font-medium">{name ?? "\u00a0"}</p>
              <p className="text-muted-foreground text-xs">{role ?? "\u00a0"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Preview cetak rapor dari **snapshot tersimpan** (bukan query live). Semua
 * section memakai pemetaan yang sama dengan PDF supaya hasil cetak tidak
 * berbeda dari unduhan.
 */
export function ReportPreview({
  snapshot,
  context,
  className,
}: {
  snapshot: ReportPreviewSnapshot;
  context?: ReportPdfContext;
  className?: string;
}) {
  const data = toReportPdfData(snapshot, context);
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-3xl rounded-lg border bg-white p-8 shadow-sm",
        "print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none",
        className,
      )}
    >
      <PreviewBody data={data} />
      <p className="text-muted-foreground mt-6 border-t pt-2 text-right text-xs">
        Dicetak {fmtDate(new Date().toISOString())}
      </p>
    </div>
  );
}
