import * as React from "react";
import {
  ClipboardCheck,
  GraduationCap,
  Wallet,
  Users,
  BookOpen,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function Features() {
  const features = [
    {
      icon: ClipboardCheck,
      title: "Kedisiplinan & Presensi Terpusat",
      desc: "Presensi harian terhubung langsung ke alur pelanggaran. Poin kedisiplinan terhitung otomatis dengan notifikasi berjenjang ke wali kelas lalu orang tua.",
      metricLabel: "Notifikasi terkirim hari ini",
      metricValue: "128 Presensi",
      accent: "from-primary to-brand-accent",
    },
    {
      icon: GraduationCap,
      title: "Akademik & E-Rapor Kurikulum Merdeka",
      desc: "Jadwal, bank soal, distribusi tugas, hingga rapor akhir siap cetak — mengikuti standar Kurikulum Merdeka tanpa entri data dua kali.",
      metricLabel: "Status rapor akhir semester",
      metricValue: "842 / 842 Siap Cetak",
      accent: "from-[#ea2261] to-[#f96bee]",
    },
    {
      icon: Wallet,
      title: "Keuangan & SPP Online Midtrans",
      desc: "SPP terhubung payment gateway resmi (Virtual Account BCA/Mandiri/BRI/BSI, QRIS). Tunggakan terekap otomatis per siswa dan rekening kas yayasan.",
      metricLabel: "Collection rate bulan ini",
      metricValue: "94.8% Terbayar",
      accent: "from-[#0a7a4a] to-[#00d924]",
    },
    {
      icon: Users,
      title: "Portal Mobile Orang Tua",
      desc: "Orang tua memantau presensi, poin kedisiplinan, dan tagihan anak secara langsung dari ponsel — tanpa menghubungi wali kelas satu per satu.",
      metricLabel: "Akun orang tua terhubung",
      metricValue: "96% Terverifikasi",
      accent: "from-[#0070f3] to-[#00dfd8]",
    },
    {
      icon: BookOpen,
      title: "Tahfidz Al-Qur'an & Mutaba'ah",
      desc: "Pencatatan setoran ayat, mutaba'ah yaumiyah harian, dan evaluasi tajwid berstandar pesantren untuk membina hafalan santri/siswa.",
      metricLabel: "Katalog Surah & Juz",
      metricValue: "30 Juz Lengkap",
      accent: "from-[#9b6829] to-[#ffb86c]",
    },
    {
      icon: MessageSquare,
      title: "Otomasi WhatsApp (Evolution API)",
      desc: "Integrasi bot WhatsApp resmi untuk notifikasi jam kehadiran, alert keterlambatan siswa, dan bukti kuitansi pembayaran SPP langsung ke nomor orang tua.",
      metricLabel: "Kecepatan pengiriman pesan",
      metricValue: "< 3 Detik Instan",
      accent: "from-[#25d366] to-[#128c7e]",
    },
  ];

  return (
    <section id="fitur" className="py-24 bg-background">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            Modul &amp; Fitur Unggulan
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Enam pilar operasional sekolah Anda dalam satu sistem.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Dari bel masuk pagi hingga e-rapor akhir semester, setiap proses berjalan otomatis tanpa
            perlu entri data berulang di berbagai aplikasi berbeda.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feat, idx) => (
            <Card
              key={idx}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-background p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_12px_30px_rgba(13,37,61,0.06)]"
            >
              <CardContent className="space-y-4 p-0">
                {/* Icon with gradient badge */}
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <feat.icon className="h-6 w-6" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {feat.title}
                </h3>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feat.desc}
                </p>
              </CardContent>

              <div className="mt-6 pt-4 border-t border-border/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{feat.metricLabel}</span>
                  <span className="font-semibold text-foreground [font-feature-settings:'tnum'_1]">
                    {feat.metricValue}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
