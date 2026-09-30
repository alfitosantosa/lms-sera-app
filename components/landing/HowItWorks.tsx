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
        <div className="border-margin max-w-[68ch] border-l-2 pl-6">
          <h2 className="font-display text-foreground text-3xl tracking-tight">
            Satu catatan masuk, tiga langkah sampai ke orang tua.
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            Alurnya sama di setiap unit: guru mencatat, bendahara memvalidasi,
            sistem mengirim. Tidak ada entri ulang di aplikasi lain.
          </p>
        </div>

        <div className="border-border text-secondary-foreground mt-12 grid grid-cols-[3rem_1fr] gap-x-8 border-t-2 pt-3 sm:grid-cols-[3rem_14rem_1fr]">
          <span className="font-display text-[11px] tracking-wide uppercase">
            No.
          </span>
          <span className="font-display text-[11px] tracking-wide uppercase">
            Langkah
          </span>
          <span className="font-display hidden text-[11px] tracking-wide uppercase sm:block">
            Yang tercatat
          </span>
        </div>

        <ol>
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="border-border grid grid-cols-[3rem_1fr] gap-x-8 gap-y-3 border-b py-8 sm:grid-cols-[3rem_14rem_1fr]"
            >
              <span className="font-display text-muted-foreground text-2xl leading-none tabular-nums">
                {index + 1}
              </span>
              <div>
                <h3 className="font-display text-foreground text-lg tracking-tight">
                  {step.title}
                </h3>
                <span className="border-border bg-card text-secondary-foreground mt-2 inline-block rounded-sm border px-2 py-0.5 text-[11px]">
                  {step.actor}
                </span>
              </div>
              <div>
                <p className="text-secondary-foreground max-w-[68ch] text-sm leading-relaxed">
                  {step.body}
                </p>
                <p className="text-muted-foreground mt-3 font-mono text-xs">
                  Tercatat di: {step.tables}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
