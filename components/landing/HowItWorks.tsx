import { UserCheck, GraduationCap, BookOpen, ArrowRight } from "lucide-react";
import { Fragment } from "react/jsx-runtime";

const flows = [
  {
    icon: UserCheck,
    title: "Presensi & Kedisiplinan",
    steps: [
      "Siswa check-in di kelas",
      "Kehadiran tercatat otomatis",
      "Notif WhatsApp ke orang tua",
    ],
  },
  {
    icon: GraduationCap,
    title: "Akademik & E-Rapor",
    steps: [
      "Guru input nilai & tugas",
      "Sistem menghitung otomatis",
      "E-rapor siap cetak",
    ],
  },
  {
    icon: BookOpen,
    title: "Tahfidz Al-Qur'an",
    steps: [
      "Setoran surah dicatat",
      "Progress hafalan tersimpan",
      "Laporan mutaba'ah mingguan",
    ],
  },
];

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="bg-secondary/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="bg-primary/10 text-primary inline-block rounded-full px-3.5 py-1 text-xs font-semibold">
            Cara Kerja
          </span>
          <h2 className="text-foreground mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Setiap modul berjalan otomatis.
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            Tanpa entri data berulang — cukup satu pencatatan, sisanya mengalir
            sendiri.
          </p>
        </div>

        {/* Flow Rows */}
        <div className="mt-14 space-y-5">
          {flows.map((flow, idx) => (
            <div
              key={idx}
              className="border-border bg-background rounded-2xl border p-6 sm:p-7"
            >
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
                  <flow.icon className="h-5 w-5" />
                </div>
                <h3 className="text-foreground text-base font-bold">
                  {flow.title}
                </h3>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
                {flow.steps.map((step, sIdx) => (
                  <Fragment key={sIdx}>
                    <div className="border-border bg-secondary/50 text-secondary-foreground flex-1 rounded-lg border px-4 py-3 text-xs font-medium">
                      {step}
                    </div>
                    {sIdx < flow.steps.length - 1 && (
                      <ArrowRight className="text-muted-foreground/50 hidden h-4 w-4 flex-shrink-0 sm:block" />
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
