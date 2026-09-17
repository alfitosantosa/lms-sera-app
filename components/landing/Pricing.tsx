"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles } from "lucide-react";
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
    <section id="harga" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="bg-primary/10 text-primary inline-block rounded-full px-3.5 py-1 text-xs font-semibold">
            Paket &amp; Investasi
          </span>
          <h2 className="text-foreground mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Harga transparan yang tumbuh bersama skala sekolah Anda.
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            Dihitung per siswa aktif per bulan. Tanpa biaya lisensi server
            tersembunyi, dan Anda bebas mengupgrade paket kapan saja.
          </p>

          {/* Billing Toggle */}
          <div className="border-border bg-secondary mt-8 inline-flex items-center gap-3 rounded-full border p-1.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`rounded-full px-4 py-2 transition-all ${
                !isAnnual
                  ? "bg-background text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tagihan Bulanan
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 transition-all ${
                isAnnual
                  ? "bg-primary font-bold text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
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
                    ? "border-primary bg-navy border-2 text-white shadow-xl lg:-translate-y-2"
                    : "border-border bg-background text-foreground hover:border-primary/30 border hover:shadow-lg"
                }`}
              >
                {p.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary border-none px-3.5 py-1 text-xs font-bold tracking-wider text-white uppercase shadow-sm">
                      <Sparkles className="mr-1 h-3 w-3" /> Paling Populer
                    </Badge>
                  </div>
                )}

                <CardContent className="flex flex-1 flex-col p-0">
                  <div className="text-xl font-extrabold">{p.name}</div>
                  <p
                    className={`mt-2 min-h-[44px] text-xs leading-relaxed ${
                      p.featured ? "text-navy-muted" : "text-muted-foreground"
                    }`}
                  >
                    {p.desc}
                  </p>

                  <div className="border-border/40 my-6 border-y border-dashed py-4">
                    <div className="flex items-baseline gap-1">
                      <span className="[font-feature-settings:'tnum'_1] text-3xl font-black">
                        {price}
                      </span>
                    </div>
                    <div
                      className={`mt-1 text-xs ${
                        p.featured ? "text-navy-muted" : "text-muted-foreground"
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
                            p.featured ? "text-[#00d4ff]" : "text-primary"
                          }`}
                        />
                        <span
                          className={
                            p.featured
                              ? "text-navy-foreground"
                              : "text-secondary-foreground"
                          }
                        >
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={handleSelectPlan}
                    className={`w-full rounded-full py-5 text-sm font-semibold transition-all ${
                      p.featured
                        ? "bg-primary hover:bg-primary-hover text-white shadow-md"
                        : "border-primary bg-background text-primary hover:bg-primary/10 border"
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
