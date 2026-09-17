import { Building2 } from "lucide-react";

export function SocialProof() {
  const schools = [
    {
      name: "Yayasan Santosa Al-Islamy",
      type: "Pusat Yayasan",
      location: "Bogor",
    },
    { name: "SMK IT Santosa", type: "Vokasi & TI", location: "Depok" },
    {
      name: "SMA Nusantara 1",
      type: "Sekolah Menengah Atas",
      location: "Jakarta",
    },
    {
      name: "SMP Cendekia Al-Islamy",
      type: "Sekolah Menengah Pertama",
      location: "Bogor",
    },
    {
      name: "SD Islam Terpadu Harapan",
      type: "Sekolah Dasar",
      location: "Tangerang",
    },
    {
      name: "Pesantren Modern Al-Hikmah",
      type: "Pondok Pesantren",
      location: "Jawa Barat",
    },
  ];

  const stats = [
    {
      value: "500+",
      label: "Sekolah & Madrasah",
      desc: "Menggunakan Sera setiap hari",
    },
    {
      value: "1,2 Juta",
      label: "Siswa & Guru Aktif",
      desc: "Tercatat dalam sistem",
    },
    {
      value: "99,9%",
      label: "Uptime Sistem SLA",
      desc: "Keandalan cloud enterprise",
    },
    {
      value: "Rp 120M+",
      label: "Transaksi SPP Online",
      desc: "Terproses otomatis via Midtrans",
    },
  ];

  return (
    <section className="border-border bg-secondary relative border-y py-14">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <p className="text-muted-foreground text-center text-xs font-semibold tracking-wider uppercase">
          Dipercaya oleh Yayasan Pendidikan & Sekolah Terkemuka
        </p>

        {/* School badging pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {schools.map((s, idx) => (
            <div
              key={idx}
              className="border-border bg-background text-secondary-foreground hover:border-primary/30 flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium shadow-xs transition-all hover:shadow-sm"
            >
              <Building2 className="text-primary h-3.5 w-3.5" />
              <span className="text-foreground font-semibold">{s.name}</span>
              <span className="text-muted-foreground text-[11px]">
                • {s.type}
              </span>
            </div>
          ))}
        </div>

        {/* Key Numerical Metrics */}
        <div className="mt-14 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="border-border bg-background rounded-xl border p-5 text-center shadow-xs transition-transform hover:-translate-y-0.5"
            >
              <div className="text-foreground [font-feature-settings:'tnum'_1] text-3xl font-extrabold tracking-tight sm:text-4xl">
                {stat.value}
              </div>
              <div className="text-secondary-foreground mt-1.5 text-sm font-semibold">
                {stat.label}
              </div>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {stat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
