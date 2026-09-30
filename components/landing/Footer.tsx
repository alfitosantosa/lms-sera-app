import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const LINK_COLUMNS = [
  {
    title: "Modul",
    links: [
      { label: "Presensi & Disiplin", href: "#fitur" },
      { label: "E-Rapor", href: "#fitur" },
      { label: "Tahfidz Al-Qur'an", href: "#fitur" },
      { label: "Penilaian Perkembangan", href: "#fitur" },
      { label: "Bot WhatsApp Orang Tua", href: "#fitur" },
    ],
  },
  {
    title: "Keuangan",
    links: [
      { label: "SPP online (Midtrans)", href: "#keuangan" },
      { label: "Tagihan bulanan & lainnya", href: "#keuangan" },
      { label: "Kas per cabang", href: "#keuangan" },
      { label: "Kuitansi PDF", href: "#keuangan" },
    ],
  },
  {
    title: "Arsitektur",
    links: [
      { label: "Multi-cabang dalam satu yayasan", href: "#arsitektur" },
      { label: "Peran & hak akses", href: "#arsitektur" },
      { label: "Import data Excel", href: "#arsitektur" },
    ],
  },
  {
    title: "Cakupan",
    links: [
      { label: "Cakupan modul", href: "#cakupan" },
      { label: "Cakupan cabang SMP, SMA, SMK IT", href: "#arsitektur" },
      { label: "Pertanyaan umum", href: "#faq" },
    ],
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-border bg-background text-secondary-foreground border-t px-6 pt-16 pb-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 pb-12 sm:grid-cols-6">
          {/* Register masthead */}
          <div className="col-span-2 space-y-4">
            <Link
              href="/"
              className="text-foreground font-display flex items-center gap-2 text-xl tracking-tight"
            >
              <span className="bg-primary h-3 w-3 rounded-[1px]" />
              <span>Sera</span>
              <span className="border-border text-muted-foreground rounded-sm border px-1.5 py-0.5 text-[10px]">
                Register sekolah
              </span>
            </Link>

            <p className="text-muted-foreground max-w-xs text-xs leading-relaxed">
              Sistem informasi sekolah untuk yayasan pendidikan di Indonesia.
              Presensi, rapor, tahfidz, dan pembayaran SPP dalam satu catatan.
              Dikembangkan oleh PT Santosa Tech Indonesia.
            </p>

            <ul className="text-muted-foreground space-y-1.5 text-xs">
              <li>51 tabel data terintegrasi</li>
              <li>Isolasi data per yayasan dan cabang</li>
              <li>SMP, SMA, dan SMK IT dalam satu yayasan</li>
            </ul>
          </div>

          {LINK_COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="border-border font-display text-foreground border-t-2 pt-3 text-[11px] tracking-wide">
                {column.title}
              </h4>
              <ul className="text-muted-foreground mt-4 space-y-2.5 text-xs">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="hover:text-primary inline-block py-1 transition-colors hover:underline hover:underline-offset-4"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="bg-border" />

        {/* Bottom attribution */}
        <div className="text-muted-foreground flex flex-col items-center justify-between gap-3 pt-6 text-xs sm:flex-row">
          <span>
            &copy; {currentYear} PT Santosa Tech Indonesia (Persero). Seluruh
            hak cipta dilindungi.
          </span>
          <span>Dibuat khusus untuk Yayasan &amp; Sekolah Modern.</span>
        </div>
      </div>
    </footer>
  );
}
