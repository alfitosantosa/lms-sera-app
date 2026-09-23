"use client";


import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ArrowRight,
  CreditCard,
  Receipt,
  Wallet,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function FinanceSection() {
  const router = useRouter();

  const handleRegisterFoundation = () => {
    router.push("/landing/register/foundation");
  };

  const benefits = [
    "Virtual Account BCA, Mandiri, BRI, BSI & QRIS otomatis per siswa via Midtrans",
    "Rekonsiliasi pembayaran instan tanpa perlu cek mutasi bank manual",
    "Penerbitan kuitansi PDF resmi otomatis ber-QR code verifikasi",
    "Pengingat jatuh tempo otomatis via WhatsApp langsung ke ponsel orang tua",
    "Pemisahan alokasi dana SPP, uang gedung, seragam, dan ujian per rekening",
  ];

  return (
    <section
      id="keuangan"
      className="border-border border-y bg-[#faf7f2] py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Column (Content) */}
          <div className="space-y-6 lg:col-span-7">
            <span className="inline-block rounded-full bg-[#9b6829]/10 px-3.5 py-1 text-xs font-semibold text-[#9b6829]">
              Keuangan &amp; Administrasi SPP
            </span>

            <h2 className="text-foreground text-3xl leading-[1.18] font-extrabold tracking-tight sm:text-4xl">
              Tunggakan SPP yang biasanya tersembunyi di spreadsheet, kini
              terpantau real-time.
            </h2>

            <p className="text-foreground/80 text-base leading-relaxed">
              Setiap transaksi pembayaran online dari payment gateway Midtrans
              langsung terekonsiliasi ke rekening kas sekolah dan kartu SPP
              siswa. Bendahara tidak lagi menghabiskan waktu berjam-jam
              mencocokkan mutasi bank secara manual.
            </p>

            <ul className="space-y-3 pt-2">
              {benefits.map((benefit, idx) => (
                <li
                  key={idx}
                  className="text-secondary-foreground flex items-start gap-3 text-sm"
                >
                  <CheckCircle2 className="text-success h-5 w-5 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="pt-3">
              <Button
                onClick={handleRegisterFoundation}
                className="group bg-primary hover:bg-primary-hover rounded-full px-7 py-5 font-semibold text-white shadow-sm"
              >
                <span>Mulai Kelola SPP Sekolah</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>

          {/* Right Column (Card Metric) */}
          <div className="lg:col-span-5">
            <Card className="border-border bg-background rounded-2xl border p-6 shadow-[0_12px_32px_rgba(13,37,61,0.06)]">
              <CardContent className="space-y-4 p-0">
                <div className="border-border flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="text-primary h-4 w-4" />
                    <span className="text-foreground text-xs font-bold">
                      Rekap Keuangan Yayasan Bulan Berjalan
                    </span>
                  </div>
                  <span className="text-success bg-success-chip rounded-full px-2 py-0.5 text-[10px] font-semibold">
                    Sinkron Midtrans
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      label: "Total Terbayar",
                      value: "Rp 1.802.300.000",
                      color: "text-success",
                    },
                    {
                      label: "Sisa Tunggakan",
                      value: "Rp 98.500.000",
                      color: "text-[#ea2261]",
                    },
                    {
                      label: "Collection Rate SPP",
                      value: "94.8%",
                      color: "text-primary",
                    },
                    {
                      label: "Kuitansi PDF Terbit",
                      value: "1.248 Dokumen",
                      color: "text-foreground",
                    },
                    {
                      label: "Rekening Bank Terhubung",
                      value: "12 Rekening Kas",
                      color: "text-foreground",
                    },
                  ].map((row, idx) => (
                    <div
                      key={idx}
                      className="bg-secondary flex items-center justify-between rounded-lg p-3 text-xs"
                    >
                      <span className="text-muted-foreground">{row.label}</span>
                      <span
                        className={`[font-feature-settings:'tnum'_1] text-sm font-bold ${row.color}`}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-muted-foreground pt-2 text-center text-[11px]">
                  Mendukung Bank BCA, Mandiri, BRI, BNI, BSI, dan QRIS Nasional
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Flow Diagram */}
        <div className="border-border bg-background mt-14 rounded-2xl border p-6 sm:p-8">
          <div className="text-center">
            <h3 className="text-foreground text-xl font-bold sm:text-2xl">
              Alur Pembayaran SPP Online
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Dari tagihan terbit sampai kuitansi diterima orang tua — semuanya
              otomatis.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                icon: Receipt,
                title: "Tagihan Terbit",
                desc: "Tagihan SPP dibuat otomatis & notif WhatsApp terkirim ke orang tua",
              },
              {
                icon: Wallet,
                title: "Bayar Online",
                desc: "Orang tua membayar via Virtual Account atau QRIS bank pilihan",
              },
              {
                icon: CreditCard,
                title: "Verifikasi Midtrans",
                desc: "Payment gateway Midtrans memverifikasi pembayaran secara resmi",
              },
              {
                icon: CheckCircle2,
                title: "Tercatat Lunas",
                desc: "Sistem mencatat lunas otomatis & memperbarui rekap kas yayasan",
              },
              {
                icon: QrCode,
                title: "Kuitansi PDF",
                desc: "Kuitansi resmi ber-QR code terbit & terkirim ke WhatsApp orang tua",
              },
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="border-border bg-secondary/40 flex h-full flex-col items-center rounded-xl border p-4 text-center">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="text-foreground mt-3 text-xs font-bold">
                    <span className="text-primary mr-1">{idx + 1}.</span>
                    {step.title}
                  </div>
                  <p className="text-muted-foreground mt-1.5 text-[11px] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                {idx < 4 && (
                  <ArrowRight className="text-muted-foreground/50 absolute top-1/2 -right-3 hidden h-5 w-5 -translate-y-1/2 lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
