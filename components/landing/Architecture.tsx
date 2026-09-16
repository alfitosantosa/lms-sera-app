import * as React from "react";
import {
  Lock,
  ShieldCheck,
  Database,
  Server,
  Building2,
  Key,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function Architecture() {
  const tenants = [
    { name: "SMK IT Santosa", count: "510 siswa · SMK" },
    { name: "SMA Santosa Al-Islamy", count: "420 siswa · SMA" },
    { name: "SMP Cendekia Al-Islamy", count: "380 siswa · SMP" },
    { name: "SD Islam Terpadu Harapan", count: "290 siswa · SD" },
  ];

  const roles = [
    {
      name: "Pengurus Yayasan",
      desc: "Melihat laporan gabungan seluruh sekolah, arus kas yayasan, dan pengaturan semua unit sekolah.",
    },
    {
      name: "Kepala Sekolah & Staf TU",
      desc: "Mengatur kurikulum, data siswa, jadwal guru, dan penerbitan e-rapor di sekolahnya.",
    },
    {
      name: "Guru & Wali Kelas",
      desc: "Presensi harian siswa, input nilai tugas & ujian, catatan pelanggaran, dan setoran tahfidz.",
    },
    {
      name: "Siswa",
      desc: "Melihat jadwal pelajaran, tugas harian, status kehadiran, dan kartu ujian digital.",
    },
    {
      name: "Orang Tua / Wali Murid",
      desc: "Menerima notifikasi WhatsApp kehadiran, memantau nilai, dan membayar SPP secara online.",
    },
  ];

  return (
    <section
      id="arsitektur"
      className="relative overflow-hidden bg-navy py-24 text-white"
    >
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-10 h-[500px] w-[500px] rounded-full bg-[#00d4ff]/15 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/30 px-3.5 py-1 text-xs font-semibold text-brand-accent">
            Privasi &amp; Keamanan Data
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Satu platform untuk seluruh sekolah di bawah yayasan Anda.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-navy-muted">
            Setiap sekolah punya ruang data sendiri yang terkunci rapat — siswa,
            keuangan, dan rapor tidak pernah tertukar antar sekolah.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left Column: Multi-Tenant Data Isolation */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-[#00d4ff]">
              <Lock className="h-5 w-5" />
              <h3 className="text-xl font-bold text-white">
                Data Setiap Sekolah Terpisah Rapat
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-navy-muted">
              Setiap sekolah punya ruang datanya sendiri di dalam sistem. Data
              sekolah yang satu tidak bisa dilihat atau tercampur dengan sekolah
              yang lain — sudah terjamin sejak dari desainnya.
            </p>

            <Card className="rounded-2xl border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
              <CardContent className="space-y-3 p-0">
                <div className="flex items-center justify-between text-xs text-navy-muted pb-2 border-b border-white/10">
                  <span>Unit Sekolah Aktif</span>
                  <span>Status Data</span>
                </div>
                {tenants.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="h-4 w-4 text-primary" />
                      <div>
                        <div className="font-semibold text-white">{t.name}</div>
                        <div className="text-[11px] text-navy-muted">
                          {t.count}
                        </div>
                      </div>
                    </div>
                    <Badge className="border-none bg-[#00d924]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#a5d6a7]">
                      Terkunci
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-4 text-xs text-navy-muted">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#00d4ff]" />
                Data terenkripsi &amp; aman
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="h-4 w-4 text-[#00d4ff]" />
                Backup otomatis setiap hari
              </div>
            </div>
          </div>

          {/* Right Column: Role Hierarchy */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-brand-accent">
              <Key className="h-5 w-5" />
              <h3 className="text-xl font-bold text-white">
                Hak Akses Sesuai Peran
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-navy-muted">
              Setiap pengguna hanya melihat data sesuai perannya — dari pengurus
              yayasan, kepala sekolah, guru, hingga orang tua — secara aman.
            </p>

            <div className="space-y-3">
              {roles.map((r, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition-colors hover:bg-white/[0.06]"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white">{r.name}</h4>
                    <p className="mt-0.5 text-xs leading-relaxed text-navy-muted">
                      {r.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
