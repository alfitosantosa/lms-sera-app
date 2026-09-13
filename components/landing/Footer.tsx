import * as React from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background px-6 pt-16 pb-12 text-secondary-foreground">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 pb-12 sm:grid-cols-5">
          {/* Brand Info & Live System Status */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <span className="h-3 w-3 rounded-full bg-primary" />
              <span>Sera</span>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                LMS Yayasan
              </span>
            </Link>

            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
              Platform LMS &amp; ERP sekolah multi-tenant terpadu untuk yayasan pendidikan di Indonesia.
              Dikembangkan oleh PT Santosa Tech Indonesia.
            </p>

            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-[11px] font-medium text-secondary-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <span>Semua Sistem Beroperasi Normal</span>
              <span className="text-muted-foreground">(99.9% Uptime)</span>
            </div>
          </div>

          {/* Column: Produk */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Produk</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-muted-foreground">
              <li>
                <a href="#fitur" className="hover:text-primary transition-colors">
                  Presensi &amp; Disiplin
                </a>
              </li>
              <li>
                <a href="#fitur" className="hover:text-primary transition-colors">
                  E-Rapor Merdeka
                </a>
              </li>
              <li>
                <a href="#keuangan" className="hover:text-primary transition-colors">
                  SPP Online Midtrans
                </a>
              </li>
              <li>
                <a href="#fitur" className="hover:text-primary transition-colors">
                  Portal Orang Tua
                </a>
              </li>
              <li>
                <a href="#fitur" className="hover:text-primary transition-colors">
                  Tahfidz Al-Qur&apos;an
                </a>
              </li>
              <li>
                <a href="#fitur" className="hover:text-primary transition-colors">
                  Bot WhatsApp Otomatis
                </a>
              </li>
            </ul>
          </div>

          {/* Column: Arsitektur */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Solusi</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-muted-foreground">
              <li>
                <a href="#arsitektur" className="hover:text-primary transition-colors">
                  Multi-Tenant Yayasan
                </a>
              </li>
              <li>
                <a href="#arsitektur" className="hover:text-primary transition-colors">
                  Hierarki Hak Akses (RBAC)
                </a>
              </li>
              <li>
                <a href="#keuangan" className="hover:text-primary transition-colors">
                  Rekonsiliasi Kas Otomatis
                </a>
              </li>
              <li>
                <a href="#arsitektur" className="hover:text-primary transition-colors">
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Perusahaan</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link href="/landing/register/foundation" className="hover:text-primary transition-colors">
                  Daftar Akun Yayasan
                </Link>
              </li>
              <li>
                <Link href="/auth/sign-in" className="hover:text-primary transition-colors">
                  Masuk ke Akun
                </Link>
              </li>
              <li>
                <a href="#harga" className="hover:text-primary transition-colors">
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
        <div className="flex flex-col items-center justify-between gap-3 pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>
            &copy; {currentYear} PT Santosa Tech Indonesia (Persero). Seluruh hak cipta dilindungi.
          </span>
          <span>Dibuat khusus untuk Yayasan Pendidikan Rahmaniyah Al-Islamy &amp; Sekolah Modern.</span>
        </div>
      </div>
    </footer>
  );
}
