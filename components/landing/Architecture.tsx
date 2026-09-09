import * as React from "react";
import { Lock, ShieldCheck, Database, Server, Building2, Key, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function Architecture() {
  const tenants = [
    { name: "SMK IT Rahmaniyah", id: "tenant_0312", count: "510 Siswa", status: "Terisolasi" },
    { name: "SMA Rahmaniyah Al-Islamy", id: "tenant_0231", count: "420 Siswa", status: "Terisolasi" },
    { name: "SMP Cendekia Al-Islamy", id: "tenant_0198", count: "380 Siswa", status: "Terisolasi" },
    { name: "SD Islam Terpadu Harapan", id: "tenant_0074", count: "290 Siswa", status: "Terisolasi" },
  ];

  const roles = [
    {
      tier: "01",
      name: "Super Admin Yayasan",
      desc: "Melihat laporan konsolidasi seluruh unit sekolah, arus kas yayasan, dan konfigurasi multi-tenant.",
    },
    {
      tier: "02",
      name: "Kepala Sekolah & Staf TU",
      desc: "Mengatur kurikulum sekolah lokal, data siswa, jadwal guru, dan penerbitan e-rapor.",
    },
    {
      tier: "03",
      name: "Guru & Wali Kelas",
      desc: "Presensi harian siswa, input nilai tugas & ujian, catatan pelanggaran, dan setoran tahfidz.",
    },
    {
      tier: "04",
      name: "Siswa",
      desc: "Akses jadwal pelajaran, tugas harian, status kehadiran, dan kartu ujian digital.",
    },
    {
      tier: "05",
      name: "Orang Tua / Wali Murid",
      desc: "Menerima notifikasi WhatsApp kehadiran, memantau nilai, dan membayar SPP via payment gateway.",
    },
  ];

  return (
    <section id="arsitektur" className="relative overflow-hidden bg-[#0a2540] py-24 text-white">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full bg-[#533afd]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-10 h-[500px] w-[500px] rounded-full bg-[#00d4ff]/15 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-[#533afd]/30 px-3.5 py-1 text-xs font-semibold text-[#c9bffb]">
            Arsitektur &amp; Keamanan
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Dibangun untuk Yayasan dengan Skala Multi-Sekolah.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[#adbdcc]">
            Satu platform terpadu dengan isolasi data tingkat database untuk tiap sekolah di bawah
            naungan yayasan — tanpa risiko data saling tertukar atau bocor.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left Column: Multi-Tenant Data Isolation */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-[#00d4ff]">
              <Lock className="h-5 w-5" />
              <h3 className="text-xl font-bold text-white">
                Isolasi Data Tingkat Tenant (ORM Layer)
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-[#adbdcc]">
              Setiap sekolah memiliki identifier <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-[#00d4ff]">tenantId</code> unik pada setiap tabel operasional. Dikelola di level ORM &amp; query builder, sehingga kebocoran data antar sekolah dicegah langsung dari desain sistem.
            </p>

            <Card className="rounded-2xl border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
              <CardContent className="space-y-3 p-0">
                <div className="flex items-center justify-between text-xs text-[#adbdcc] pb-2 border-b border-white/10">
                  <span>Unit Sekolah Aktif</span>
                  <span>Status Isolasi</span>
                </div>
                {tenants.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="h-4 w-4 text-[#533afd]" />
                      <div>
                        <div className="font-semibold text-white">{t.name}</div>
                        <div className="text-[11px] text-[#adbdcc]">{t.count} • {t.id}</div>
                      </div>
                    </div>
                    <Badge className="border-none bg-[#00d924]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#a5d6a7]">
                      {t.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-4 text-xs text-[#adbdcc]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#00d4ff]" />
                Enkripsi data saat istirahat (AES-256)
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="h-4 w-4 text-[#00d4ff]" />
                Backup otomatis setiap hari
              </div>
            </div>
          </div>

          {/* Right Column: RBAC Hierarchy */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-[#7b46ff]">
              <Key className="h-5 w-5" />
              <h3 className="text-xl font-bold text-white">
                Hierarki Hak Akses Berjenjang (RBAC)
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-[#adbdcc]">
              Setiap pengguna hanya dapat melihat dan memodifikasi data yang relevan dengan peran masing-masing, diautentikasi aman melalui session Better Auth.
            </p>

            <div className="space-y-3">
              {roles.map((r, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition-colors hover:bg-white/[0.06]"
                >
                  <span className="font-mono text-xs font-bold text-[#00d4ff]">
                    {r.tier}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{r.name}</h4>
                    <p className="mt-0.5 text-xs leading-relaxed text-[#adbdcc]">
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
