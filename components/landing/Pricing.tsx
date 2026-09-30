"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type ModuleGroup = {
  group: string;
  note: string;
  items: string[];
};

export function Pricing() {
  const router = useRouter();

  const handleRegisterFoundation = () => {
    router.push("/landing/register/foundation");
  };

  const groups: ModuleGroup[] = [
    {
      group: "Kesiswaan & presensi",
      note: "Kelas, siswa, dan kehadiran harian.",
      items: [
        "Data siswa lengkap: NISN, NIK, kelas, dan cabang asal.",
        "Presensi per jadwal pelajaran dengan empat status — hadir, sakit, izin, alfa — satu catatan per siswa, per jadwal, per tanggal.",
        "Check-in dan check-out guru lewat TeacherAttendance.",
        "Kapasitas kelas tercatat, bawaan 36 siswa.",
        "Pelanggaran dengan jenis dan poin kedisiplinan.",
      ],
    },
    {
      group: "Akademik & ujian",
      note: "Jadwal, penilaian, dan rapor.",
      items: [
        "Jadwal pelajaran dan mata pelajaran per kelas.",
        "Bank soal, opsi jawaban, ujian daring, percobaan siswa, dan jawaban tersimpan.",
        "E-rapor dengan tipe nilai, skala nilai, dan konfigurasi penilaian per cabang.",
        "Tugas dan pengumpulan tugas siswa.",
      ],
    },
    {
      group: "Tahfidz & asesmen perkembangan",
      note: "Setoran hafalan dan catatan harian.",
      items: [
        "Setoran hafalan per surah dengan ayat awal dan ayat akhir serta nilai A–E.",
        "Kelompok tahfidz untuk pembagian halaqah.",
        "Daftar surah lengkap: nama Arab, nama latin, jumlah ayat, dan tempat turun.",
        "Penilaian perkembangan: periode, area, indikator, catatan harian, observasi, dan bukti pendukung.",
      ],
    },
    {
      group: "Keuangan & SPP",
      note: "Tagihan, pembayaran, dan kuitansi.",
      items: [
        "Jenis pembayaran bulanan dan non-bulanan dengan nominal per cabang.",
        "Tagihan per siswa per bulan, dengan nomor kuitansi dan referensi bank.",
        "Pembayaran daring via Midtrans Snap dan Core API; transfer manual diverifikasi dengan tanggal dan bukti transfer.",
        "Kuitansi PDF dibuat langsung dari sistem.",
        "Rekening kas terpisah untuk tiap cabang, termasuk pemisahan alokasi SPP, uang gedung, dan ujian.",
      ],
    },
    {
      group: "Komunikasi & pemberitahuan",
      note: "Yang sampai ke orang tua.",
      items: [
        "Pemberitahuan WhatsApp ke orang tua lewat Evolution API.",
        "Pengumuman sekolah dan notifikasi di dalam aplikasi.",
        "Agenda dan kalender kegiatan sekolah.",
        "Akses sesuai peran: admin, bendahara, guru, siswa, orang tua.",
      ],
    },
    {
      group: "Administrasi yayasan & data induk",
      note: "Struktur dan pemeliharaan data.",
      items: [
        "Satu yayasan menaungi banyak cabang: SMP, SMA, dan SMK IT.",
        "Kode yayasan dipakai saat pendaftaran, sehingga pengguna baru masuk ke yayasan yang benar.",
        "Tahun ajaran, kalender akademik, dan jejak audit perubahan data.",
        "Impor massal dari berkas Excel untuk data master.",
      ],
    },
  ];

  return (
    <section id="cakupan" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Column-label row */}
        <div className="border-border border-t-2 pt-3">
          <span className="font-display text-muted-foreground text-[11px] tracking-wide">
            Cakupan modul
          </span>
        </div>

        {/* Section Header */}
        <div className="border-margin mt-8 max-w-2xl border-l-2 pl-6">
          <h2 className="font-display text-foreground text-3xl tracking-tight">
            Modul yang sudah berjalan untuk tiap cabang.
          </h2>
          <p className="text-secondary-foreground mt-3 max-w-[68ch] text-base leading-relaxed">
            SMP, SMA, dan SMK IT memakai modul yang sama di dalam satu yayasan;
            yang berbeda hanya data dan penggunanya. Daftar berikut menunjukkan
            apa saja yang sudah tersedia di dalam sistem sebelum yayasan
            memindahkan data lamanya.
          </p>
        </div>

        {/* Module register */}
        <dl className="border-border mt-12 border-t">
          {groups.map((g) => (
            <div
              key={g.group}
              className="border-border odd:bg-accent/60 grid gap-x-8 gap-y-3 border-b py-7 md:grid-cols-12 md:px-4"
            >
              <dt className="md:col-span-4">
                <span className="font-display text-foreground block text-base">
                  {g.group}
                </span>
                <span className="text-muted-foreground mt-1.5 block text-xs leading-relaxed">
                  {g.note}
                </span>
              </dt>
              <dd className="md:col-span-8">
                <ul className="text-secondary-foreground space-y-1.5 text-sm leading-relaxed">
                  {g.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>

        <p className="text-muted-foreground mt-5 font-mono text-[11px]">
          51 tabel data. PostgreSQL, Prisma, dan Next.js App Router
        </p>

        {/* Closing action */}
        <div className="border-border mt-12 flex flex-wrap items-center justify-between gap-5 border-t pt-8">
          <div>
            <p className="font-display text-foreground text-lg">
              Mulai dari cabang pertama, lalu tambah cabang berikutnya.
            </p>
            <p className="text-muted-foreground mt-1 max-w-[68ch] text-sm leading-relaxed">
              Pendaftaran akun yayasan memakai kode yayasan, sehingga cabang
              yang menyusul langsung masuk ke struktur yang sama.
            </p>
          </div>
          <Button
            onClick={handleRegisterFoundation}
            size="lg"
            className="rounded-sm px-6"
          >
            Daftar Akun Yayasan
          </Button>
        </div>
      </div>
    </section>
  );
}
