export function Features() {
  const roles = [
    {
      name: "Guru",
      outcome:
        "Presensi tercatat per jadwal, nilai langsung terhimpun menjadi rapor, dan rekap setoran tahfidz tersedia tanpa input ulang.",
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
          detail: "Setiap transaksi yang berhasil tercatat tanpa input manual.",
        },
        {
          title: "Rekap per rekening kas",
          detail:
            "Cocokkan pemasukan dengan rekening kas SMP, SMA, atau SMK IT.",
        },
      ],
    },
  ];

  return (
    <section id="alur" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-[68ch]">
          <h2 className="text-foreground text-3xl font-semibold tracking-tight">
            Alur kerja tiap peran, dan hasil yang Anda dapatkan.
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            Setiap pengguna memulai dari satu pintu masuk dan mengikuti langkah
            yang berbeda. Cari peran Anda di bawah untuk melihat apa yang perlu
            dilakukan dan apa yang diperoleh di akhir.
          </p>
        </div>

        <div className="border-border bg-card mt-12 overflow-hidden rounded-3xl border">
          {roles.map((role) => (
            <div
              key={role.name}
              className="border-border grid gap-8 border-b px-5 py-8 last:border-b-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:px-8"
            >
              <div className="max-w-[44ch]">
                <h3 className="text-foreground text-xl font-semibold tracking-tight">
                  {role.name}
                </h3>
                <p className="text-foreground mt-4 text-sm font-medium">
                  Yang Anda dapatkan
                </p>
                <p className="text-secondary-foreground mt-1 text-sm leading-relaxed">
                  {role.outcome}
                </p>
              </div>

              <ol className="border-border ml-3 border-l">
                {role.steps.map((step, index) => (
                  <li key={step.title} className="relative pb-6 pl-8 last:pb-0">
                    <span
                      aria-hidden="true"
                      className="border-border bg-background text-foreground absolute top-0 -left-3 flex size-6 items-center justify-center rounded-full border text-xs"
                    >
                      {index + 1}
                    </span>
                    <p className="text-foreground text-base tracking-tight">
                      {step.title}
                    </p>
                    <p className="text-secondary-foreground mt-1 max-w-[60ch] text-sm leading-relaxed">
                      {step.detail}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground mt-4 text-xs">
          Langkah dapat berbeda sedikit sesuai pengaturan masing-masing unit.
        </p>
      </div>
    </section>
  );
}
