"use client";

import { useState } from "react";

const roles = [
  {
    name: "Guru",
    outcome:
      "Presensi tercatat per jadwal, nilai langsung terhimpun menjadi rapor, dan rekap setoran tahfidz tersedia tanpa input ulang.",
    tab: "border-info-strong bg-info-strong text-background",
    dot: "bg-info-strong",
    card: "border-info-border bg-info-surface",
    badge: "bg-info-strong text-background",
    line: "border-info-border",
    accent: "text-info-strong",
    steps: [
      {
        title: "Check-in",
        detail: "Masuk ke aplikasi dan catat kehadiran Anda hari itu.",
      },
      {
        title: "Catat presensi siswa",
        detail:
          "Pilih kelas dan jadwal, lalu tandai hadir, sakit, izin, atau alfa.",
      },
      {
        title: "Berikan tugas atau ujian",
        detail:
          "Susun dari bank soal atau buat tugas, lalu tentukan tenggatnya.",
      },
      {
        title: "Input nilai dan catatan",
        detail: "Isi nilai, setoran tahfidz (A–E), dan pelanggaran bila ada.",
      },
      {
        title: "Terbitkan rapor",
        detail: "Periksa rekap nilai per mata pelajaran, lalu publikasikan.",
      },
    ],
  },
  {
    name: "Siswa",
    outcome:
      "Jadwal, tugas, dan hasil belajar ada di satu tempat, sehingga tidak perlu menunggu kertas pengumuman.",
    tab: "border-success-strong bg-success-strong text-background",
    dot: "bg-success-strong",
    card: "border-success-border bg-success-surface",
    badge: "bg-success-strong text-background",
    line: "border-success-border",
    accent: "text-success-strong",
    steps: [
      {
        title: "Masuk dan lihat jadwal",
        detail: "Buka jadwal pelajaran, pengumuman, dan agenda kalender.",
      },
      {
        title: "Kerjakan tugas",
        detail: "Kumpulkan tugas sebelum tenggat langsung dari aplikasi.",
      },
      {
        title: "Ikuti ujian",
        detail: "Jawab soal pada waktu ujian; jawaban tersimpan otomatis.",
      },
      {
        title: "Pantau hasil",
        detail: "Lihat nilai, setoran tahfidz, dan rapor setiap semester.",
      },
    ],
  },
  {
    name: "Orang tua",
    outcome:
      "Gambaran lengkap perkembangan anak, serta tagihan yang bisa dibayar tanpa datang ke sekolah.",
    tab: "border-warning-strong bg-warning-strong text-background",
    dot: "bg-warning-strong",
    card: "border-warning-border bg-warning-surface",
    badge: "bg-warning-strong text-background",
    line: "border-warning-border",
    accent: "text-warning-strong",
    steps: [
      {
        title: "Masuk dan pilih anak",
        detail: "Satu akun untuk melihat data anak Anda.",
      },
      {
        title: "Pantau kehadiran dan nilai",
        detail:
          "Cek presensi harian, nilai ujian, setoran tahfidz, dan poin pelanggaran.",
      },
      {
        title: "Lihat tagihan bulanan",
        detail: "Rincian jenis pembayaran dan nominalnya tampil jelas.",
      },
      {
        title: "Bayar online",
        detail:
          "Selesaikan pembayaran dan terima notifikasi saat transaksi tercatat.",
      },
    ],
  },
  {
    name: "Bendahara",
    outcome:
      "Tagihan terbit sesuai jadwal, pembayaran masuk tercatat otomatis, dan kas tiap unit mudah ditelusuri.",
    tab: "border-primary bg-primary text-primary-foreground",
    dot: "bg-primary",
    card: "border-primary/30 bg-primary/10",
    badge: "bg-primary text-primary-foreground",
    line: "border-primary/30",
    accent: "text-primary",
    steps: [
      {
        title: "Atur jenis pembayaran",
        detail: "Tetapkan komponen biaya dan nominalnya per unit sekolah.",
      },
      {
        title: "Terbitkan tagihan bulanan",
        detail: "Tagihan sampai ke siswa dan orang tua yang bersangkutan.",
      },
      {
        title: "Terima pembayaran online",
        detail:
          "Setiap transaksi yang berhasil tercatat atau input manual, yang di transfer orangtua murid",
      },
      {
        title: "Rekap per rekening kas",
        detail: "Cocokkan pemasukan dengan rekening kas SMP, SMA, atau SMK IT.",
      },
    ],
  },
];

export function Features() {
  const [active, setActive] = useState(0);
  const role = roles[active];

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % roles.length
        : (index - 1 + roles.length) % roles.length;
    setActive(next);
    document.getElementById(`alur-tab-${next}`)?.focus();
  };

  return (
    <section id="alur" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-[68ch]">
          <h2 className="text-foreground text-3xl font-semibold tracking-tight">
            Alur kerja tiap peran, dan hasil yang Anda dapatkan.
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            Setiap pengguna memulai dari satu pintu masuk dan mengikuti langkah
            yang berbeda. Pilih peran Anda untuk melihat apa yang perlu
            dilakukan dan apa yang diperoleh di akhir.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Pilih peran"
          className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {roles.map((item, index) => {
            const selected = index === active;
            return (
              <button
                key={item.name}
                id={`alur-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="alur-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className={`focus-visible:ring-ring flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                  selected
                    ? item.tab
                    : "border-border bg-card text-secondary-foreground hover:bg-accent"
                }`}
              >
                {!selected && (
                  <span
                    aria-hidden="true"
                    className={`size-2 rounded-full ${item.dot}`}
                  />
                )}
                {item.name}
              </button>
            );
          })}
        </div>

        <div
          id="alur-panel"
          role="tabpanel"
          aria-labelledby={`alur-tab-${active}`}
          className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]"
        >
          <div className={`rounded-3xl border p-8 ${role.card}`}>
            <p className={`text-sm font-semibold ${role.accent}`}>
              Yang Anda dapatkan sebagai {role.name.toLowerCase()}
            </p>
            <p className="text-foreground mt-4 max-w-[40ch] text-xl leading-snug font-semibold tracking-tight">
              {role.outcome}
            </p>
            <p className="text-secondary-foreground mt-6 text-sm">
              {role.steps.length} langkah dari masuk sampai selesai.
            </p>
          </div>

          <div className="border-border bg-card rounded-3xl border p-6 md:p-8">
            <ol className={`ml-4 border-l-2 ${role.line}`}>
              {role.steps.map((step, index) => (
                <li key={step.title} className="relative pb-7 pl-9 last:pb-0">
                  <span
                    aria-hidden="true"
                    className={`absolute top-0 -left-4 flex size-8 items-center justify-center rounded-full text-sm font-semibold tabular-nums ${role.badge}`}
                  >
                    {index + 1}
                  </span>
                  <p className="text-foreground text-base font-medium tracking-tight">
                    {step.title}
                  </p>
                  <p className="text-secondary-foreground mt-1 max-w-[60ch] text-sm leading-relaxed">
                    {step.detail}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <p className="text-muted-foreground mt-4 text-xs">
          Langkah dapat berbeda sedikit sesuai pengaturan masing-masing unit.
        </p>
      </div>
    </section>
  );
}
