"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Pricing() {
  const [isAnnual, setIsAnnual] = React.useState(true);
  const router = useRouter();

  const handleSelectPlan = () => {
    router.push("/landing/register/foundation");
  };

  const plans = [
    {
      name: "Starter",
      desc: "Untuk sekolah mandiri yang baru mulai merapikan operasional harian dan presensi.",
      monthlyPrice: "Rp 3.000",
      annualPrice: "Rp 2.400",
      unit: "per siswa / bulan",
      featured: false,
      features: [
        "Presensi siswa & guru harian",
        "Pencatatan pelanggaran & poin kedisiplinan",
        "Portal web mobile untuk orang tua",
        "Pencatatan nilai tugas & raport dasar",
        "Akun guru dan staf tanpa batas",
        "Dukungan teknis via WhatsApp & Email",
      ],
      cta: "Mulai Paket Starter",
    },
    {
      name: "Pro",
      desc: "Solusi lengkap untuk sekolah modern dengan e-rapor, SPP online, dan notifikasi WhatsApp.",
      monthlyPrice: "Rp 4.000",
      annualPrice: "Rp 3.200",
      unit: "per siswa / bulan",
      featured: true,
      features: [
        "Semua fitur di paket Starter",
        "E-Rapor Kurikulum Merdeka siap cetak",
        "Payment gateway Midtrans (VA BCA/Mandiri/BRI/BSI, QRIS)",
        "Notifikasi WhatsApp otomatis via Evolution API",
        "Modul Tahfidz Al-Qur'an & Mutaba'ah yaumiyah",
        "Bank soal & Ujian online CBT",
        "Bantuan migrasi data spreadsheet tanpa biaya",
        "Dukungan teknis prioritas 7 hari kerja",
      ],
      cta: "Pilih Paket Pro",
    },
    {
      name: "Enterprise Yayasan",
      desc: "Dirancang khusus untuk yayasan pendidikan yang mengelola banyak unit sekolah sekaligus.",
      monthlyPrice: "Kustom",
      annualPrice: "Kustom",
      unit: "disesuaikan skala unit yayasan",
      featured: false,
      features: [
        "Semua fitur di paket Pro",
        "Multi-sekolah dalam satu dasbor pusat yayasan",
        "Laporan konsolidasi keuangan seluruh unit sekolah",
        "Isolasi data multi-tenant tingkat database",
        "Dedicated cloud instance & backup berkala",
        "Pelatihan langsung untuk guru & staf administrasi",
        "Dedicated Account Manager khusus yayasan",
        "SLA ketersediaan sistem 99.9%",
      ],
      cta: "Hubungi Tim Yayasan",
    },
  ];

  return (
    <section id="harga" className="py-24 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-[#533afd]/10 px-3.5 py-1 text-xs font-semibold text-[#533afd]">
            Paket &amp; Investasi
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#0d253d] sm:text-4xl">
            Harga transparan yang tumbuh bersama skala sekolah Anda.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[#64748d]">
            Dihitung per siswa aktif per bulan. Tanpa biaya lisensi server tersembunyi, dan Anda
            bebas mengupgrade paket kapan saja.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#e3e8ee] bg-[#f6f9fc] p-1.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`rounded-full px-4 py-2 transition-all ${
                !isAnnual
                  ? "bg-white text-[#0d253d] font-bold shadow-xs"
                  : "text-[#64748d] hover:text-[#0d253d]"
              }`}
            >
              Tagihan Bulanan
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 transition-all ${
                isAnnual
                  ? "bg-[#533afd] text-white font-bold shadow-xs"
                  : "text-[#64748d] hover:text-[#0d253d]"
              }`}
            >
              <span>Tagihan Tahunan</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
                Hemat 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-stretch">
          {plans.map((p, idx) => {
            const price = isAnnual ? p.annualPrice : p.monthlyPrice;

            return (
              <Card
                key={idx}
                className={`relative flex flex-col justify-between rounded-2xl p-7 transition-all duration-300 ${
                  p.featured
                    ? "border-2 border-[#533afd] bg-[#0a2540] text-white shadow-xl lg:-translate-y-2"
                    : "border border-[#e3e8ee] bg-white text-[#0d253d] hover:border-[#533afd]/30 hover:shadow-lg"
                }`}
              >
                {p.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="border-none bg-[#533afd] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                      <Sparkles className="mr-1 h-3 w-3" /> Paling Populer
                    </Badge>
                  </div>
                )}

                <CardContent className="flex flex-1 flex-col p-0">
                  <div className="text-xl font-extrabold">{p.name}</div>
                  <p
                    className={`mt-2 min-h-[44px] text-xs leading-relaxed ${
                      p.featured ? "text-[#adbdcc]" : "text-[#64748d]"
                    }`}
                  >
                    {p.desc}
                  </p>

                  <div className="my-6 border-y border-dashed border-[#e3e8ee]/40 py-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black [font-feature-settings:'tnum'_1]">
                        {price}
                      </span>
                    </div>
                    <div
                      className={`mt-1 text-xs ${
                        p.featured ? "text-[#adbdcc]" : "text-[#64748d]"
                      }`}
                    >
                      {p.unit}
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="mb-8 flex-1 space-y-3 text-xs">
                    {p.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                            p.featured ? "text-[#00d4ff]" : "text-[#533afd]"
                          }`}
                        />
                        <span className={p.featured ? "text-[#f6f9fc]" : "text-[#273951]"}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={handleSelectPlan}
                    className={`w-full rounded-full py-5 text-sm font-semibold transition-all ${
                      p.featured
                        ? "bg-[#533afd] text-white shadow-md hover:bg-[#4434d4]"
                        : "border border-[#533afd] bg-white text-[#533afd] hover:bg-[#533afd]/10"
                    }`}
                  >
                    {p.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
