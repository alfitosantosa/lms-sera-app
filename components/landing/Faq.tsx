"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Faq() {
  const faqs = [
    {
      q: "Apakah data antar sekolah dalam satu yayasan bisa saling bercampur?",
      a: "Tidak sama sekali. Setiap unit sekolah memiliki tenantId unik yang diisolasi ketat di tingkat database dan ORM query middleware. Super Admin Yayasan dapat melihat rekapitulasi konsolidasi, namun guru dan staf administrasi masing-masing sekolah hanya memiliki hak akses ke data unit sekolahnya sendiri.",
    },
    {
      q: "Bagaimana proses pembayaran SPP online terhubung ke rekening sekolah?",
      a: "Sera terintegrasi resmi dengan Midtrans Payment Gateway. Sekolah dapat menghubungkan rekening kas bank yayasan (BCA, Mandiri, BRI, BNI, BSI). Saat orang tua membayar melalui Virtual Account atau QRIS, dana langsung diteruskan ke rekening sekolah dan status tagihan otomatis lunas dalam hitungan detik tanpa bukti transfer fisik.",
    },
    {
      q: "Apakah orang tua siswa wajib mengunduh aplikasi khusus?",
      a: "Tidak wajib. Portal orang tua dapat diakses langsung melalui browser ponsel pintar tanpa instalasi (PWA-ready). Selain itu, semua pemberitahuan mendesak seperti jam presensi masuk/pulang, alert pelanggaran, dan kuitansi pembayaran SPP dikirimkan secara otomatis ke nomor WhatsApp orang tua.",
    },
    {
      q: "Berapa lama waktu yang dibutuhkan untuk migrasi data dari format Excel/spreadsheet lama?",
      a: "Umumnya hanya memakan waktu 1 hari kerja. Tim teknis Sera menyediakan template impor data master siswa, guru, rombongan belajar, dan saldo tunggakan SPP. Kami juga siap membantu proses pemindahan data hingga tuntas tanpa biaya tambahan.",
    },
    {
      q: "Apakah modul E-Rapor sudah sesuai dengan Kurikulum Merdeka terbaru?",
      a: "Ya. Format penilaian dan cetak rapor di Sera telah sepenuhnya disesuaikan dengan panduan asesmen Kurikulum Merdeka Kementerian Pendidikan (mencakup Tujuan Pembelajaran, Capaian Pembelajaran, penilaian sumatif/formatif, dan Projek Penguatan Profil Pelajar Pancasila / P5).",
    },
    {
      q: "Bagaimana jika sekolah kami membutuhkan fitur khusus atau kustomisasi alur kerja?",
      a: "Untuk yayasan dan sekolah dengan kebutuhan spesifik, paket Enterprise Yayasan menyediakan opsi kustomisasi alur kerja, integrasi API khusus, serta dedicated cloud instance yang dapat disesuaikan dengan SOP yayasan Anda.",
    },
  ];

  return (
    <section id="faq" className="bg-secondary border-border border-t py-24">
      <div className="mx-auto max-w-3xl px-6">
        {/* Section Header */}
        <div className="text-center">
          <span className="bg-primary/10 text-primary inline-block rounded-full px-3.5 py-1 text-xs font-semibold">
            Pertanyaan Umum (FAQ)
          </span>
          <h2 className="text-foreground mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Semua yang perlu Anda ketahui sebelum mulai.
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            Jawaban atas pertanyaan umum seputar migrasi data, keamanan
            multi-tenant, dan integrasi penagihan SPP.
          </p>
        </div>

        {/* Accordion List */}
        <div className="mt-12">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="border-border bg-background data-[state=open]:border-primary/40 rounded-xl border px-5 shadow-xs transition-colors data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="text-foreground hover:text-primary py-4 text-left text-sm font-bold hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 text-xs leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
