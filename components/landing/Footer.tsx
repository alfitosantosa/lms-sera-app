
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-border bg-background text-secondary-foreground border-t px-6 pt-16 pb-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 pb-12 sm:grid-cols-5">
          {/* Brand Info & Live System Status */}
          <div className="col-span-2 space-y-4">
            <Link
              href="/"
              className="text-foreground flex items-center gap-2 text-xl font-bold tracking-tight"
            >
              <span className="bg-primary h-3 w-3 rounded-full" />
              <span>Sera</span>
              <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-[10px] font-bold">
                LMS Yayasan
              </span>
            </Link>

            <p className="text-muted-foreground max-w-xs text-xs leading-relaxed">
              Platform LMS &amp; ERP sekolah multi-tenant terpadu untuk yayasan
              pendidikan di Indonesia. Dikembangkan oleh PT Santosa Tech
              Indonesia.
            </p>

            {/* Live Status Pill */}
            <div className="border-border bg-secondary text-secondary-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium">
              <span className="relative flex h-2 w-2">
                <span className="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                <span className="bg-success relative inline-flex h-2 w-2 rounded-full" />
              </span>
              <span>Semua Sistem Beroperasi Normal</span>
              <span className="text-muted-foreground">(99.9% Uptime)</span>
            </div>
          </div>

          {/* Column: Produk */}
          <div>
            <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
              Produk
            </h4>
            <ul className="text-muted-foreground mt-4 space-y-2.5 text-xs">
              <li>
                <a
                  href="#fitur"
                  className="hover:text-primary transition-colors"
                >
                  Presensi &amp; Disiplin
                </a>
              </li>
              <li>
                <a
                  href="#fitur"
                  className="hover:text-primary transition-colors"
                >
                  E-Rapor Merdeka
                </a>
              </li>
              <li>
                <a
                  href="#keuangan"
                  className="hover:text-primary transition-colors"
                >
                  SPP Online Midtrans
                </a>
              </li>
              <li>
                <a
                  href="#fitur"
                  className="hover:text-primary transition-colors"
                >
                  Portal Orang Tua
                </a>
              </li>
              <li>
                <a
                  href="#fitur"
                  className="hover:text-primary transition-colors"
                >
                  Tahfidz Al-Qur&apos;an
                </a>
              </li>
              <li>
                <a
                  href="#fitur"
                  className="hover:text-primary transition-colors"
                >
                  Bot WhatsApp Otomatis
                </a>
              </li>
            </ul>
          </div>

          {/* Column: Arsitektur */}
          <div>
            <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
              Solusi
            </h4>
            <ul className="text-muted-foreground mt-4 space-y-2.5 text-xs">
              <li>
                <a
                  href="#arsitektur"
                  className="hover:text-primary transition-colors"
                >
                  Multi-Tenant Yayasan
                </a>
              </li>
              <li>
                <a
                  href="#arsitektur"
                  className="hover:text-primary transition-colors"
                >
                  Hierarki Hak Akses (RBAC)
                </a>
              </li>
              <li>
                <a
                  href="#keuangan"
                  className="hover:text-primary transition-colors"
                >
                  Rekonsiliasi Kas Otomatis
                </a>
              </li>
              <li>
                <a
                  href="#arsitektur"
                  className="hover:text-primary transition-colors"
                >
                  Keamanan &amp; Enkripsi Data
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-primary transition-colors">
                  Bantuan Migrasi Spreadsheet
                </a>
              </li>
            </ul>
          </div>

          {/* Column: Perusahaan & Legal */}
          <div>
            <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
              Perusahaan
            </h4>
            <ul className="text-muted-foreground mt-4 space-y-2.5 text-xs">
              <li>
                <Link
                  href="/landing/register/foundation"
                  className="hover:text-primary transition-colors"
                >
                  Daftar Akun Yayasan
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/sign-in"
                  className="hover:text-primary transition-colors"
                >
                  Masuk ke Akun
                </Link>
              </li>
              <li>
                <a
                  href="#harga"
                  className="hover:text-primary transition-colors"
                >
                  Paket &amp; Investasi
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-primary transition-colors">
                  Pusat Bantuan &amp; FAQ
                </a>
              </li>
              <li>
                <span className="text-muted-foreground">Kebijakan Privasi</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Bottom Attribution */}
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
