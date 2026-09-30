import Link from "next/link";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";

const CLIENT_NAME = process.env.NEXT_PUBLIC_CLIENT_NAME || "Yayasan";

/* Presensi is marked by letter, the way a class register is marked. */
type Mark = "H" | "S" | "I" | "A";

const MARKS: Mark[] = ["H", "S", "I", "A"];

const MARK_LABEL: Record<Mark, string> = {
  H: "Hadir",
  S: "Sakit",
  I: "Izin",
  A: "Alfa",
};

const MARK_INK: Record<Mark, string> = {
  H: "text-success",
  S: "text-info",
  I: "text-warning",
  A: "text-destructive",
};

/* Tahfidz grades A–E, matching the dashboard's grade scale. */
type Grade = "A" | "B" | "C" | "D" | "E";

const GRADE_CHIP: Record<Grade, string> = {
  A: "border-success-border bg-success-surface text-success-strong",
  B: "border-info-border bg-info-surface text-info-strong",
  C: "border-warning-border bg-warning-surface text-warning-strong",
  D: "border-caution-border bg-caution-surface text-caution-strong",
  E: "border-destructive-border bg-destructive-surface text-destructive-strong",
};

type Status = "LUNAS" | "MENUNGGU" | "TUNGGAKAN";

const STATUS_CHIP: Record<Status, string> = {
  LUNAS: "border-success-border bg-success-surface text-success-strong",
  MENUNGGU: "border-warning-border bg-warning-surface text-warning-strong",
  TUNGGAKAN:
    "border-destructive-border bg-destructive-surface text-destructive-strong",
};

type RegisterRow = {
  kelas: string;
  nisn: string;
  nama: string;
  mark: Mark;
  surah: { arabic: string; latin: string; ayat: string };
  grade: Grade;
  spp: number;
  status: Status;
};

/**
 * Illustrative rows so the register reads as a real one. Surah names, verse
 * counts and the grade scale are the platform's actual data shapes
 * (`SurahQuran.name`, `SurahQuran.nameLatin`, `TahfidzRecord.startVerse`,
 * `Attendance.status`, `Payment.status`). The students are not real people —
 * the caption under the table says so.
 */
const ROWS: RegisterRow[] = [
  {
    kelas: "VII-A",
    nisn: "0071234567",
    nama: "Ahmad Fauzi N.",
    mark: "H",
    surah: { arabic: "البقرة", latin: "Al-Baqarah", ayat: "255" },
    grade: "A",
    spp: 450000,
    status: "LUNAS",
  },
  {
    kelas: "VII-A",
    nisn: "0071234581",
    nama: "Nabila Rahmawati",
    mark: "I",
    surah: { arabic: "النبأ", latin: "An-Naba", ayat: "1–20" },
    grade: "B",
    spp: 375000,
    status: "LUNAS",
  },
  {
    kelas: "VII-A",
    nisn: "0071234594",
    nama: "Hafizh Abdurrahman",
    mark: "H",
    surah: { arabic: "يس", latin: "Yasin", ayat: "1–12" },
    grade: "A",
    spp: 500000,
    status: "LUNAS",
  },
  {
    kelas: "VII-B",
    nisn: "0071234602",
    nama: "Salsabila Putri",
    mark: "S",
    surah: { arabic: "الملك", latin: "Al-Mulk", ayat: "1–10" },
    grade: "B",
    spp: 425000,
    status: "MENUNGGU",
  },
  {
    kelas: "VII-B",
    nisn: "0071234617",
    nama: "Ibrahim Malik",
    mark: "A",
    surah: { arabic: "الكهف", latin: "Al-Kahf", ayat: "1–10" },
    grade: "C",
    spp: 300000,
    status: "TUNGGAKAN",
  },
  {
    kelas: "VII-B",
    nisn: "0071234629",
    nama: "Khadijah Aulia",
    mark: "H",
    surah: { arabic: "الرحمن", latin: "Ar-Rahman", ayat: "1–13" },
    grade: "A",
    spp: 475000,
    status: "LUNAS",
  },
];

const rupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

/** One mark every 32ms down the column, then the stamp lands. */
const markDelay = (row: number, col: number) => `${(row * 4 + col) * 32}ms`;

export function Hero() {
  const diterima = ROWS.filter((r) => r.status === "LUNAS").reduce(
    (sum, r) => sum + r.spp,
    0,
  );
  const tertunggak = ROWS.reduce((sum, r) => sum + r.spp, 0) - diterima;

  return (
    <section className="mx-auto max-w-6xl px-6 pt-12 pb-20 sm:pt-16">
      {/* Masthead — the head of the sheet. */}
      <div className="border-foreground border-t-2 pt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <span className="font-display text-[11px] tracking-wide">
            BUKU INDUK
          </span>
          <span className="font-display text-muted-foreground text-[11px] tracking-wide">
            {CLIENT_NAME.toUpperCase()}
          </span>
        </div>

        <h1 className="font-display mt-5 max-w-[22ch] text-[clamp(2.25rem,5.5vw,3.5rem)] leading-[1.06] font-semibold tracking-tight text-balance">
          Satu register untuk SMP, SMA, dan SMK IT.
        </h1>

        <p className="text-secondary-foreground mt-6 max-w-[68ch] text-base leading-relaxed">
          Presensi per jadwal, setoran tahfidz, SPP online, dan rapor duduk di
          satu tempat. Data tiap cabang terpisah, dan setiap perubahan
          tercatat.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href="/landing/register/foundation">Daftar yayasan</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#cakupan">Lihat cakupan modul</Link>
          </Button>
        </div>
      </div>

      {/* The register itself. */}
      <div className="mt-16 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t-2 border-foreground pt-3">
        <span className="font-display text-[11px] tracking-wide">
          REGISTER KELAS VII-A DAN VII-B
        </span>
        <span className="font-display text-muted-foreground text-[11px] tracking-wide">
          PEKAN BERJALAN
        </span>
      </div>

      <div className="border-border mt-3 overflow-x-auto border">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Contoh register presensi, setoran tahfidz, dan SPP untuk kelas VII-A
            dan VII-B
          </caption>
          <thead className="border-border border-b">
            <tr>
              <th
                scope="col"
                rowSpan={2}
                className="px-3 py-2 text-[11px] tracking-wide"
              >
                KELAS
              </th>
              <th
                scope="col"
                rowSpan={2}
                className="hidden px-3 py-2 text-[11px] tracking-wide md:table-cell"
              >
                NISN
              </th>
              <th
                scope="col"
                rowSpan={2}
                className="px-3 py-2 text-[11px] tracking-wide"
              >
                NAMA SISWA
              </th>
              <th
                scope="colgroup"
                colSpan={4}
                className="border-border border-l px-3 py-2 text-center text-[11px] tracking-wide"
              >
                PRESENSI
              </th>
              <th
                scope="col"
                rowSpan={2}
                className="border-border hidden border-l px-3 py-2 text-[11px] tracking-wide lg:table-cell"
              >
                SETORAN TERAKHIR
              </th>
              <th
                scope="col"
                rowSpan={2}
                className="hidden px-3 py-2 text-right text-[11px] tracking-wide sm:table-cell"
              >
                SPP BULAN INI
              </th>
              <th
                scope="col"
                rowSpan={2}
                className="px-3 py-2 text-[11px] tracking-wide"
              >
                STATUS
              </th>
            </tr>
            <tr>
              {MARKS.map((mark) => (
                <th
                  key={mark}
                  scope="col"
                  abbr={MARK_LABEL[mark]}
                  className="border-border w-8 border-l px-0 py-2 text-center text-[11px]"
                >
                  {mark}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, ri) => (
              <tr
                key={row.nisn}
                className="border-border odd:bg-accent/60 border-b last:border-b-0"
              >
                <td className="text-muted-foreground px-3 py-2.5 text-xs">
                  {row.kelas}
                </td>
                <td className="text-muted-foreground hidden px-3 py-2.5 font-mono text-xs md:table-cell">
                  {row.nisn}
                </td>
                <td className="px-3 py-2.5 font-medium whitespace-nowrap">
                  {row.nama}
                </td>
                {MARKS.map((mark, ci) => (
                  <td
                    key={mark}
                    className="border-border w-8 border-l px-0 py-2.5 text-center"
                  >
                    {row.mark === mark ? (
                      <span
                        className={`mark-in font-display inline-block font-semibold ${MARK_INK[mark]}`}
                        style={
                          { "--mark-delay": markDelay(ri, ci) } as CSSProperties
                        }
                      >
                        {mark}
                      </span>
                    ) : (
                      <span className="text-border select-none" aria-hidden>
                        ·
                      </span>
                    )}
                  </td>
                ))}
                <td className="border-border hidden border-l px-3 py-2.5 lg:table-cell">
                  <span className="font-arabic block text-[15px] leading-tight">
                    {row.surah.arabic}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {row.surah.latin} {row.surah.ayat}
                  </span>
                </td>
                <td className="hidden px-3 py-2.5 text-right tabular-nums sm:table-cell">
                  {rupiah(row.spp)}
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={`inline-block rounded-sm border px-1.5 py-0.5 text-[11px] font-medium ${STATUS_CHIP[row.status]}`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Recap and stamp. */}
        <div className="border-border bg-secondary/60 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t px-3 py-3">
          <span className="font-display text-[11px] tracking-wide">
            REKAP PEKAN INI
          </span>
          <dl className="flex flex-wrap items-baseline gap-x-7 gap-y-2 text-sm">
            <div className="flex items-baseline gap-2">
              <dt className="text-muted-foreground text-[11px]">DITERIMA</dt>
              <dd className="font-medium tabular-nums">{rupiah(diterima)}</dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="text-muted-foreground text-[11px]">TERTUNGGAK</dt>
              <dd className="text-destructive font-medium tabular-nums">
                {rupiah(tertunggak)}
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="text-muted-foreground text-[11px]">SISWA</dt>
              <dd className="font-medium tabular-nums">{ROWS.length}</dd>
            </div>
          </dl>
          <span
            className="stamp-in text-brand-accent border-brand-accent/60 rounded-sm border-2 px-3 py-1"
            style={{ "--stamp-delay": "880ms" } as CSSProperties}
          >
            <span className="font-display text-[11px] font-semibold tracking-wide">
              TERVERIFIKASI
            </span>
          </span>
        </div>
      </div>

      <p className="text-muted-foreground mt-3 max-w-[68ch] text-xs">
        Contoh tampilan register. Nama dan angka pada tabel di atas adalah
        ilustrasi, bukan data siswa yang sebenarnya.
      </p>
    </section>
  );
}
