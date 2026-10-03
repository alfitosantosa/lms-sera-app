import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroCharts } from "./HeroCharts";

/* Presensi is marked by letter, the way a class register is marked. */
type Mark = "H" | "S" | "I" | "A";

const MARKS: Mark[] = ["H", "S", "I", "A"];

const MARK_LABEL: Record<Mark, string> = {
  H: "Hadir",
  S: "Sakit",
  I: "Izin",
  A: "Alfa",
};

/* The domain map of DESIGN.md §1: sakit rides `warning`, izin rides `info`. */
const MARK_CHIP: Record<Mark, string> = {
  H: "bg-success-chip text-success-strong",
  S: "bg-warning-chip text-warning-strong",
  I: "bg-info-chip text-info-strong",
  A: "bg-destructive-chip text-destructive-strong",
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

/* A colored edge on each row, so payment status reads down the page. */
const STATUS_EDGE: Record<Status, string> = {
  LUNAS: "border-l-success-strong",
  MENUNGGU: "border-l-warning-strong",
  TUNGGAKAN: "border-l-destructive-strong",
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

/**
 * The masthead. Left-aligned on DESIGN.md's light blue gradient, with the
 * register below it as the one wide object on the page — it overlaps the
 * band's lower edge, so the sheet starts on the band and finishes on the
 * canvas. Color carries meaning here: every tint is a status in the data.
 */
export function Hero() {
  const diterima = ROWS.filter((r) => r.status === "LUNAS").reduce(
    (sum, r) => sum + r.spp,
    0,
  );
  const tertunggak = ROWS.reduce((sum, r) => sum + r.spp, 0) - diterima;
  const hadir = ROWS.filter((r) => r.mark === "H").length;
  const tidakHadir = ROWS.length - hadir;

  const presensiData = MARKS.map((mark) => ({
    mark,
    count: ROWS.filter((r) => r.mark === mark).length,
  }));
  const sppData = ROWS.map((r) => ({
    nama: r.nama.split(" ")[0],
    spp: r.spp,
    status: r.status,
  }));

  const tiles = [
    {
      label: "Hadir",
      value: `${hadir} dari ${ROWS.length}`,
      cls: "border-success-border bg-success-surface",
      text: "text-success-strong",
    },
    {
      label: "Sakit, izin, alfa",
      value: `${tidakHadir} siswa`,
      cls: "border-warning-border bg-warning-surface",
      text: "text-warning-strong",
    },
    {
      label: "SPP diterima",
      value: rupiah(diterima),
      cls: "border-interactive-border bg-brand-tint",
      text: "text-primary",
    },
    {
      label: "SPP tertunggak",
      value: rupiah(tertunggak),
      cls: "border-destructive-border bg-destructive-surface",
      text: "text-destructive-strong",
    },
  ];

  return (
    <>
      <section className="from-brand-tint via-brand-tint/55 to-background border-border border-b bg-linear-to-b">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-48 sm:pt-24">
          <p className="animate-element animate-delay-100 border-interactive-border bg-card text-primary inline-flex rounded-full border px-3 py-1 text-xs font-medium tracking-wide">
            SMP, SMA, dan SMK IT dalam satu yayasan
          </p>

          <h1 className="animate-element animate-delay-200 mt-6 max-w-[24ch] text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.04] font-bold tracking-[-0.04em] text-balance">
            Presensi, tahfidz, dan tagihan SPP siswa dalam satu catatan.
          </h1>

          <p className="text-muted-foreground animate-element animate-delay-300 mt-5 max-w-[58ch] text-lg leading-relaxed text-pretty">
            Guru mencatat kehadiran per jadwal, bendahara memverifikasi setoran,
            dan orang tua menerima ringkasannya lewat WhatsApp. Data tiap cabang
            berdiri sendiri.
          </p>

          <div className="animate-element animate-delay-400 mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/auth/sign-in">Daftar yayasan</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-card w-full sm:w-auto"
            >
              <Link href="/auth/sign-in">Masuk ke akun</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* The register itself — the one wide object, on the canvas. */}
      <section className="mx-auto -mt-36 max-w-6xl px-6">
        <div className="border-border bg-card animate-element animate-delay-500 overflow-hidden rounded-3xl border shadow-lg">
          <div className="border-border text-muted-foreground flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b px-4 py-3 text-sm">
            <span className="text-foreground font-medium">
              Register kelas VII-A dan VII-B
            </span>
            <span>Pekan berjalan</span>
          </div>

          {/* Recap, colored by what it counts. */}
          <dl className="border-border grid grid-cols-2 gap-3 border-b p-4 lg:grid-cols-4">
            {tiles.map((tile) => (
              <div
                key={tile.label}
                className={`rounded-2xl border px-4 py-3 ${tile.cls}`}
              >
                <dt className="text-secondary-foreground text-xs">
                  {tile.label}
                </dt>
                <dd
                  className={`mt-1 text-lg font-semibold tracking-tight tabular-nums ${tile.text}`}
                >
                  {tile.value}
                </dd>
              </div>
            ))}
          </dl>

          <HeroCharts presensi={presensiData} spp={sppData} />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Contoh register presensi, setoran tahfidz, dan SPP untuk kelas
                VII-A dan VII-B
              </caption>
              <thead className="border-border border-b">
                <tr>
                  <th
                    scope="col"
                    rowSpan={2}
                    className="text-muted-foreground px-3 py-2 text-xs font-medium"
                  >
                    Kelas
                  </th>
                  <th
                    scope="col"
                    rowSpan={2}
                    className="text-muted-foreground hidden px-3 py-2 text-xs font-medium md:table-cell"
                  >
                    NISN
                  </th>
                  <th
                    scope="col"
                    rowSpan={2}
                    className="text-muted-foreground px-3 py-2 text-xs font-medium"
                  >
                    Nama siswa
                  </th>
                  <th
                    scope="colgroup"
                    colSpan={4}
                    className="border-border text-muted-foreground border-l px-3 py-2 text-center text-xs font-medium"
                  >
                    Presensi
                  </th>
                  <th
                    scope="col"
                    rowSpan={2}
                    className="border-border text-muted-foreground hidden border-l px-3 py-2 text-xs font-medium lg:table-cell"
                  >
                    Setoran terakhir
                  </th>
                  <th
                    scope="col"
                    rowSpan={2}
                    className="text-muted-foreground hidden px-3 py-2 text-right text-xs font-medium sm:table-cell"
                  >
                    SPP bulan ini
                  </th>
                  <th
                    scope="col"
                    rowSpan={2}
                    className="text-muted-foreground px-3 py-2 text-xs font-medium"
                  >
                    Status
                  </th>
                </tr>
                <tr>
                  {MARKS.map((mark) => (
                    <th
                      key={mark}
                      scope="col"
                      abbr={MARK_LABEL[mark]}
                      className="border-border w-8 border-l px-0 py-2 text-center text-xs"
                    >
                      {mark}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr
                    key={row.nisn}
                    className="border-border odd:bg-accent/60 border-b last:border-b-0"
                  >
                    <td
                      className={`text-muted-foreground border-l-4 px-3 py-3 text-xs ${STATUS_EDGE[row.status]}`}
                    >
                      {row.kelas}
                    </td>
                    <td className="text-muted-foreground hidden px-3 py-3 font-mono text-xs md:table-cell">
                      {row.nisn}
                    </td>
                    <td className="px-3 py-3 font-medium whitespace-nowrap">
                      {row.nama}
                    </td>
                    {MARKS.map((mark) => (
                      <td
                        key={mark}
                        className="border-border w-8 border-l px-0 py-3 text-center"
                      >
                        {row.mark === mark ? (
                          <span
                            className={`inline-grid size-6 place-content-center rounded-lg text-xs font-semibold ${MARK_CHIP[mark]}`}
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
                    <td className="border-border hidden border-l px-3 py-3 lg:table-cell">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-grid size-6 shrink-0 place-content-center rounded-lg border text-xs font-semibold ${GRADE_CHIP[row.grade]}`}
                          title={`Nilai ${row.grade}`}
                        >
                          {row.grade}
                        </span>
                        <span>
                          <span className="font-arabic block text-[15px] leading-tight">
                            {row.surah.arabic}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {row.surah.latin} {row.surah.ayat}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-3 py-3 text-right tabular-nums sm:table-cell">
                      {rupiah(row.spp)}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_CHIP[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend and the closing mark. */}
          <div className="border-border bg-secondary/60 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t px-4 py-3">
            <ul className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              {MARKS.map((mark) => (
                <li key={mark} className="flex items-center gap-1.5">
                  <span
                    className={`inline-grid size-5 place-content-center rounded-md text-[11px] font-semibold ${MARK_CHIP[mark]}`}
                  >
                    {mark}
                  </span>
                  {MARK_LABEL[mark]}
                </li>
              ))}
            </ul>
            <span className="bg-success-chip text-success-strong rounded-full px-3 py-1 text-xs font-semibold">
              Terverifikasi
            </span>
          </div>
        </div>

        <p className="text-muted-foreground animate-element animate-delay-600 mt-3 max-w-[68ch] text-xs">
          Contoh tampilan register. Nama dan angka pada tabel di atas adalah
          ilustrasi, bukan data siswa yang sebenarnya.
        </p>
      </section>
    </>
  );
}
