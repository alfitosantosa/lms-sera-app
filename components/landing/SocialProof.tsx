/* Every value below is traceable to prisma/schema.prisma or PRD.md. */
const BRANCHES = [
  {
    code: "SMP-IT",
    jenjang: "Sekolah menengah pertama",
    mencatat: "Presensi per jadwal, rapor, dan catatan pelanggaran",
  },
  {
    code: "SMA-IT",
    jenjang: "Sekolah menengah atas",
    mencatat: "Rapor, ujian, tugas, dan setoran tahfidz",
  },
  {
    code: "SMK-IT",
    jenjang: "Sekolah menengah kejuruan",
    mencatat: "Rapor, ujian, tugas, dan rekening SPP tersendiri",
  },
];

const TOTALS = [
  { label: "CABANG", value: "3" },
  { label: "PERAN", value: "5" },
  { label: "TABEL DATA", value: "51" },
];

/**
 * Not a customer wall — the structure the platform actually runs: one yayasan,
 * one branch per jenjang, each with its own bank account and admin.
 */
export function SocialProof() {
  return (
    <section className="border-border bg-secondary border-y">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="border-foreground flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t-2 pt-3">
          <span className="font-display text-[11px] tracking-wide">
            STRUKTUR YAYASAN
          </span>
          <span className="font-display text-muted-foreground text-[11px] tracking-wide">
            SATU FOUNDATION, TIGA CABANG
          </span>
        </div>

        <table className="mt-6 w-full text-left text-sm">
          <caption className="sr-only">
            Cabang sekolah yang berjalan di dalam satu yayasan
          </caption>
          <thead className="border-border border-b">
            <tr>
              <th scope="col" className="py-2 pr-4 text-[11px] tracking-wide">
                KODE CABANG
              </th>
              <th
                scope="col"
                className="hidden py-2 pr-4 text-[11px] tracking-wide sm:table-cell"
              >
                JENJANG
              </th>
              <th scope="col" className="py-2 text-[11px] tracking-wide">
                YANG DICATAT
              </th>
            </tr>
          </thead>
          <tbody>
            {BRANCHES.map((branch) => (
              <tr
                key={branch.code}
                className="border-border odd:bg-accent/60 border-b last:border-b-0"
              >
                <td className="py-3 pr-4 font-mono text-xs whitespace-nowrap">
                  {branch.code}
                </td>
                <td className="text-muted-foreground hidden py-3 pr-4 text-xs sm:table-cell">
                  {branch.jenjang}
                </td>
                <td className="py-3">{branch.mencatat}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-secondary-foreground mt-5 max-w-[68ch] text-sm leading-relaxed">
          Setiap cabang punya rekening bank, admin, dan tanda tangan digitalnya
          sendiri. Guru, bendahara, siswa, dan orang tua hanya melihat data
          cabangnya.
        </p>

        <dl className="border-border mt-8 grid grid-cols-3 gap-px border">
          {TOTALS.map((total) => (
            <div key={total.label} className="bg-card px-4 py-3">
              <dt className="font-display text-muted-foreground text-[11px] tracking-wide">
                {total.label}
              </dt>
              <dd className="font-display mt-1 text-2xl font-semibold tabular-nums">
                {total.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
