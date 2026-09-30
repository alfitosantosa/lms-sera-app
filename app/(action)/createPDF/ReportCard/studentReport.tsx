"use client";

import {
  type ReportPdfData,
  type ReportPdfDevelopmentRow,
} from "@/lib/report/report.pdf.data";
import {
  Document,
  Image,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — react-pdf tidak bisa membaca CSS variable, jadi nilai design
// system ditulis sebagai literal (lihat DESIGN.md §1).
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  ink: "#16283A",
  sub: "#40566b",
  muted: "#5C6E80",
  border: "#C6CED6",
  stripe: "#F4F7EF",
  navy: "#10263A",
};

const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: C.ink,
    paddingTop: 32,
    paddingHorizontal: 36,
    paddingBottom: 48,
  },

  // ── Kepala ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingBottom: 10,
  },
  logo: { width: 48, height: 48, objectFit: "contain" },
  foundation: { fontSize: 14, fontFamily: "Helvetica-Bold", color: C.navy },
  branch: { fontSize: 9, color: C.sub, marginTop: 2 },
  periodLine: { fontSize: 8, color: C.muted, marginTop: 2 },
  docTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginTop: 14,
    marginBottom: 8,
    letterSpacing: 1,
  },

  // ── Section ─────────────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: C.navy,
    marginTop: 14,
    marginBottom: 4,
    borderBottomWidth: 0.75,
    borderBottomColor: C.border,
    paddingBottom: 2,
  },
  row: { flexDirection: "row", marginBottom: 2 },
  rowLabel: { width: 110, color: C.muted },
  rowValue: { flex: 1, fontFamily: "Helvetica-Bold" },
  paragraph: { fontSize: 9, lineHeight: 1.5, color: C.sub },

  // ── Tabel ───────────────────────────────────────────────────────────────
  tableHead: {
    flexDirection: "row",
    backgroundColor: C.stripe,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: C.border,
  },
  th: {
    padding: 4,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.navy,
  },
  td: { padding: 4, fontSize: 8, color: C.ink },
  empty: { fontSize: 8, color: C.muted, fontStyle: "italic" },

  // ── Kehadiran ───────────────────────────────────────────────────────────
  attendanceRow: { flexDirection: "row", gap: 6, marginTop: 2 },
  attendanceCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: C.border,
    borderRadius: 3,
    padding: 5,
    alignItems: "center",
  },
  attendanceLabel: { fontSize: 7, color: C.muted },
  attendanceValue: { fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 2 },

  // ── Tanda tangan ────────────────────────────────────────────────────────
  signWrap: { flexDirection: "row", marginTop: 26, gap: 16 },
  signCol: { flex: 1, alignItems: "center" },
  signSpace: { height: 42 },
  signImage: { height: 42, objectFit: "contain", marginBottom: 2 },
  signLine: {
    borderBottomWidth: 0.75,
    borderBottomColor: C.ink,
    width: "100%",
    marginBottom: 3,
  },
  signName: { fontSize: 8.5, fontFamily: "Helvetica-Bold" },
  signRole: { fontSize: 7.5, color: C.muted, marginTop: 1 },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    paddingTop: 4,
  },
  footerText: { fontSize: 7, color: C.muted },
});

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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View>
      <Text style={S.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function DevelopmentTable({ rows }: { rows: ReportPdfDevelopmentRow[] }) {
  if (rows.length === 0) {
    return (
      <Text style={S.empty}>
        Belum ada data perkembangan pada periode ini.
      </Text>
    );
  }
  return (
    <View>
      <View style={S.tableHead}>
        <Text style={[S.th, { width: "22%" }]}>Area</Text>
        <Text style={[S.th, { width: "34%" }]}>Indikator</Text>
        <Text style={[S.th, { width: "14%" }]}>Skala</Text>
        <Text style={[S.th, { width: "30%" }]}>Catatan</Text>
      </View>
      {rows.map((area, areaIndex) =>
        area.indicators.length === 0 ? (
          <View key={areaIndex} style={S.tableRow}>
            <Text style={[S.td, { width: "22%" }]}>{area.area}</Text>
            <Text style={[S.td, { width: "34%" }]}>-</Text>
            <Text style={[S.td, { width: "14%" }]}>
              {area.finalScale?.label ?? "-"}
            </Text>
            <Text style={[S.td, { width: "30%" }]}>-</Text>
          </View>
        ) : (
          area.indicators.map((indicator, index) => (
            <View key={`${areaIndex}-${index}`} style={S.tableRow}>
              <Text style={[S.td, { width: "22%" }]}>
                {index === 0 ? area.area : ""}
              </Text>
              <Text style={[S.td, { width: "34%" }]}>
                {indicator.indicator}
              </Text>
              <Text style={[S.td, { width: "14%" }]}>{indicator.scale}</Text>
              <Text style={[S.td, { width: "30%" }]}>
                {indicator.note ?? "-"}
              </Text>
            </View>
          ))
        ),
      )}
    </View>
  );
}

function ReportDocument({ data }: { data: ReportPdfData }) {
  const printedAt = fmtDate(new Date().toISOString());

  return (
    <Document>
      <Page size="A4" style={S.page} wrap>
        {/* ── Kepala: logo, yayasan, cabang ── */}
        <View style={S.header}>
          {data.school.logoUrl ? (
            <Image src={data.school.logoUrl} style={S.logo} />
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={S.foundation}>{data.school.foundationName}</Text>
            <Text style={S.branch}>
              {data.school.branchName}
              {"  ·  "}Kelas {data.school.className}
            </Text>
            <Text style={S.periodLine}>
              Tahun Ajaran {data.period.academicYear ?? "-"}
              {"  ·  "}
              {data.period.semesterLabel}
            </Text>
          </View>
        </View>

        <Text style={S.docTitle}>RAPOR PERKEMBANGAN SISWA</Text>

        {/* ── Identitas siswa ── */}
        <Section title="Identitas Siswa">
          <View style={S.row}>
            <Text style={S.rowLabel}>Nama</Text>
            <Text style={S.rowValue}>{data.student.name}</Text>
          </View>
          <View style={S.row}>
            <Text style={S.rowLabel}>NISN</Text>
            <Text style={S.rowValue}>{data.student.nisn ?? "-"}</Text>
          </View>
          <View style={S.row}>
            <Text style={S.rowLabel}>Kelas</Text>
            <Text style={S.rowValue}>{data.school.className}</Text>
          </View>
          <View style={S.row}>
            <Text style={S.rowLabel}>Periode</Text>
            <Text style={S.rowValue}>{data.period.name}</Text>
          </View>
          <View style={S.row}>
            <Text style={S.rowLabel}>Rentang</Text>
            <Text style={S.rowValue}>
              {fmtDate(data.period.startDate)} – {fmtDate(data.period.endDate)}
            </Text>
          </View>
        </Section>

        {/* ── Hasil perkembangan ── */}
        <Section title="Hasil Perkembangan">
          <DevelopmentTable rows={data.development} />
        </Section>

        {/* ── Hasil akademik — hanya bila ada baris (jangan tabel kosong) ── */}
        {data.academic.length > 0 ? (
          <Section title="Hasil Akademik">
            <View style={S.tableHead}>
              <Text style={[S.th, { width: "40%" }]}>Mata Pelajaran</Text>
              <Text style={[S.th, { width: "15%" }]}>Nilai</Text>
              <Text style={[S.th, { width: "15%" }]}>Huruf</Text>
              <Text style={[S.th, { width: "30%" }]}>Predikat</Text>
            </View>
            {data.academic.map((row) => (
              <View key={row.subject} style={S.tableRow}>
                <Text style={[S.td, { width: "40%" }]}>{row.subject}</Text>
                <Text style={[S.td, { width: "15%" }]}>
                  {String(row.finalScore)}
                </Text>
                <Text style={[S.td, { width: "15%" }]}>
                  {row.letterGrade ?? "-"}
                </Text>
                <Text style={[S.td, { width: "30%" }]}>
                  {row.predicate ?? "-"}
                </Text>
              </View>
            ))}
          </Section>
        ) : null}

        {/* ── Kehadiran — hanya bila ada data ── */}
        {data.attendance ? (
          <Section title="Ringkasan Kehadiran">
            <View style={S.attendanceRow}>
              {[
                ["Hadir", String(data.attendance.present)],
                ["Terlambat", String(data.attendance.late)],
                ["Sakit", String(data.attendance.sick)],
                ["Izin", String(data.attendance.excused)],
                ["Alfa", String(data.attendance.absent)],
                ["Kehadiran", `${data.attendance.percent}%`],
              ].map(([label, value]) => (
                <View key={label} style={S.attendanceCell}>
                  <Text style={S.attendanceLabel}>{label}</Text>
                  <Text style={S.attendanceValue}>{value}</Text>
                </View>
              ))}
            </View>
          </Section>
        ) : null}

        {/* ── Narasi ── */}
        {data.narrative.teacherNarrative ? (
          <Section title="Narasi Guru">
            <Text style={S.paragraph}>{data.narrative.teacherNarrative}</Text>
          </Section>
        ) : null}
        {data.narrative.homeroomNote ? (
          <Section title="Catatan Wali Kelas">
            <Text style={S.paragraph}>{data.narrative.homeroomNote}</Text>
          </Section>
        ) : null}
        {data.narrative.principalNote ? (
          <Section title="Catatan Kepala Sekolah">
            <Text style={S.paragraph}>{data.narrative.principalNote}</Text>
          </Section>
        ) : null}

        {/* ── Tanda tangan ── */}
        <View style={S.signWrap} wrap={false}>
          <View style={S.signCol}>
            <View style={S.signSpace} />
            <View style={S.signLine} />
            <Text style={S.signName}>{data.signature.approverName ?? " "}</Text>
            <Text style={S.signRole}>{data.signature.approverRole ?? " "}</Text>
          </View>
          <View style={S.signCol}>
            {data.signature.principalSignatureUrl ? (
              <Image
                src={data.signature.principalSignatureUrl}
                style={S.signImage}
              />
            ) : (
              <>
                <View style={S.signSpace} />
                <View style={S.signLine} />
              </>
            )}
            <Text style={S.signName}>
              {data.signature.principalName ?? " "}
            </Text>
            <Text style={S.signRole}>Kepala Sekolah</Text>
          </View>
          <View style={S.signCol}>
            <View style={S.signSpace} />
            <View style={S.signLine} />
            <Text style={S.signName}> </Text>
            <Text style={S.signRole}>Orang Tua / Wali</Text>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>{data.school.foundationName}</Text>
          <Text
            style={S.footerText}
            render={({ pageNumber, totalPages }) =>
              totalPages > 1 ? `Halaman ${pageNumber} dari ${totalPages}` : " "
            }
          />
          <Text style={S.footerText}>Dicetak {printedAt}</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT — buat blob lalu unduh, meniru `createPDFKwitansi`.
// ─────────────────────────────────────────────────────────────────────────────

export async function createPDFReportCard(data: ReportPdfData) {
  const blob = await pdf(<ReportDocument data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Rapor-${data.student.name.replace(/\s+/g, "-")}-${data.period.semesterLabel.replace(/\s+/g, "")}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
