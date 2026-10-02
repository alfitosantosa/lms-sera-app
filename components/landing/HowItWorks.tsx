export function HowItWorks() {
  const steps = [
    {
      title: "Catat",
      actor: "Guru",
      body: "Guru membuka jadwal pelajaran hari itu, lalu mencatat kehadiran setiap siswa — hadir, sakit, izin, atau alfa. Satu catatan per siswa per jadwal, tersimpan saat itu juga. Check-in dan check-out guru tercatat terpisah di hari yang sama.",
      tables: ["Attendance", "TeacherAttendance"],
      head: "bg-info-surface border-info-border",
      badge: "bg-info-strong text-background",
      chip: "border-info-border bg-background text-info-strong",
      chipTable: "bg-info-surface text-info-strong",
    },
    {
      title: "Validasi",
      actor: "Bendahara",
      body: "Bendahara mencocokkan setoran orang tua dengan tagihan bulanan: nominal, bulan tagihan, dan rekening kas unit. Verifikasi transfer menautkan referensi bank dan tanggal transfer, lalu nomor kuitansi terbit sebagai bukti pembayaran.",
      tables: ["Payment", "PaymentTransaction", "AccountBank"],
      head: "bg-warning-surface border-warning-border",
      badge: "bg-warning-strong text-background",
      chip: "border-warning-border bg-background text-warning-strong",
      chipTable: "bg-warning-surface text-warning-strong",
    },
    {
      title: "Kirim",
      actor: "Sistem",
      body: "Ringkasan kehadiran, poin kedisiplinan, dan kuitansi pembayaran dikirim ke nomor WhatsApp orang tua melalui Evolution API — tanpa guru menulis satu pesan pun secara manual.",
      tables: ["Notification", "Violation"],
      head: "bg-success-surface border-success-border",
      badge: "bg-success-strong text-background",
      chip: "border-success-border bg-background text-success-strong",
      chipTable: "bg-success-surface text-success-strong",
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

        <ol className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-8">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="border-border bg-card relative flex flex-col rounded-3xl border"
            >
              <div
                className={`flex items-center justify-between gap-3 rounded-t-3xl border-b px-6 py-5 ${step.head}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={`flex size-10 items-center justify-center rounded-full text-lg font-semibold tabular-nums ${step.badge}`}
                  >
                    {index + 1}
                  </span>
                  <h3 className="text-foreground text-xl font-semibold tracking-tight">
                    {step.title}
                  </h3>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${step.chip}`}
                >
                  {step.actor}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <p className="text-secondary-foreground max-w-[68ch] text-sm leading-relaxed">
                  {step.body}
                </p>

                <div className="mt-auto pt-5">
                  <p className="text-muted-foreground text-xs">Tercatat di</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {step.tables.map((table) => (
                      <li
                        key={table}
                        className={`rounded-md px-2 py-0.5 font-mono text-xs ${step.chipTable}`}
                      >
                        {table}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="border-border bg-card text-muted-foreground absolute -bottom-8 left-1/2 flex size-6 -translate-x-1/2 items-center justify-center rounded-full border text-xs lg:top-1/2 lg:-right-5 lg:bottom-auto lg:left-auto lg:-translate-x-0 lg:-translate-y-1/2"
                >
                  <span className="lg:hidden">↓</span>
                  <span className="hidden lg:inline">→</span>
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
