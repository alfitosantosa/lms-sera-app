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
    <section id="faq" className="bg-[#f6f9fc] py-24 border-t border-[#e3e8ee]">
      <div className="mx-auto max-w-3xl px-6">
        {/* Section Header */}
        <div className="text-center">
          <span className="inline-block rounded-full bg-[#533afd]/10 px-3.5 py-1 text-xs font-semibold text-[#533afd]">
            Pertanyaan Umum (FAQ)
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#0d253d] sm:text-4xl">
            Semua yang perlu Anda ketahui sebelum mulai.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[#64748d]">
            Jawaban atas pertanyaan umum seputar migrasi data, keamanan multi-tenant, dan
            integrasi penagihan SPP.
          </p>
        </div>

        {/* Accordion List */}
        <div className="mt-12">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="rounded-xl border border-[#e3e8ee] bg-white px-5 shadow-xs transition-colors data-[state=open]:border-[#533afd]/40 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="text-left text-sm font-bold text-[#0d253d] hover:text-[#533afd] hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs leading-relaxed text-[#64748d] pb-4">
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
