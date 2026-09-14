import * as React from "react";
import { UserCheck, GraduationCap, BookOpen, ArrowRight } from "lucide-react";

const flows = [
  {
    icon: UserCheck,
    title: "Presensi & Kedisiplinan",
    steps: ["Siswa check-in di kelas", "Kehadiran tercatat otomatis", "Notif WhatsApp ke orang tua"],
  },
  {
    icon: GraduationCap,
    title: "Akademik & E-Rapor",
    steps: ["Guru input nilai & tugas", "Sistem menghitung otomatis", "E-rapor siap cetak"],
  },
  {
    icon: BookOpen,
    title: "Tahfidz Al-Qur'an",
    steps: ["Setoran surah dicatat", "Progress hafalan tersimpan", "Laporan mutaba'ah mingguan"],
  },
];

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="bg-secondary/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            Cara Kerja
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Setiap modul berjalan otomatis.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Tanpa entri data berulang — cukup satu pencatatan, sisanya mengalir sendiri.
          </p>
        </div>

        {/* Flow Rows */}
        <div className="mt-14 space-y-5">
          {flows.map((flow, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-background p-6 sm:p-7">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <flow.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">{flow.title}</h3>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
                {flow.steps.map((step, sIdx) => (
                  <React.Fragment key={sIdx}>
                    <div className="flex-1 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-xs font-medium text-secondary-foreground">
                      {step}
                    </div>
                    {sIdx < flow.steps.length - 1 && (
                      <ArrowRight className="hidden h-4 w-4 flex-shrink-0 text-muted-foreground/50 sm:block" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
