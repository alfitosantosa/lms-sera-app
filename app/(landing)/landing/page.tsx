"use client";

import * as React from "react";
import { Sparkles, ShieldCheck, Users, Wallet, GraduationCap, ClipboardCheck, Menu, ArrowRight, CheckCircle2, TrendingUp, Lock, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useRouter } from "next/navigation";

// ─── Brand tokens (from DESIGN.md) ─────────────────────────────────────────
// primary  #533afd   primary-deep #4434d4   primary-press #2e2b8c
// dark     #1c1e54   ink #0d253d             ink-secondary #273951
// cream    #f5e9d4   soft #f6f9fc            hairline #e3e8ee
// ruby     #ea2261   magenta #f96bee         lemon #9b6829

// ─── Data ───────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Fitur", href: "#fitur" },
  { label: "Arsitektur", href: "#arsitektur" },
  { label: "Harga", href: "#harga" },
  { label: "FAQ", href: "#faq" },
];

const FEATURES = [
  {
    icon: ClipboardCheck,
    title: "Kedisiplinan & Presensi Terpusat",
    desc: "Presensi harian terhubung langsung ke alur pelanggaran. Poin kedisiplinan terhitung otomatis, notifikasi berjenjang ke wali kelas lalu orang tua.",
    metric: { label: "Notifikasi terkirim hari ini", value: "128" },
  },
  {
    icon: GraduationCap,
    title: "Akademik & Penilaian (E-Rapor)",
    desc: "Jadwal, bank soal, distribusi tugas, hingga rapor akhir siap cetak — mengikuti standar kurikulum tanpa entri data dua kali.",
    metric: { label: "Rapor siap cetak", value: "842 / 842" },
  },
  {
    icon: Users,
    title: "Portal Orang Tua",
    desc: "Orang tua memantau presensi, poin kedisiplinan, dan tagihan anak secara langsung — tanpa menghubungi wali kelas satu per satu.",
    metric: { label: "Akun orang tua aktif", value: "96%" },
  },
  {
    icon: Wallet,
    title: "Keuangan & Administrasi",
    desc: "SPP terhubung payment gateway, tunggakan terekap otomatis per siswa dan per rekening, kas sekolah dalam satu dashboard.",
    metric: { label: "Collection rate", value: "92%" },
  },
];

const ROLES = [
  { name: "Super Admin", desc: "Tim internal Sera — mengelola seluruh tenant sekolah" },
  { name: "Admin Sekolah", desc: "Mengatur data, staf, dan konfigurasi satu sekolah" },
  { name: "Guru", desc: "Presensi, nilai, dan komunikasi kelas" },
  { name: "Siswa", desc: "Jadwal, tugas, dan nilai pribadi" },
  { name: "Orang Tua", desc: "Pemantauan anak dan tagihan sekolah" },
];

const TENANTS = [
  { name: "SMA Nusantara 1", id: "tenant_0231" },
  { name: "SMP Cendekia", id: "tenant_0198" },
  { name: "SD Harapan Bangsa", id: "tenant_0074" },
];

const PRICING = [
  {
    tier: "Basic",
    desc: "Untuk sekolah yang baru mulai merapikan operasional harian.",
    price: "Rp3.000",
    unit: "per siswa / bulan",
    features: ["Presensi & kedisiplinan", "Komunikasi orang tua dasar", "Portal orang tua", "Dukungan email"],
    featured: false,
  },
  {
    tier: "Pro",
    desc: "Untuk sekolah yang butuh akademik dan ujian online penuh.",
    price: "Rp4.000",
    unit: "per siswa / bulan",
    features: ["Semua fitur Basic", "E-rapor & bank soal", "Ujian online", "Payment gateway terintegrasi", "Dukungan prioritas"],
    featured: true,
  },
  {
    tier: "Enterprise",
    desc: "Untuk yayasan dengan banyak sekolah dan kebutuhan khusus.",
    price: "Custom",
    unit: "disesuaikan skala yayasan",
    features: ["Semua fitur Pro", "Penggajian guru", "Laporan keuangan konsolidasi", "Multi-sekolah dalam satu yayasan", "Manajer akun khusus"],
    featured: false,
  },
];

const STATS = [
  { value: "500+", label: "Sekolah menggunakan Sera" },
  { value: "1,2 Juta", label: "Siswa aktif terpantau" },
  { value: "99,9%", label: "Uptime platform" },
];

const FAQS = [
  {
    q: "Apakah data antar sekolah bisa saling bercampur?",
    a: "Tidak. Setiap sekolah punya tenant_id sendiri pada tiap tabel utama, dikelola di level arsitektur — bukan sekadar hak akses — sehingga kebocoran data antar sekolah dicegah sejak desain sistem.",
  },
  {
    q: "Bagaimana skema harganya dihitung?",
    a: "Berbasis jumlah siswa aktif per bulan. Anda hanya membayar sesuai skala sekolah saat ini, dan bisa naik paket kapan pun kebutuhan bertambah.",
  },
  {
    q: "Apakah bisa migrasi dari sistem lama?",
    a: "Bisa. Tim kami membantu migrasi data siswa, nilai, dan riwayat pembayaran dari spreadsheet atau sistem lama tanpa biaya tambahan di semua paket.",
  },
  {
    q: "Apakah orang tua perlu instal aplikasi terpisah?",
    a: "Tidak wajib. Portal orang tua bisa diakses lewat browser di ponsel, dan tersedia juga sebagai aplikasi ringan untuk notifikasi langsung.",
  },
];

// ─── Small building blocks ─────────────────────────────────────────────────
function SectionTag({ children }: { children: React.ReactNode }) {
  return <span className="mb-3 block text-sm font-medium tracking-tight text-[#533afd]">{children}</span>;
}

function GradientMesh() {
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-40 z-0 h-[640px] overflow-hidden">
      <div className="absolute left-[2%] top-16 h-[380px] w-[440px] rounded-full bg-[#f5e9d4] opacity-90 blur-[90px]" />
      <div className="absolute left-[20%] top-4 h-[340px] w-[400px] rounded-full bg-[#9b6829] opacity-30 blur-[100px]" />
      <div className="absolute left-[40%] top-0 h-[420px] w-[480px] rounded-full bg-[#c9bffb] opacity-50 blur-[100px]" />
      <div className="absolute left-[58%] top-10 h-[460px] w-[520px] rounded-full bg-[#533afd] opacity-40 blur-[110px]" />
      <div className="absolute left-[78%] top-20 h-[380px] w-[420px] rounded-full bg-[#ea2261] opacity-30 blur-[100px]" />
      <div className="absolute left-[88%] top-8 h-[300px] w-[340px] rounded-full bg-[#f96bee] opacity-25 blur-[90px]" />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function SeraLandingPage() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const router = useRouter();

  const handleClickLogin = () => {
    router.push("/auth/sign-in");
  };
  return (
    <div className="min-h-screen bg-white font-light text-[#0d253d] antialiased [font-feature-settings:'ss01'_1]">
      {/* ═══════════ NAV ═══════════ */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-[#e3e8ee] bg-white/85 backdrop-blur-md" : "border-b border-transparent bg-white/60 backdrop-blur-md"}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-2 text-[19px] font-medium tracking-tight">
            <span className="h-2.5 w-2.5 rounded-full bg-[#533afd]" />
            Sera
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-[15px] font-normal text-[#273951] transition-colors hover:text-[#0d253d]">
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-5 md:flex">
            <a href="#" onClick={handleClickLogin} className="text-[15px] text-[#273951] transition-colors hover:text-[#0d253d]">
              Masuk
            </a>
            <Button className="rounded-full bg-[#533afd] px-5 text-white shadow-sm hover:bg-[#4434d4] active:bg-[#2e2b8c]">Mulai Gratis</Button>
          </div>

          {/* Mobile nav */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-10 flex flex-col gap-6">
                {NAV_LINKS.map((l) => (
                  <a key={l.href} href={l.href} className="text-base text-[#273951]">
                    {l.label}
                  </a>
                ))}
                <Separator />
                <a href="#" className="text-base text-[#273951]">
                  Masuk
                </a>
                <Button className="rounded-full bg-[#533afd] text-white hover:bg-[#4434d4]">Mulai Gratis</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <header className="relative overflow-hidden pt-16">
        <GradientMesh />

        <div className="relative z-10 mx-auto max-w-3xl px-6 pt-16 text-center">
          <Badge className="mb-6 rounded-full border-none bg-[#b9b9f9] px-3 py-1 text-[11px] font-normal uppercase tracking-wide text-[#4434d4] hover:bg-[#b9b9f9]">
            <Sparkles className="mr-1.5 h-3 w-3" />
            Platform LMS Sekolah Terbesar
          </Badge>

          <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-[40px] font-black leading-[1.08] tracking-[-1px] text-[#0d253d] sm:text-[52px] sm:tracking-[-1.3px]">
            Kelola sekolah dari satu tempat, bukan sepuluh spreadsheet.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-[#273951]">
            Sera menyatukan presensi, akademik, keuangan, dan komunikasi orang tua dalam satu platform — dibangun untuk yayasan yang mengelola lebih dari satu sekolah.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="w-full rounded-full bg-[#533afd] px-7 text-white shadow-md shadow-[#533afd]/20 transition-transform hover:-translate-y-0.5 hover:bg-[#4434d4] sm:w-auto">
              Mulai Uji Coba Gratis
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="w-full rounded-full border-[#533afd] px-7 text-[#533afd] hover:bg-[#b9b9f9]/40 sm:w-auto">
              Lihat Demo Produk
            </Button>
          </div>

          <p className="mt-5 text-[13px] text-[#64748d]">Tanpa kartu kredit. Aktif dalam satu hari kerja.</p>
        </div>

        {/* ── Dashboard composite ── */}
        <div className="relative z-10 mx-auto mt-16 max-w-5xl px-6 pb-24">
          <Card className="animate-in fade-in slide-in-from-bottom-6 duration-700 grid gap-4 overflow-hidden rounded-2xl border-[#e3e8ee] p-5 shadow-[0_8px_24px_rgba(0,55,112,0.08),0_2px_6px_rgba(0,55,112,0.04)] sm:grid-cols-3">
            {/* code panel */}
            <div className="rounded-xl bg-[#1c1e54] p-4 text-white">
              <div className="mb-3 flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
                <span className="h-2 w-2 rounded-full bg-[#28c840]" />
              </div>
              <pre className="whitespace-pre-wrap font-mono text-[11px] leading-[1.9] text-white/80">
                <span className="text-white/40">{"// tenant middleware"}</span>
                {"\n"}
                <span className="text-[#f96bee]">where</span>
                {": { tenantId }"}
                {"\n"}
                <span className="text-[#f96bee]">select</span>
                {": {"}
                {"\n"}
                {"  siswa, kelas,"}
                {"\n"}
                {"  presensi, tagihan"}
                {"\n"}
                {"}"}
                {"\n"}
                <span className="text-white/40">{"// isolated per sekolah"}</span>
              </pre>
            </div>

            {/* table panel */}
            <div className="rounded-xl border border-[#e3e8ee] p-4">
              <p className="mb-3  text-[13px] text-[#64748d]">Rekap Tunggakan SPP</p>
              <div className="space-y-1">
                {[
                  { name: "Ahmad Fajar", status: "Tunggak" },
                  { name: "Salsabila Putri", status: "Lunas" },
                  { name: "Rizky Ramadhan", status: "Tunggak" },
                  { name: "Nadia Aulia", status: "Lunas" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-[#e3e8ee] py-2 text-[14px] last:border-none [font-feature-settings:'tnum'_1]">
                    <span className="flex items-center gap-2">
                      <Avatar className="h-5 w-5 bg-[#b9b9f9]">
                        <AvatarFallback className="bg-[#b9b9f9] text-[9px] text-[#4434d4]">{s.name[0]}</AvatarFallback>
                      </Avatar>
                      {s.name}
                    </span>
                    <Badge className={`rounded-full border-none px-2 py-0 text-[10px] font-normal ${s.status === "Lunas" ? "bg-[#d3f5e4] text-[#0a7a4a] hover:bg-[#d3f5e4]" : "bg-[#fde2e9] text-[#ea2261] hover:bg-[#fde2e9]"}`}>
                      {s.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* chart panel */}
            <div className="rounded-xl border border-[#e3e8ee] p-4">
              <p className="mb-3 text-[13px] text-[#64748d]">Collection Rate</p>
              <div className="flex h-[100px] items-end gap-1.5">
                {[40, 65, 50, 80, 70, 92].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-[#533afd] to-[#665efd]" style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="mt-3 text-[14px] text-[#64748d] [font-feature-settings:'tnum'_1]">
                <span className="font-normal text-[#0d253d]">92%</span> bulan ini
              </p>
            </div>
          </Card>
        </div>
      </header>

      {/* ═══════════ STATS ═══════════ */}
      <section className="bg-[#f5e9d4] py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 text-center sm:grid-cols-3">
          {STATS.map((s, i) => (
            <div key={i}>
              <div className="text-[38px] font-black tracking-[-0.8px] text-[#0d253d] [font-feature-settings:'tnum'_1]">{s.value}</div>
              <div className="mt-1 text-[14px] text-[#273951]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="fitur" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <SectionTag>Modul Inti</SectionTag>
            <h2 className="text-[30px] font-black tracking-[-0.6px] text-[#0d253d] s">Empat pilar operasional sekolah Anda</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-[#64748d]">Dari bel masuk pagi hingga rapor akhir semester, setiap proses tercatat di satu sistem yang sama.</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <Card key={i} className="group rounded-2xl border-[#e3e8ee] p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,55,112,0.08)]">
                <CardContent className="space-y-4 p-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#b9b9f9] text-[#4434d4] transition-colors group-hover:bg-[#533afd] group-hover:text-white">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-[20px] font-black tracking-[-0.2px] text-[#0d253d]">{f.title}</h3>
                  <p className="text-[15px] leading-relaxed text-[#64748d]">{f.desc}</p>
                  <Separator className="bg-[#e3e8ee]" />
                  <div className="flex items-center justify-between pt-1 text-[13px]">
                    <span className="text-[#64748d]">{f.metric.label}</span>
                    <span className="text-[#0d253d] [font-feature-settings:'tnum'_1]">{f.metric.value}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ ARCHITECTURE (dark) ═══════════ */}
      <section id="arsitektur" className="bg-[#1c1e54] py-24 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <span className="mb-3 block text-sm font-medium text-[#665efd]">Arsitektur</span>
            <h2 className="text-[30px] font-black tracking-[-0.6px] sm:text-[32px]">Dibangun untuk skala multi-sekolah</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-white/60">Satu platform, banyak sekolah — tanpa data yang saling bercampur.</p>
          </div>

          <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#665efd]" />
                <p className="text-[18px] font-light">Isolasi data per tenant</p>
              </div>
              <p className="mb-6 text-[15px] leading-relaxed text-white/60">
                Setiap sekolah punya <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[13px]">tenant_id</code> pada tiap tabel utama. Dikelola di level ORM, sehingga kebocoran data antar sekolah dicegah sejak arsitektur —
                bukan sejak permission.
              </p>
              <Card className="rounded-2xl border-white/10 bg-white/[0.04] p-6">
                <CardContent className="space-y-1 p-0">
                  {TENANTS.map((t, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-white/10 py-3 text-[13px] last:border-none">
                      <span className="flex items-center gap-2 text-white/85">
                        <Building2 className="h-3.5 w-3.5 text-white/40" />
                        {t.name}
                      </span>
                      <Badge className="rounded-full border-none bg-[#665efd]/25 px-2 py-0 text-[11px] font-normal text-[#c9c3ff] hover:bg-[#665efd]/25 [font-feature-settings:'tnum'_1]">{t.id}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#665efd]" />
                <p className="text-[18px] font-light">Hierarki akses (RBAC)</p>
              </div>
              <p className="mb-3 text-[15px] leading-relaxed text-white/60">Setiap peran melihat hanya apa yang relevan untuknya.</p>
              <div>
                {ROLES.map((r, i) => (
                  <div key={i} className="flex items-start gap-4 border-b border-white/10 py-4 last:border-none">
                    <span className="w-6 text-[13px] text-white/40 [font-feature-settings:'tnum'_1]">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <div className="text-[16px]">{r.name}</div>
                      <div className="mt-0.5 text-[13px] text-white/55">{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CREAM INTERLUDE ═══════════ */}
      <section className="bg-[#f5e9d4] py-24">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="text-[26px] font-light leading-[1.2] tracking-[-0.4px] text-[#0d253d] sm:text-[30px]">Tunggakan yang biasanya tersembunyi di spreadsheet, kini terlihat sejak hari pertama.</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#273951]">Setiap transaksi dari payment gateway langsung terekonsiliasi ke rekening dan siswa yang tepat — bendahara sekolah tidak lagi mencocokkan mutasi secara manual.</p>
            <Button className="mt-7 rounded-full bg-[#533afd] px-6 text-white hover:bg-[#4434d4]">
              Lihat Bagaimana Sera Membantu
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>

          <Card className="rounded-2xl border-none p-6 shadow-[0_8px_24px_rgba(0,55,112,0.1),0_2px_6px_rgba(0,55,112,0.04)]">
            <CardContent className="space-y-0 p-0">
              {[
                { label: "Total tunggakan", value: "Rp214.500.000", color: "text-[#ea2261]" },
                { label: "Total terbayar", value: "Rp1.802.300.000", color: "text-[#0a7a4a]" },
                { label: "Collection rate", value: "89,4%", color: "text-[#0d253d]" },
                { label: "Rekening terhubung", value: "12", color: "text-[#0d253d]" },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between border-b border-[#e3e8ee] py-3 text-[14px] last:border-none">
                  <span className="text-[#64748d]">{row.label}</span>
                  <span className={`font-normal [font-feature-settings:'tnum'_1] ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section id="harga" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <SectionTag>Harga</SectionTag>
            <h2 className="text-[30px] font-light tracking-[-0.6px] text-[#0d253d] sm:text-[32px]">Harga yang tumbuh bersama sekolah Anda</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-[#64748d]">Dihitung per siswa aktif — bayar sesuai skala, bukan asumsi.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {PRICING.map((p, i) => (
              <Card
                key={i}
                className={`relative flex flex-col rounded-2xl p-8 transition-transform duration-300 ${
                  p.featured ? "border-none bg-[#1c1e54] text-white shadow-xl lg:-translate-y-3" : "border-[#e3e8ee] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,55,112,0.08)]"
                }`}
              >
                {p.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#533afd] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white">Paling Populer</span>}
                <CardContent className="flex flex-1 flex-col p-0">
                  <div className="mb-2 text-[22px] font-black tracking-[-0.2px]">{p.tier}</div>
                  <p className={`mb-6 min-h-[42px] text-[14px] ${p.featured ? "text-white/60" : "text-[#64748d]"}`}>{p.desc}</p>
                  <div className="mb-1 text-[26px] font-light tracking-[-0.26px] [font-feature-settings:'tnum'_1]">{p.price}</div>
                  <div className={`mb-6 text-[13px] ${p.featured ? "text-white/55" : "text-[#64748d]"}`}>{p.unit}</div>

                  <ul className="mb-8 flex-1 space-y-3">
                    {p.features.map((feat, j) => (
                      <li key={j} className={`flex items-start gap-2.5 text-[14px] ${p.featured ? "text-white/85" : "text-[#273951]"}`}>
                        <CheckCircle2 className={`mt-0.5 h-4 w-4 flex-shrink-0 ${p.featured ? "text-[#665efd]" : "text-[#533afd]"}`} />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <Button className={`w-full rounded-full ${p.featured ? "bg-[#533afd] text-white hover:bg-[#4434d4]" : "border border-[#533afd] bg-white text-[#533afd] hover:bg-[#b9b9f9]/40"}`}>
                    {p.tier === "Enterprise" ? "Hubungi Kami" : `Pilih ${p.tier}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section id="faq" className="bg-[#f6f9fc] py-24">
        <div className="mx-auto max-w-2xl px-6">
          <div className="mb-12 text-center">
            <SectionTag>Pertanyaan Umum</SectionTag>
            <h2 className="text-[28px] font-bold tracking-[-0.5px] text-[#0d253d]">Yang biasanya ditanyakan sebelum mulai</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="rounded-xl border border-[#e3e8ee] bg-white px-5 data-[state=open]:border-[#533afd]/30">
                <AccordionTrigger className="text-[15px] font-normal text-[#0d253d] hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-[14px] leading-relaxed text-[#64748d]">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ═══════════ CTA BAND ═══════════ */}
      <section className="relative overflow-hidden bg-[#0d253d] py-24 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-[#533afd] blur-[100px]" />
          <div className="absolute right-1/4 top-10 h-72 w-72 rounded-full bg-[#ea2261] blur-[100px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-2xl px-6">
          <h2 className="text-[30px] font-light tracking-[-0.5px] text-white sm:text-[34px]">Siap merapikan operasional sekolah Anda?</h2>
          <p className="mt-4 text-[16px] leading-relaxed text-white/65">Aktifkan Sera hari ini — tim kami membantu migrasi data dari sistem lama tanpa biaya tambahan.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="w-full rounded-full bg-[#533afd] px-7 text-white hover:bg-[#4434d4] sm:w-auto">
              Mulai Uji Coba Gratis
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button size="lg" className="w-full rounded-full bg-[#1c1e54] px-7 text-white hover:bg-[#151640] sm:w-auto">
              Jadwalkan Demo
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="px-6 pb-10 pt-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8 pb-12 sm:grid-cols-5">
            <div className="col-span-2">
              <a href="#" className="mb-3 flex items-center gap-2 text-[19px] font-medium tracking-tight">
                <span className="h-2.5 w-2.5 rounded-full bg-[#533afd]" />
                Sera
              </a>
              <p className="max-w-[220px] text-[13px] leading-relaxed text-[#64748d]">Platform LMS terbesar untuk sekolah dan yayasan pendidikan di Indonesia.</p>
            </div>
            <div>
              <h4 className="mb-4 text-[13px] font-medium text-[#0d253d]">Produk</h4>
              <ul className="space-y-2.5 text-[13px] text-[#64748d]">
                <li>
                  <a href="#fitur" className="hover:text-[#0d253d]">
                    Presensi & Kedisiplinan
                  </a>
                </li>
                <li>
                  <a href="#fitur" className="hover:text-[#0d253d]">
                    E-Rapor
                  </a>
                </li>
                <li>
                  <a href="#fitur" className="hover:text-[#0d253d]">
                    Portal Orang Tua
                  </a>
                </li>
                <li>
                  <a href="#fitur" className="hover:text-[#0d253d]">
                    Keuangan Sekolah
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-[13px] font-medium text-[#0d253d]">Perusahaan</h4>
              <ul className="space-y-2.5 text-[13px] text-[#64748d]">
                <li>
                  <a href="#" className="hover:text-[#0d253d]">
                    Tentang Kami
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#0d253d]">
                    Karier
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#0d253d]">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-[13px] font-medium text-[#0d253d]">Legal</h4>
              <ul className="space-y-2.5 text-[13px] text-[#64748d]">
                <li>
                  <a href="#" className="hover:text-[#0d253d]">
                    Kebijakan Privasi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#0d253d]">
                    Syarat Layanan
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <Separator className="bg-[#e3e8ee]" />
          <div className="flex flex-col items-center justify-between gap-3 pt-6 text-[13px] text-[#64748d] sm:flex-row">
            <span>© {new Date().getFullYear()} PT Santosa Tech Indonesia (Persero). Seluruh hak cipta dilindungi.</span>
            <span>Dibuat untuk sekolah modern.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
