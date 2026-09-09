"use client";

import * as React from "react";
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
  QrCode,
  Lock,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GradientMesh } from "./GradientMesh";

type PreviewTab = "keuangan" | "presensi" | "tenant" | "whatsapp";

export function Hero() {
  const [activeTab, setActiveTab] = React.useState<PreviewTab>("keuangan");
  const [selectedSchool, setSelectedSchool] = React.useState<string>("smk-it");
  const router = useRouter();

  const handleRegisterFoundation = () => {
    router.push("/landing/register/foundation");
  };

  const handleSignIn = () => {
    router.push("/auth/sign-in");
  };

  const handleScrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById("fitur");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="relative overflow-hidden pt-8 pb-20 md:pt-14 md:pb-28">
      <GradientMesh />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* Luminous Top Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#533afd]/20 bg-white/70 px-4 py-1.5 text-xs font-semibold text-[#533afd] shadow-sm backdrop-blur-md transition-all hover:border-[#533afd]/40">
          <Sparkles className="h-3.5 w-3.5 text-[#533afd]" />
          <span>Platform LMS & ERP Multi-Sekolah Terpadu</span>
          <span className="rounded-full bg-[#533afd] px-1.5 py-0.2 text-[10px] font-bold text-white">
            Yayasan
          </span>
        </div>

        {/* Master Headline */}
        <h1 className="mx-auto mt-6 max-w-4xl text-[36px] font-extrabold leading-[1.12] tracking-[-0.03em] text-[#0d253d] sm:text-[54px] md:text-[62px]">
          Kelola sekolah dari satu tempat,{" "}
          <span className="bg-gradient-to-r from-[#533afd] via-[#7b46ff] to-[#ea2261] bg-clip-text text-transparent">
            bukan sepuluh spreadsheet.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-relaxed text-[#425466] sm:text-[18px]">
          Sera menyatukan presensi harian, penilaian e-rapor, penagihan SPP online via Midtrans, dan
          notifikasi WhatsApp orang tua dalam satu platform multi-tenant yang aman dan cepat.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Button
            onClick={handleRegisterFoundation}
            size="lg"
            className="group w-full rounded-full bg-[#533afd] px-8 py-6 text-[15px] font-semibold text-white shadow-lg shadow-[#533afd]/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4434d4] hover:shadow-xl hover:shadow-[#533afd]/35 sm:w-auto"
          >
            <span>Mulai Uji Coba Gratis</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>

          <Button
            onClick={handleSignIn}
            size="lg"
            variant="outline"
            className="w-full rounded-full border-[#e3e8ee] bg-white/80 px-7 py-6 text-[15px] font-medium text-[#273951] backdrop-blur-sm transition-all hover:border-[#533afd]/40 hover:bg-white hover:text-[#533afd] sm:w-auto"
          >
            Masuk ke Akun
          </Button>
        </div>

        {/* Trust bullet points */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-[#64748d]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#0a7a4a]" />
            Tanpa kartu kredit
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#0a7a4a]" />
            Setup instan 1 hari kerja
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#0a7a4a]" />
            Migrasi data spreadsheet dibantu
          </span>
        </div>
      </div>

      {/* ── Interactive Live Dashboard Composite ── */}
      <div className="relative z-10 mx-auto mt-12 max-w-5xl px-4 sm:px-6">
        <div className="rounded-2xl border border-[#e3e8ee] bg-white p-2.5 shadow-[0_20px_50px_rgba(13,37,61,0.08),0_4px_12px_rgba(13,37,61,0.03)] backdrop-blur-md sm:p-4">
          {/* Tab Navigation Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e3e8ee] pb-3 px-2">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-2 hidden text-xs font-medium text-[#64748d] sm:inline-block">
                Sera School Management System v0.4
              </span>
            </div>

            {/* Segmented Control */}
            <div className="flex rounded-lg bg-[#f6f9fc] p-1 text-xs font-medium text-[#425466]">
              <button
                type="button"
                onClick={() => setActiveTab("keuangan")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all ${
                  activeTab === "keuangan"
                    ? "bg-white text-[#533afd] shadow-sm font-semibold"
                    : "hover:text-[#0d253d]"
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
                    ? "bg-white text-[#533afd] shadow-sm font-semibold"
                    : "hover:text-[#0d253d]"
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
                    ? "bg-white text-[#533afd] shadow-sm font-semibold"
                    : "hover:text-[#0d253d]"
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
                    ? "bg-white text-[#533afd] shadow-sm font-semibold"
                    : "hover:text-[#0d253d]"
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
                <div className="rounded-xl border border-[#e3e8ee] bg-[#f6f9fc]/50 p-4">
                  <div className="flex items-center justify-between text-xs text-[#64748d]">
                    <span>Collection Rate SPP</span>
                    <Badge className="border-none bg-[#d3f5e4] text-[10px] font-semibold text-[#0a7a4a]">
                      +4.2% bln ini
                    </Badge>
                  </div>
                  <div className="mt-2 text-2xl font-black text-[#0d253d] [font-feature-settings:'tnum'_1]">
                    94.8%
                  </div>
                  <p className="mt-1 text-xs text-[#64748d]">
                    Rp 1.802.300.000 terbayar dari 1.248 siswa
                  </p>

                  {/* Micro Chart */}
                  <div className="mt-4 flex h-18 items-end gap-2">
                    {[45, 60, 55, 78, 85, 95].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t-sm bg-gradient-to-t from-[#533afd] to-[#7b46ff] transition-all duration-500"
                          style={{ height: `${val}%` }}
                        />
                        <span className="text-[9px] text-[#64748d]">
                          {["Apr", "Mei", "Jun", "Jul", "Ags", "Sep"][idx]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Transactions Table */}
                <div className="lg:col-span-2 rounded-xl border border-[#e3e8ee] p-4 bg-white">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-xs font-semibold text-[#0d253d]">
                      Transaksi SPP Terbaru (Midtrans Gateway)
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-[#533afd]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0a7a4a] animate-pulse" />
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
                        className="flex items-center justify-between rounded-lg border border-[#f1f4f8] bg-[#fdfdfe] p-2.5 text-xs transition-colors hover:bg-[#f6f9fc]"
                      >
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7 rounded-full bg-[#ebe8ff] text-[#533afd] text-[11px] font-bold">
                            <AvatarFallback className="bg-[#ebe8ff] text-[#533afd]">
                              {tx.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-[#0d253d]">{tx.name}</div>
                            <div className="text-[11px] text-[#64748d]">{tx.class} • {tx.method}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-[#0d253d] [font-feature-settings:'tnum'_1]">
                            {tx.amount}
                          </div>
                          <Badge
                            className={`rounded-full border-none px-2 py-0 text-[10px] font-semibold ${
                              tx.status === "Lunas"
                                ? "bg-[#d3f5e4] text-[#0a7a4a]"
                                : "bg-[#fef3c7] text-[#92400e]"
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
                <div className="rounded-xl border border-[#e3e8ee] bg-[#f6f9fc]/50 p-4">
                  <div className="text-xs font-semibold text-[#0d253d]">Tingkat Kehadiran Hari Ini</div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#0d253d] [font-feature-settings:'tnum'_1]">
                      98.4%
                    </span>
                    <span className="text-xs text-[#0a7a4a] font-semibold">Tepat Waktu</span>
                  </div>
                  <p className="mt-1 text-xs text-[#64748d]">
                    1.248 hadir • 12 izin • 6 sakit • 2 alfa
                  </p>

                  <div className="mt-5 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[#64748d]">
                      <span>Check-in Guru</span>
                      <span className="font-semibold text-[#0d253d]">64 / 64 (100%)</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#e3e8ee]">
                      <div className="h-full rounded-full bg-[#0a7a4a] w-full" />
                    </div>

                    <div className="flex items-center justify-between text-[#64748d] pt-2">
                      <span>Notifikasi WA Orang Tua</span>
                      <span className="font-semibold text-[#533afd]">100% Terkirim</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#e3e8ee]">
                      <div className="h-full rounded-full bg-[#533afd] w-full" />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 rounded-xl border border-[#e3e8ee] p-4 bg-white">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-xs font-semibold text-[#0d253d]">
                      Log Presensi Siswa Realtime
                    </div>
                    <span className="text-[11px] text-[#64748d]">Pembaruan otomatis</span>
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
                        className="flex items-center justify-between rounded-lg border border-[#f1f4f8] bg-[#fdfdfe] p-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f6f9fc] text-[#533afd]">
                            <Clock className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="font-semibold text-[#0d253d]">{row.name}</span>
                            <span className="text-[#64748d] ml-1.5">({row.class})</span>
                            <div className="text-[11px] text-[#64748d]">{row.waStatus}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-xs text-[#0d253d]">{row.time}</span>
                          <div>
                            <Badge
                              className={`rounded-full border-none px-2 py-0 text-[10px] font-semibold ${
                                row.status.includes("Terlambat")
                                  ? "bg-[#fde2e9] text-[#ea2261]"
                                  : "bg-[#d3f5e4] text-[#0a7a4a]"
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
                <div className="rounded-xl border border-[#e3e8ee] bg-[#f6f9fc]/60 p-4">
                  <div className="text-xs font-semibold text-[#0d253d]">
                    Pilih Sekolah dalam Yayasan
                  </div>
                  <p className="mt-0.5 text-xs text-[#64748d]">
                    Satu database, isolasi ketat per tenant sekolah.
                  </p>

                  <div className="mt-4 space-y-2">
                    {[
                      { id: "smk-it", name: "SMK IT Rahmaniyah", code: "tenant_smk_01" },
                      { id: "sma", name: "SMA Rahmaniyah", code: "tenant_sma_02" },
                      { id: "smp", name: "SMP Rahmaniyah", code: "tenant_smp_03" },
                    ].map((school) => (
                      <button
                        key={school.id}
                        type="button"
                        onClick={() => setSelectedSchool(school.id)}
                        className={`w-full flex items-center justify-between rounded-lg p-2.5 text-left text-xs transition-all ${
                          selectedSchool === school.id
                            ? "border border-[#533afd] bg-white font-semibold text-[#533afd] shadow-sm"
                            : "border border-transparent bg-white/70 text-[#273951] hover:bg-white"
                        }`}
                      >
                        <div>
                          <div>{school.name}</div>
                          <div className="font-mono text-[10px] text-[#64748d]">{school.code}</div>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 rounded-xl bg-[#0a2540] p-4 text-white">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-[#533afd]" />
                      <span className="font-mono text-xs text-white/80">
                        schema-tenant-isolation.ts
                      </span>
                    </div>
                    <Badge className="border-none bg-[#533afd]/30 text-[10px] text-[#b9b9f9]">
                      ORM Isolation Active
                    </Badge>
                  </div>

                  <pre className="mt-3 overflow-x-auto font-mono text-[11px] leading-[1.8] text-white/80">
                    <span className="text-white/40">// Middleware memastikan query terkunci pada sekolah aktif</span>
                    {"\n"}
                    <span className="text-[#f96bee]">const</span> students ={" "}
                    <span className="text-[#00d4ff]">await</span> prisma.userData.findMany({"{"}
                    {"\n"}  where: {"{"}
                    {"\n"}    foundationId:{" "}
                    <span className="text-[#a5d6a7]">&quot;yayasan_rahmaniyah&quot;</span>,
                    {"\n"}    schoolId:{" "}
                    <span className="text-[#ffb86c]">
                      &quot;{selectedSchool === "smk-it" ? "tenant_smk_01" : selectedSchool === "sma" ? "tenant_sma_02" : "tenant_smp_03"}&quot;
                    </span>
                    {"\n"}  {"}"},
                    {"\n"}  include: {"{"} class: <span className="text-[#f96bee]">true</span>, paymentBills: <span className="text-[#f96bee]">true</span> {"}"}
                    {"\n"}{"}"});
                  </pre>

                  <div className="mt-4 flex items-center justify-between rounded-lg bg-white/5 p-2.5 text-xs text-white/70">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[#00d924]" />
                      Zero cross-tenant data leakage guarantee
                    </span>
                    <span className="font-mono text-[11px] text-[#00d4ff]">PostgreSQL RLS Ready</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: WHATSAPP BOT */}
            {activeTab === "whatsapp" && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-[#e3e8ee] bg-[#f6f9fc]/50 p-4">
                  <div className="text-xs font-semibold text-[#0d253d]">
                    Integrasi WhatsApp Otomatis
                  </div>
                  <p className="mt-1 text-xs text-[#64748d]">
                    Terhubung dengan Evolution API. Orang tua menerima notifikasi instan tanpa perlu install aplikasi.
                  </p>

                  <div className="mt-4 space-y-2.5 text-xs">
                    <div className="rounded-lg bg-white p-3 border border-[#e3e8ee]">
                      <div className="font-semibold text-[#0d253d]">Presensi Harian</div>
                      <div className="text-[11px] text-[#64748d]">Kirim otomatis saat siswa tap kartu / check-in</div>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-[#e3e8ee]">
                      <div className="font-semibold text-[#0d253d]">Kuitansi SPP</div>
                      <div className="text-[11px] text-[#64748d]">PDF kuitansi resmi langsung ke nomor ortu</div>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-[#e3e8ee]">
                      <div className="font-semibold text-[#0d253d]">Mutaba&apos;ah & Tahfidz</div>
                      <div className="text-[11px] text-[#64748d]">Laporan setoran juz & surah mingguan</div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 rounded-xl border border-[#25d366]/20 bg-[#efeae2] p-4">
                  {/* WA Header */}
                  <div className="flex items-center gap-2.5 rounded-t-lg bg-[#075e54] p-3 text-white">
                    <Avatar className="h-8 w-8 rounded-full bg-white text-[#075e54] font-bold text-xs">
                      <AvatarFallback>SR</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <span>LMS Rahmaniyah Al-Islamy (Bot)</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#25d366] fill-white" />
                      </div>
                      <div className="text-[10px] text-white/80">Akun WhatsApp Bisnis Terverifikasi</div>
                    </div>
                  </div>

                  {/* WA Messages */}
                  <div className="space-y-3 p-3 text-xs">
                    <div className="max-w-[85%] rounded-lg rounded-tl-none bg-white p-3 text-[#0d253d] shadow-sm">
                      <p className="font-semibold text-[#075e54]">Notifikasi Presensi Sekolah</p>
                      <p className="mt-1">
                        Assalamu&apos;alaikum Bpk/Ibu, ananda <strong>Ahmad Fajar (XII RPL 1)</strong> telah
                        melakukan presensi MASUK di sekolah pada pukul <strong>06:48 WIB</strong> (Tepat Waktu).
                      </p>
                      <p className="mt-1 text-[10px] text-right text-[#64748d]">06:48 ✓✓</p>
                    </div>

                    <div className="max-w-[85%] rounded-lg rounded-tl-none bg-white p-3 text-[#0d253d] shadow-sm">
                      <p className="font-semibold text-[#075e54]">Bukti Pembayaran SPP Online</p>
                      <p className="mt-1">
                        Terima kasih, pembayaran SPP Bulan September sebesar <strong>Rp 450.000</strong> telah
                        berhasil diverifikasi via <strong>Virtual Account BCA</strong>.
                      </p>
                      <p className="mt-2 text-[#533afd] font-medium underline">
                        Unduh Kuitansi PDF Resmi (#INV-2026-0909)
                      </p>
                      <p className="mt-1 text-[10px] text-right text-[#64748d]">08:15 ✓✓</p>
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
