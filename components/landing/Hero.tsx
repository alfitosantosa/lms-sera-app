"use client";

import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  UserCheck,
  Building,
  MessageSquare,
  CheckCircle2,
  Clock,
  Lock,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GradientMesh } from "./GradientMesh";
import { useState } from "react";

type PreviewTab = "keuangan" | "presensi" | "tenant" | "whatsapp";

export function Hero() {
  const [activeTab, setActiveTab] = useState<PreviewTab>("keuangan");
  const [selectedSchool, setSelectedSchool] = useState<string>("smk-it");
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/auth/sign-in");
  };

  return (
    <header className="relative overflow-hidden pt-8 pb-20 md:pt-14 md:pb-28">
      <GradientMesh />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* Luminous Top Badge */}
        <div className="border-primary/20 bg-background/70 text-primary hover:border-primary/40 inline-flex items-center gap-2 rounded-full border px-2 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-md transition-all">
          <Sparkles className="text-primary h-3.5 w-3.5" />
          <span>Platform LMS & ERP Multi-Sekolah Terpadu</span>
          <span className="bg-primary py-1 rounded-full px-2  text-[10px] font-bold text-white">
            Yayasan
          </span>
        </div>

        {/* Master Headline */}
        <h1 className="text-foreground mx-auto mt-6 max-w-4xl text-[36px] leading-[1.12] font-extrabold tracking-[-0.03em] sm:text-[54px] md:text-[62px]">
          Kelola sekolah dari satu tempat,{" "}
          <span className="from-primary via-brand-accent bg-gradient-to-r to-[#ea2261] bg-clip-text text-transparent">
            bukan sepuluh spreadsheet.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-foreground/80 mx-auto mt-6 max-w-2xl text-[16px] leading-relaxed sm:text-[18px]">
          Sera menyatukan presensi harian, penilaian e-rapor, penagihan SPP
          online via Midtrans, dan notifikasi WhatsApp orang tua dalam satu
          platform multi-tenant yang aman dan cepat.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Button
            onClick={handleSignIn}
            size="lg"
            className="group bg-primary shadow-primary/25 hover:bg-primary-hover hover:shadow-primary/35 w-full rounded-full px-8 py-6 text-[15px] font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
          >
            <span>Mulai Uji Coba Gratis</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>

          <Button
            onClick={handleSignIn}
            size="lg"
            variant="outline"
            className="border-border bg-background/80 text-secondary-foreground hover:border-primary/40 hover:bg-background hover:text-primary w-full rounded-full px-7 py-6 text-[15px] font-medium backdrop-blur-sm transition-all sm:w-auto"
          >
            Masuk ke Akun
          </Button>
        </div>

        {/* Trust bullet points */}
        <div className="text-muted-foreground mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="text-success h-3.5 w-3.5" />
            Tanpa kartu kredit
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="text-success h-3.5 w-3.5" />
            Setup instan 1 hari kerja
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="text-success h-3.5 w-3.5" />
            Migrasi data spreadsheet dibantu
          </span>
        </div>
      </div>

      {/* ── Interactive Live Dashboard Composite ── */}
      <div className="relative z-10 mx-auto mt-12 max-w-5xl px-4 sm:px-6">
        <div className="border-border bg-background rounded-2xl border p-2.5 shadow-[0_20px_50px_rgba(13,37,61,0.08),0_4px_12px_rgba(13,37,61,0.03)] backdrop-blur-md sm:p-4">
          {/* Tab Navigation Header */}
          <div className="border-border flex flex-wrap items-center justify-between gap-2 border-b px-2 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="text-muted-foreground ml-2 hidden text-xs font-medium sm:inline-block">
                Sera School Management System v0.4
              </span>
            </div>

            {/* Segmented Control */}
            <div className="bg-secondary text-foreground/80 flex flex-wrap justify-center rounded-lg p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("keuangan")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all ${
                  activeTab === "keuangan"
                    ? "bg-background text-primary font-semibold shadow-sm"
                    : "hover:text-foreground"
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>SPP & Keuangan</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("presensi")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all ${
                  activeTab === "presensi"
                    ? "bg-background text-primary font-semibold shadow-sm"
                    : "hover:text-foreground"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Presensi & Disiplin</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("tenant")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all ${
                  activeTab === "tenant"
                    ? "bg-background text-primary font-semibold shadow-sm"
                    : "hover:text-foreground"
                }`}
              >
                <Building className="h-3.5 w-3.5" />
                <span>Multi-Tenant</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("whatsapp")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all ${
                  activeTab === "whatsapp"
                    ? "bg-background text-primary font-semibold shadow-sm"
                    : "hover:text-foreground"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Bot WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Interactive Tab Body */}
          <div className="p-3 sm:p-5">
            {/* TAB 1: KEUANGAN */}
            {activeTab === "keuangan" && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Metric Card */}
                <div className="border-border bg-secondary/50 rounded-xl border p-4">
                  <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <span>Collection Rate SPP</span>
                    <Badge className="bg-success-chip text-success border-none text-[10px] font-semibold">
                      +4.2% bln ini
                    </Badge>
                  </div>
                  <div className="text-foreground mt-2 [font-feature-settings:'tnum'_1] text-2xl font-black">
                    94.8%
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Rp 1.802.300.000 terbayar dari 1.248 siswa
                  </p>

                  {/* Micro Chart */}
                  <div className="mt-4 flex h-18 items-end gap-2">
                    {[45, 60, 55, 78, 85, 95].map((val, idx) => (
                      <div
                        key={idx}
                        className="flex flex-1 flex-col items-center gap-1"
                      >
                        <div
                          className="from-primary to-brand-accent w-full rounded-t-sm bg-gradient-to-t transition-all duration-500"
                          style={{ height: `${val}%` }}
                        />
                        <span className="text-muted-foreground text-[9px]">
                          {["Apr", "Mei", "Jun", "Jul", "Ags", "Sep"][idx]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Transactions Table */}
                <div className="border-border bg-background rounded-xl border p-4 lg:col-span-2">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-foreground text-xs font-semibold">
                      Transaksi SPP Terbaru (Midtrans Gateway)
                    </div>
                    <span className="text-primary flex items-center gap-1 text-[11px] font-medium">
                      <span className="bg-success h-1.5 w-1.5 animate-pulse rounded-full" />
                      Live Feed
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        name: "Ahmad Fajar",
                        class: "XII RPL 1",
                        amount: "Rp 450.000",
                        method: "QRIS Midtrans",
                        status: "Lunas",
                      },
                      {
                        name: "Salsabila Putri",
                        class: "XI TKJ 2",
                        amount: "Rp 600.000",
                        method: "VA Bank BCA",
                        status: "Lunas",
                      },
                      {
                        name: "Rizky Ramadhan",
                        class: "X DKV 1",
                        amount: "Rp 450.000",
                        method: "VA Bank Mandiri",
                        status: "Menunggu",
                      },
                      {
                        name: "Nadia Aulia",
                        class: "XII RPL 2",
                        amount: "Rp 1.200.000",
                        method: "VA Bank BSI",
                        status: "Lunas",
                      },
                    ].map((tx, idx) => (
                      <div
                        key={idx}
                        className="border-border/60 bg-background hover:bg-secondary flex items-center justify-between rounded-lg border p-2.5 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Avatar className="bg-brand-tint text-primary h-7 w-7 rounded-full text-[11px] font-bold">
                            <AvatarFallback className="bg-brand-tint text-primary">
                              {tx.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-foreground font-semibold">
                              {tx.name}
                            </div>
                            <div className="text-muted-foreground text-[11px]">
                              {tx.class} • {tx.method}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-foreground [font-feature-settings:'tnum'_1] font-bold">
                            {tx.amount}
                          </div>
                          <Badge
                            className={`rounded-full border-none px-2 py-0 text-[10px] font-semibold ${
                              tx.status === "Lunas"
                                ? "bg-success-chip text-success"
                                : "bg-warning-chip text-warning"
                            }`}
                          >
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRESENSI & DISIPLIN */}
            {activeTab === "presensi" && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="border-border bg-secondary/50 rounded-xl border p-4">
                  <div className="text-foreground text-xs font-semibold">
                    Tingkat Kehadiran Hari Ini
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-foreground [font-feature-settings:'tnum'_1] text-3xl font-black">
                      98.4%
                    </span>
                    <span className="text-success text-xs font-semibold">
                      Tepat Waktu
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    1.248 hadir • 12 izin • 6 sakit • 2 alfa
                  </p>

                  <div className="mt-5 space-y-2 text-xs">
                    <div className="text-muted-foreground flex items-center justify-between">
                      <span>Check-in Guru</span>
                      <span className="text-foreground font-semibold">
                        64 / 64 (100%)
                      </span>
                    </div>
                    <div className="bg-border h-1.5 w-full rounded-full">
                      <div className="bg-success h-full w-full rounded-full" />
                    </div>

                    <div className="text-muted-foreground flex items-center justify-between pt-2">
                      <span>Notifikasi WA Orang Tua</span>
                      <span className="text-primary font-semibold">
                        100% Terkirim
                      </span>
                    </div>
                    <div className="bg-border h-1.5 w-full rounded-full">
                      <div className="bg-primary h-full w-full rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="border-border bg-background rounded-xl border p-4 lg:col-span-2">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-foreground text-xs font-semibold">
                      Log Presensi Siswa Realtime
                    </div>
                    <span className="text-muted-foreground text-[11px]">
                      Pembaruan otomatis
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        name: "Muhammad Farhan",
                        class: "XII RPL 1",
                        time: "06:42 WIB",
                        status: "Tepat Waktu",
                        waStatus: "Notifikasi WA terkirim",
                      },
                      {
                        name: "Fatimah Azzahra",
                        class: "XI TKJ 1",
                        time: "06:49 WIB",
                        status: "Tepat Waktu",
                        waStatus: "Notifikasi WA terkirim",
                      },
                      {
                        name: "Budi Santoso",
                        class: "X DKV 2",
                        time: "07:18 WIB",
                        status: "Terlambat (18m)",
                        waStatus: "Poin kedisiplinan +5 dicatat",
                      },
                      {
                        name: "Zahra Amelia",
                        class: "XII RPL 2",
                        time: "06:55 WIB",
                        status: "Tepat Waktu",
                        waStatus: "Notifikasi WA terkirim",
                      },
                    ].map((row, idx) => (
                      <div
                        key={idx}
                        className="border-border/60 bg-background flex items-center justify-between rounded-lg border p-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="bg-secondary text-primary flex h-7 w-7 items-center justify-center rounded-full">
                            <Clock className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="text-foreground font-semibold">
                              {row.name}
                            </span>
                            <span className="text-muted-foreground ml-1.5">
                              ({row.class})
                            </span>
                            <div className="text-muted-foreground text-[11px]">
                              {row.waStatus}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-foreground font-mono text-xs">
                            {row.time}
                          </span>
                          <div>
                            <Badge
                              className={`rounded-full border-none px-2 py-0 text-[10px] font-semibold ${
                                row.status.includes("Terlambat")
                                  ? "bg-destructive-chip text-destructive"
                                  : "bg-success-chip text-success"
                              }`}
                            >
                              {row.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MULTI-TENANT */}
            {activeTab === "tenant" && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="border-border bg-secondary/60 rounded-xl border p-4">
                  <div className="text-foreground text-xs font-semibold">
                    Pilih Sekolah dalam Yayasan
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Satu database, isolasi ketat per tenant sekolah.
                  </p>

                  <div className="mt-4 space-y-2">
                    {[
                      {
                        id: "smk-it",
                        name: "SMK IT Santosa",
                        desc: "510 siswa · 3 jurusan",
                      },
                      {
                        id: "sma",
                        name: "SMA Santosa",
                        desc: "420 siswa · 2 jurusan",
                      },
                      {
                        id: "smp",
                        name: "SMP Santosa",
                        desc: "380 siswa · 2 jurusan",
                      },
                    ].map((school) => (
                      <button
                        key={school.id}
                        type="button"
                        onClick={() => setSelectedSchool(school.id)}
                        className={`flex w-full items-center justify-between rounded-lg p-2.5 text-left text-xs transition-all ${
                          selectedSchool === school.id
                            ? "border-primary bg-background text-primary border font-semibold shadow-sm"
                            : "bg-background/70 text-secondary-foreground hover:bg-background border border-transparent"
                        }`}
                      >
                        <div>
                          <div>{school.name}</div>
                          <div className="text-muted-foreground text-[10px]">
                            {school.desc}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-navy rounded-xl p-4 text-white lg:col-span-2">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Lock className="text-primary h-3.5 w-3.5" />
                      <span className="text-xs font-semibold text-white">
                        Data{" "}
                        {selectedSchool === "smk-it"
                          ? "SMK IT Santosa"
                          : selectedSchool === "sma"
                            ? "SMA Santosa"
                            : "SMP Santosa"}
                      </span>
                    </div>
                    <Badge className="bg-primary/30 text-brand-accent border-none text-[10px]">
                      Terkunci &amp; Terpisah
                    </Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    {[
                      "Data Siswa & Presensi",
                      "Tagihan SPP",
                      "E-Rapor",
                      "Hafalan Tahfidz",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 rounded-lg bg-white/5 p-2.5 text-white/80"
                      >
                        <ShieldCheck className="h-4 w-4 flex-shrink-0 text-[#00d924]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/5 p-2.5 text-xs text-white/70">
                    <ShieldCheck className="h-4 w-4 flex-shrink-0 text-[#00d924]" />
                    <span>
                      Hanya warga sekolah ini yang bisa melihat datanya — tidak
                      pernah tertukar dengan sekolah lain.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: WHATSAPP BOT */}
            {activeTab === "whatsapp" && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="border-border bg-secondary/50 rounded-xl border p-4">
                  <div className="text-foreground text-xs font-semibold">
                    Integrasi WhatsApp Otomatis
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Terhubung dengan Evolution API. Orang tua menerima
                    notifikasi instan tanpa perlu install aplikasi.
                  </p>

                  <div className="mt-4 space-y-2.5 text-xs">
                    <div className="bg-background border-border rounded-lg border p-3">
                      <div className="text-foreground font-semibold">
                        Presensi Harian
                      </div>
                      <div className="text-muted-foreground text-[11px]">
                        Kirim otomatis saat siswa tap kartu / check-in
                      </div>
                    </div>
                    <div className="bg-background border-border rounded-lg border p-3">
                      <div className="text-foreground font-semibold">
                        Kuitansi SPP
                      </div>
                      <div className="text-muted-foreground text-[11px]">
                        PDF kuitansi resmi langsung ke nomor ortu
                      </div>
                    </div>
                    <div className="bg-background border-border rounded-lg border p-3">
                      <div className="text-foreground font-semibold">
                        Mutaba&apos;ah & Tahfidz
                      </div>
                      <div className="text-muted-foreground text-[11px]">
                        Laporan setoran juz & surah mingguan
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#25d366]/20 bg-[#efeae2] p-4 lg:col-span-2">
                  {/* WA Header */}
                  <div className="flex items-center gap-2.5 rounded-t-lg bg-[#075e54] p-3 text-white">
                    <Avatar className="bg-background h-8 w-8 rounded-full text-xs font-bold text-[#075e54]">
                      <AvatarFallback>SR</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <span>LMS Santosa Al-Islamy (Bot)</span>
                        <CheckCircle2 className="h-3.5 w-3.5 fill-white text-[#25d366]" />
                      </div>
                      <div className="text-[10px] text-white/80">
                        Akun WhatsApp Bisnis Terverifikasi
                      </div>
                    </div>
                  </div>

                  {/* WA Messages */}
                  <div className="space-y-3 p-3 text-xs">
                    <div className="bg-background text-foreground max-w-[85%] rounded-lg rounded-tl-none p-3 shadow-sm">
                      <p className="font-semibold text-[#075e54]">
                        Notifikasi Presensi Sekolah
                      </p>
                      <p className="mt-1">
                        Assalamu&apos;alaikum Bpk/Ibu, ananda{" "}
                        <strong>Ahmad Fajar (XII RPL 1)</strong> telah melakukan
                        presensi MASUK di sekolah pada pukul{" "}
                        <strong>06:48 WIB</strong> (Tepat Waktu).
                      </p>
                      <p className="text-muted-foreground mt-1 text-right text-[10px]">
                        06:48 ✓✓
                      </p>
                    </div>

                    <div className="bg-background text-foreground max-w-[85%] rounded-lg rounded-tl-none p-3 shadow-sm">
                      <p className="font-semibold text-[#075e54]">
                        Bukti Pembayaran SPP Online
                      </p>
                      <p className="mt-1">
                        Terima kasih, pembayaran SPP Bulan September sebesar{" "}
                        <strong>Rp 450.000</strong> telah berhasil diverifikasi
                        via <strong>Virtual Account BCA</strong>.
                      </p>
                      <p className="text-primary mt-2 font-medium underline">
                        Unduh Kuitansi PDF Resmi (#INV-2026-0909)
                      </p>
                      <p className="text-muted-foreground mt-1 text-right text-[10px]">
                        08:15 ✓✓
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
