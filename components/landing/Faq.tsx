"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Faq() {
  const faqs = [
    {
      q: "Bagaimana data antar sekolah di dalam satu yayasan dipisah?",
      a: "Data melekat pada cabang, bukan pada satu kolam bersama. Yayasan terdaftar sebagai satu Foundation, dan setiap unit sekolah — SMP, SMA, SMK IT — adalah Branch dengan branchId sendiri. Setiap pengguna terdaftar pada satu cabang, sehingga guru, bendahara, dan orang tua hanya bekerja di data cabangnya. Rekening kas pun dicatat per cabang, jadi dana tiap unit tidak bercampur.",
    },
    {
      q: "Apakah kami bisa menambah cabang baru?",
      a: "Bisa. Cabang baru didaftarkan di bawah yayasan yang sama dan langsung memakai modul yang sama, dengan data yang berdiri sendiri sejak baris pertama. Kode yayasan yang dipakai saat pendaftaran memastikan pengguna baru masuk ke yayasan yang benar, bukan ke yayasan lain.",
    },
    {
      q: "Bagaimana SPP online dan verifikasi transfer manual?",
      a: "Setiap jenis pembayaran — bulanan maupun sekali bayar — punya nominalnya sendiri per cabang, dan tagihan tercatat per siswa per bulan. Orang tua dapat membayar daring lewat Midtrans (Snap maupun Core API), dan pembayaran yang berhasil langsung memperbarui status tagihan. Untuk transfer manual, bendahara mencatat referensi bank, tanggal transfer, dan status pembayaran, lalu kuitansi PDF bernomor diterbitkan dari sistem.",
    },
    {
      q: "Bagaimana tahfidz dicatat?",
      a: "Setoran hafalan disimpan per surah dengan ayat awal dan ayat akhir serta nilai A–E, sehingga capaian tiap siswa dapat dilihat urut. Siswa dibagi ke kelompok tahfidz, dan daftar surah sudah tersedia lengkap — nama Arab, nama latin, jumlah ayat, dan tempat turun — jadi guru tidak perlu menyusun acuan sendiri.",
    },
    {
      q: "Siapa saja yang bisa mengakses sistem?",
      a: "Ada lima peran: admin, bendahara, guru, siswa, dan orang tua. Setiap akun melekat pada satu cabang dan satu peran, jadi yang tampil di layar mengikuti keduanya. Admin mengelola data cabang, bendahara mengurus tagihan dan pembayaran, guru mengisi presensi, nilai, dan setoran hafalan, sementara siswa dan orang tua melihat data yang bersangkutan dengan dirinya.",
    },
    {
      q: "Bagaimana impor data lama dari Excel?",
      a: "Tersedia impor massal dari berkas Excel untuk data master seperti siswa, guru, dan kelas. Berkas diunggah lalu dibaca langsung oleh sistem, sehingga data lama tidak perlu diketik ulang satu per satu, dan setelah masuk data tersebut mengikuti struktur yayasan serta cabang yang sudah didaftarkan.",
    },
  ];

  return (
    <section id="faq" className="border-border bg-secondary border-t py-24">
      <div className="mx-auto max-w-3xl px-6">
        {/* Section Header */}
        <div className="border-margin border-l-2 pl-6">
          <h2 className="font-display text-foreground text-3xl tracking-tight">
            Pertanyaan yang muncul sebelum data dipindahkan.
          </h2>
          <p className="text-secondary-foreground mt-3 max-w-[68ch] text-base leading-relaxed">
            Enam hal yang paling sering ditanyakan yayasan: pemisahan data antar
            unit, penambahan cabang, pembayaran SPP, pencatatan tahfidz, hak
            akses, dan impor data lama.
          </p>
        </div>

        {/* Register of questions */}
        <div className="border-border mt-12 border-b">
          <Accordion type="single" collapsible>
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="border-border odd:bg-accent/60 border-t px-5 md:px-6"
              >
                <AccordionTrigger className="text-foreground hover:text-brand-accent py-5 text-left text-sm font-medium hover:underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-secondary-foreground pb-5 text-sm leading-relaxed">
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
