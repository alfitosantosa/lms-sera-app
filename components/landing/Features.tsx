
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
    <section id="fitur" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="bg-primary/10 text-primary inline-block rounded-full px-3.5 py-1 text-xs font-semibold">
            Modul &amp; Fitur Unggulan
          </span>
          <h2 className="text-foreground mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Enam pilar operasional sekolah Anda dalam satu sistem.
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            Dari bel masuk pagi hingga e-rapor akhir semester, setiap proses
            berjalan otomatis tanpa perlu entri data berulang di berbagai
            aplikasi berbeda.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feat, idx) => (
            <Card
              key={idx}
              className="group border-border bg-background hover:border-primary/40 relative flex flex-col justify-between overflow-hidden rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(13,37,61,0.06)]"
            >
              <CardContent className="space-y-4 p-0">
                {/* Icon with gradient badge */}
                <div className="flex items-center justify-between">
                  <div className="bg-secondary text-primary group-hover:bg-primary flex h-12 w-12 items-center justify-center rounded-xl transition-colors group-hover:text-white">
                    <feat.icon className="h-6 w-6" />
                  </div>
                  <ArrowUpRight className="text-muted-foreground h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                <h3 className="text-foreground group-hover:text-primary text-lg font-bold transition-colors">
                  {feat.title}
                </h3>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </CardContent>

              <div className="border-border/60 mt-6 border-t pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {feat.metricLabel}
                  </span>
                  <span className="text-foreground [font-feature-settings:'tnum'_1] font-semibold">
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
