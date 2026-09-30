export function HowItWorks() {
  const steps = [
    {
      title: "Catat",
      actor: "Guru",
      body: "Guru membuka jadwal pelajaran hari itu, lalu mencatat kehadiran setiap siswa — hadir, sakit, izin, atau alfa. Satu catatan per siswa per jadwal, tersimpan saat itu juga. Check-in dan check-out guru tercatat terpisah di hari yang sama.",
      tables: "Attendance, TeacherAttendance",
    },
    {
      title: "Validasi",
      actor: "Bendahara",
      body: "Bendahara mencocokkan setoran orang tua dengan tagihan bulanan: nominal, bulan tagihan, dan rekening kas unit. Verifikasi transfer menautkan referensi bank dan tanggal transfer, lalu nomor kuitansi terbit sebagai bukti pembayaran.",
      tables: "Payment, PaymentTransaction, AccountBank",
    },
    {
      title: "Kirim",
      actor: "Sistem",
      body: "Ringkasan kehadiran, poin kedisiplinan, dan kuitansi pembayaran dikirim ke nomor WhatsApp orang tua melalui Evolution API — tanpa guru menulis satu pesan pun secara manual.",
      tables: "Notification, Violation",
    },
  ];

  return (
    <section id="cara-kerja" className="bg-secondary py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-[68ch]">
          <h2 className="text-foreground text-3xl font-semibold tracking-tight">
            Satu catatan masuk, tiga langkah sampai ke orang tua.
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            Alurnya sama di setiap unit: guru mencatat, bendahara memvalidasi,
            sistem mengirim. Tidak ada entri ulang di aplikasi lain.
          </p>
        </div>

        <ol className="mt-12 grid gap-6 lg:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="border-border bg-card rounded-3xl border p-6"
            >
              <span className="text-muted-foreground text-2xl leading-none font-semibold tracking-tight tabular-nums">
                {index + 1}
              </span>
              <h3 className="text-foreground mt-4 text-lg font-semibold tracking-tight">
                {step.title}
              </h3>
              <span className="border-border bg-secondary text-secondary-foreground mt-2 inline-block rounded-full border px-2 py-0.5 text-xs">
                {step.actor}
              </span>
              <p className="text-secondary-foreground mt-4 max-w-[68ch] text-sm leading-relaxed">
                {step.body}
              </p>
              <p className="text-muted-foreground mt-3 font-mono text-xs">
                Tercatat di: {step.tables}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
