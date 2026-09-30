import Link from "next/link";

import { SeraLogo } from "@/components/SeraLogo";
import { Button } from "@/components/ui/button";

const CLIENT_NAME = process.env.NEXT_PUBLIC_CLIENT_NAME || "Yayasan";

/** The four ink roles, as the parent meets them in the portal (DESIGN.md §1). */
type Ink = "success" | "info" | "warning" | "destructive";

const INK_CHIP: Record<Ink, string> = {
  success: "bg-success-chip text-success-strong",
  info: "bg-info-chip text-info-strong",
  warning: "bg-warning-chip text-warning-strong",
  destructive: "bg-destructive-chip text-destructive-strong",
};

/** The letters a class journal is marked with. */
const MARKS: { mark: string; label: string; ink: Ink }[] = [
  { mark: "H", label: "Hadir", ink: "success" },
  { mark: "S", label: "Sakit", ink: "warning" },
  { mark: "I", label: "Izin", ink: "info" },
  { mark: "A", label: "Alfa", ink: "destructive" },
];

/**
 * One day, as the school records it. The times are the day's own sequence, so
 * they sit in the left column the way a class journal carries them.
 *
 * These rows are illustrative, and the caption under the table says so — no
 * claim here that the repository cannot prove (DESIGN.md §6).
 */
const DAY: {
  time: string;
  what: string;
  detail: string;
  chip?: { text: string; ink: Ink };
}[] = [
  {
    time: "07:00",
    what: "Presensi jam pertama",
    detail: "Matematika, VII-A",
    chip: { text: "Hadir", ink: "success" },
  },
  {
    time: "09:30",
    what: "Setoran tahfidz",
    detail: "Al-Mulk, ayat 1–10",
    chip: { text: "Nilai B", ink: "info" },
  },
  {
    time: "10:15",
    what: "Tugas dikumpulkan",
    detail: "Latihan matematika bab 3",
  },
  {
    time: "11:15",
    what: "Catatan guru",
    detail: "Aktif bertanya saat pembahasan.",
  },
  {
    time: "13:00",
    what: "Tagihan SPP Oktober",
    detail: "Rp 450.000",
    chip: { text: "Menunggu", ink: "warning" },
  },
  {
    time: "15:10",
    what: "Notifikasi WhatsApp",
    detail: "Ringkasan hari dikirim ke orang tua",
  },
];

/** What the parent reads first, at home. */
const CATATAN: { title: string; body: string; marks?: boolean }[] = [
  {
    title: "Presensi per jam pelajaran",
    body: "Guru mencatat kehadiran setiap siswa langsung dari jadwal pelajaran hari itu. Satu catatan per siswa per jadwal, tersimpan saat itu juga.",
    marks: true,
  },
  {
    title: "Nilai, tugas, dan rapor",
    body: "Nilai ulangan harian, tugas, dan ujian terkumpul di satu tempat. Rapor disusun dari catatan yang sama, bukan dari entri ulang.",
  },
  {
    title: "Tagihan SPP dan kuitansi",
    body: "Tagihan lahir dari jenis tagihan cabang, dibayar online lewat Midtrans atau transfer manual yang diverifikasi bendahara, lalu ditutup kuitansi bernomor.",
  },
  {
    title: "Setoran hafalan",
    body: "Surah, rentang ayat, dan nilai setiap setoran dicatat guru tahfidz, sehingga riwayat hafalan anak tersusun per tanggal.",
  },
];

/** The tahfidz records shown on the navy band. Illustrative, like `DAY`. */
const SETORAN: {
  date: string;
  arabic: string;
  latin: string;
  ayat: string;
  grade: string;
  ink: Ink;
}[] = [
  {
    date: "12 Sep",
    arabic: "النبأ",
    latin: "An-Naba",
    ayat: "1–20",
    grade: "B",
    ink: "info",
  },
  {
    date: "19 Sep",
    arabic: "الملك",
    latin: "Al-Mulk",
    ayat: "1–10",
    grade: "B",
    ink: "info",
  },
  {
    date: "26 Sep",
    arabic: "الملك",
    latin: "Al-Mulk",
    ayat: "11–20",
    grade: "A",
    ink: "success",
  },
];

/** The side door for a school that does not run this system yet. */
const CLIENT_FACTS: { title: string; body: string }[] = [
  {
    title: "Satu yayasan, banyak cabang",
    body: "SMP, SMA, dan SMK IT berjalan di bawah satu yayasan, dengan data setiap cabang terpisah sejak baris pertama.",
  },
  {
    title: "Lima peran",
    body: "Admin, guru, bendahara, siswa, dan orang tua masing-masing punya menu dan hak aksesnya sendiri.",
  },
  {
    title: "Impor data lama",
    body: "Data siswa, guru, dan jadwal dari berkas Excel dapat dimasukkan langsung ke dalam sistem.",
  },
];

/** The one genuine sequence on the page, so it is allowed its numerals. */
const STEPS: { title: string; body: string }[] = [
  {
    title: "Terima akun dari admin cabang",
    body: "Admin sekolah membuat akun dan menghubungkannya ke data siswa. Akun baru masuk ke yayasan yang benar lewat kode yayasan.",
  },
  {
    title: "Lengkapi profil Anda",
    body: "Nama, NISN atau NIK, dan kelas dipakai untuk menautkan akun ke catatan anak Anda.",
  },
  {
    title: "Masuk dan pantau",
    body: "Presensi, nilai, setoran hafalan, dan tagihan bulan berjalan muncul di portal siswa dan orang tua.",
  },
];

const NAV = [
  { label: "Yang sampai ke rumah", href: "#catatan" },
  { label: "Tahfidz", href: "#tahfidz" },
  { label: "Sekolah baru", href: "#sekolah" },
];

/**
 * The friendly landing: the school day told to the family, not the module
 * register told to the yayasan (that page is `/`, components/landing/Hero).
 *
 * Server component on purpose — every action here is a link, so the page costs
 * no client JavaScript. Only the hero carries the cascade (DESIGN.md §5).
 */
export function Welcome() {
  return (
    <div className="bg-background text-foreground min-h-[100dvh] antialiased">
      <nav className="border-border bg-background/95 sticky top-0 z-50 border-b backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3.5">
          <Link
            href="/"
            className="focus-visible:ring-ring/80 rounded-2xl focus-visible:ring-[3px] focus-visible:outline-none"
          >
            <SeraLogo
              markClassName="h-8 w-auto"
              subtitle="Sistem informasi sekolah"
            />
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-secondary-foreground hover:text-foreground focus-visible:ring-ring/80 rounded-lg text-sm underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:outline-none"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/sign-in">Masuk</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/sign-up">Daftar</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-12 pb-20 sm:pt-16">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <div className="text-muted-foreground animate-element animate-delay-100 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-sm">
                <span>Buku penghubung</span>
                <span>{CLIENT_NAME}</span>
              </div>

              <h1 className="animate-element animate-delay-200 mt-5 text-[clamp(2rem,4.5vw,3rem)] leading-[1.08] font-semibold tracking-tight text-balance">
                Yang terjadi di sekolah, sampai ke rumah hari itu juga.
              </h1>

              <p className="text-secondary-foreground animate-element animate-delay-300 mt-6 max-w-[68ch] text-base leading-relaxed">
                Kehadiran, catatan guru, setoran hafalan, dan tagihan SPP
                tercatat satu per satu. Orang tua melihat semuanya dari portal,
                tanpa menunggu akhir semester.
              </p>

              <div className="animate-element animate-delay-400 mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/auth/sign-in">Masuk portal orang tua</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="#cara">Cara mendapat akun</Link>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-7 lg:pt-10">
              <div className="text-muted-foreground animate-element animate-delay-500 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-sm">
                <span>Catatan satu hari</span>
                <span>Kelas VII-A</span>
              </div>

              <div className="border-border bg-card animate-element animate-delay-600 mt-3 overflow-hidden rounded-3xl border">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">
                    Contoh catatan presensi, setoran tahfidz, tugas, dan tagihan
                    selama satu hari sekolah
                  </caption>
                  <thead className="border-border border-b">
                    <tr>
                      <th
                        scope="col"
                        className="text-muted-foreground w-16 px-5 py-2 text-xs font-medium"
                      >
                        Jam
                      </th>
                      <th
                        scope="col"
                        className="text-muted-foreground px-2 py-2 text-xs font-medium"
                      >
                        Catatan
                      </th>
                      <th
                        scope="col"
                        className="text-muted-foreground px-5 py-2 text-xs font-medium"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {DAY.map((row) => (
                      <tr
                        key={row.time}
                        className="border-border odd:bg-accent/60 border-b last:border-b-0"
                      >
                        <td className="text-muted-foreground px-5 py-3 align-top font-mono text-xs">
                          {row.time}
                        </td>
                        <td className="px-2 py-3 align-top">
                          <span className="block font-medium">{row.what}</span>
                          <span className="text-muted-foreground mt-0.5 block text-xs leading-relaxed">
                            {row.detail}
                          </span>
                        </td>
                        <td className="px-5 py-3 align-top">
                          {row.chip ? (
                            <span
                              className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${INK_CHIP[row.chip.ink]}`}
                            >
                              {row.chip.text}
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-muted-foreground mt-3 text-xs">
                Contoh tampilan. Baris di atas bukan data siswa sungguhan.
              </p>
            </div>
          </div>
        </section>

        <section id="catatan" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="max-w-[68ch]">
            <h2 className="text-3xl font-semibold tracking-tight">
              Yang orang tua lihat, tanpa menunggu rapor.
            </h2>
            <p className="text-muted-foreground mt-3 text-base leading-relaxed">
              Empat catatan yang orang tua buka di portal. Sama isinya dengan
              yang dilihat wali kelas dan bendahara, hanya berbeda hak aksesnya.
            </p>
          </div>

          <dl className="divide-border mt-10 divide-y">
            {CATATAN.map((item) => (
              <div
                key={item.title}
                className="grid gap-3 py-6 md:grid-cols-12 md:gap-6"
              >
                <dt className="text-foreground text-lg font-semibold tracking-tight md:col-span-4">
                  {item.title}
                </dt>
                <dd className="md:col-span-8">
                  <p className="text-secondary-foreground max-w-[68ch] text-sm leading-relaxed">
                    {item.body}
                  </p>

                  {item.marks ? (
                    <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs">
                      {MARKS.map((mark) => (
                        <li key={mark.mark} className="flex items-center gap-2">
                          <span
                            className={`grid size-6 place-content-center rounded-lg text-xs font-semibold ${INK_CHIP[mark.ink]}`}
                          >
                            {mark.mark}
                          </span>
                          <span className="text-muted-foreground">
                            {mark.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          id="tahfidz"
          className="bg-navy text-navy-foreground py-24"
          aria-label="Setoran hafalan"
        >
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <h2 className="text-3xl font-semibold tracking-tight">
                Hafalan yang tercatat sampai ayatnya.
              </h2>
              <p className="text-navy-muted mt-3 max-w-[68ch] text-base leading-relaxed">
                Guru tahfidz mencatat surah, rentang ayat, dan nilai setiap kali
                anak menyetor. Riwayatnya tersusun per tanggal, jadi
                perkembangannya terlihat sejak pekan pertama.
              </p>
            </div>

            <div className="lg:col-span-7">
              <p
                lang="ar"
                dir="rtl"
                className="font-arabic text-[clamp(3rem,7vw,4.5rem)] leading-none"
              >
                الملك
              </p>
              <p className="text-navy-muted mt-3 text-sm">
                Setoran terakhir pekan lalu: Al-Mulk, ayat 1–10.
              </p>

              <div className="border-navy-border mt-10 overflow-hidden rounded-3xl border">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">
                    Contoh riwayat setoran hafalan seorang siswa
                  </caption>
                  <thead className="border-navy-border text-navy-muted border-b">
                    <tr>
                      <th scope="col" className="px-5 py-2 text-xs font-medium">
                        Tanggal
                      </th>
                      <th scope="col" className="px-3 py-2 text-xs font-medium">
                        Surah
                      </th>
                      <th scope="col" className="px-3 py-2 text-xs font-medium">
                        Ayat
                      </th>
                      <th scope="col" className="px-5 py-2 text-xs font-medium">
                        Nilai
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {SETORAN.map((row) => (
                      <tr
                        key={row.date}
                        className="border-navy-border border-b last:border-b-0"
                      >
                        <td className="text-navy-muted px-5 py-3 align-middle font-mono text-xs">
                          {row.date}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            lang="ar"
                            dir="rtl"
                            className="font-arabic block text-lg leading-tight"
                          >
                            {row.arabic}
                          </span>
                          <span className="text-navy-muted block text-xs">
                            {row.latin}
                          </span>
                        </td>
                        <td className="text-navy-muted px-3 py-3 align-middle font-mono text-xs">
                          {row.ayat}
                        </td>
                        <td className="px-5 py-3 align-middle">
                          <span
                            className={`inline-grid size-6 place-content-center rounded-lg text-xs font-semibold ${INK_CHIP[row.ink]}`}
                          >
                            {row.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-navy-muted mt-3 text-xs">
                Contoh tampilan. Riwayat di atas bukan data siswa sungguhan.
              </p>
            </div>
          </div>
        </section>

        <section id="sekolah" className="mx-auto max-w-6xl px-6 py-20">
          <div className="border-border bg-card grid gap-10 rounded-3xl border p-8 md:grid-cols-12 md:p-10">
            <div className="md:col-span-7">
              <h2 className="text-3xl font-semibold tracking-tight">
                Sekolah atau yayasan yang belum memakainya?
              </h2>
              <p className="text-secondary-foreground mt-3 max-w-[68ch] text-base leading-relaxed">
                Sistem ini dipakai satu yayasan dengan cabang SMP, SMA, dan SMK
                IT di bawahnya. Modul yang sama, data yang berdiri sendiri per
                cabang. Halaman beranda menjelaskan modul, arsitektur, dan
                cakupannya lebih lengkap.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/landing/register/foundation">
                    Daftar akun yayasan
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/">Lihat sistem lengkapnya</Link>
                </Button>
              </div>
            </div>

            <div className="space-y-6 md:col-span-5">
              {CLIENT_FACTS.map((fact) => (
                <div key={fact.title}>
                  <h3 className="text-sm font-semibold">{fact.title}</h3>
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                    {fact.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="cara" className="bg-secondary py-24" aria-label="Cara mulai">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-[68ch]">
              <h2 className="text-foreground text-3xl font-semibold tracking-tight">
                Cara mulai memakai portal.
              </h2>
              <p className="text-muted-foreground mt-3 text-base leading-relaxed">
                Akun dibuat oleh admin sekolah, bukan lewat pendaftaran bebas.
                Itu yang membuat setiap akun langsung terhubung ke data siswa
                yang benar.
              </p>
            </div>

            <ol className="mt-12 space-y-8">
              {STEPS.map((step, index) => (
                <li key={step.title} className="grid gap-4 md:grid-cols-12">
                  <span className="text-muted-foreground text-2xl leading-none font-semibold tracking-tight tabular-nums md:col-span-1">
                    {index + 1}
                  </span>
                  <div className="md:col-span-11">
                    <h3 className="text-foreground text-lg font-semibold tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-secondary-foreground mt-2 max-w-[68ch] text-sm leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-12 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/auth/sign-in">Masuk portal orang tua</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/sign-up">Daftar akun</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-border border-t px-6 py-10">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-4 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p className="leading-relaxed">
            <span className="text-foreground font-semibold">{CLIENT_NAME}</span>{" "}
            <span className="block">
              Presensi, rapor, tahfidz, dan tagihan SPP dalam satu catatan.
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link
              href="/"
              className="focus-visible:ring-ring/80 rounded-lg underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:outline-none"
            >
              Beranda sistem
            </Link>
            <Link
              href="/auth/sign-in"
              className="focus-visible:ring-ring/80 rounded-lg underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:outline-none"
            >
              Masuk
            </Link>
            <Link
              href="/auth/sign-up"
              className="focus-visible:ring-ring/80 rounded-lg underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:outline-none"
            >
              Daftar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Welcome;
