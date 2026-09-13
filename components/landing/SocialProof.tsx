import * as React from "react";
import { Building2, Award, Users, CheckCircle, Shield } from "lucide-react";

export function SocialProof() {
  const schools = [
    { name: "Yayasan Rahmaniyah Al-Islamy", type: "Pusat Yayasan", location: "Bogor" },
    { name: "SMK IT Rahmaniyah", type: "Vokasi & TI", location: "Depok" },
    { name: "SMA Nusantara 1", type: "Sekolah Menengah Atas", location: "Jakarta" },
    { name: "SMP Cendekia Al-Islamy", type: "Sekolah Menengah Pertama", location: "Bogor" },
    { name: "SD Islam Terpadu Harapan", type: "Sekolah Dasar", location: "Tangerang" },
    { name: "Pesantren Modern Al-Hikmah", type: "Pondok Pesantren", location: "Jawa Barat" },
  ];

  const stats = [
    { value: "500+", label: "Sekolah & Madrasah", desc: "Menggunakan Sera setiap hari" },
    { value: "1,2 Juta", label: "Siswa & Guru Aktif", desc: "Tercatat dalam sistem" },
    { value: "99,9%", label: "Uptime Sistem SLA", desc: "Keandalan cloud enterprise" },
    { value: "Rp 120M+", label: "Transaksi SPP Online", desc: "Terproses otomatis via Midtrans" },
  ];

  return (
    <section className="relative border-y border-border bg-secondary py-14">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Dipercaya oleh Yayasan Pendidikan & Sekolah Terkemuka
        </p>

        {/* School badging pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {schools.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-secondary-foreground shadow-xs transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <span className="font-semibold text-foreground">{s.name}</span>
              <span className="text-[11px] text-muted-foreground">• {s.type}</span>
            </div>
          ))}
        </div>

        {/* Key Numerical Metrics */}
        <div className="mt-14 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-background p-5 text-center shadow-xs transition-transform hover:-translate-y-0.5"
            >
              <div className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl [font-feature-settings:'tnum'_1]">
                {stat.value}
              </div>
              <div className="mt-1.5 text-sm font-semibold text-secondary-foreground">{stat.label}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
