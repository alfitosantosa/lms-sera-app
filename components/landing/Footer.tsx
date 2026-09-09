import * as React from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#e3e8ee] bg-white px-6 pt-16 pb-12 text-[#273951]">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 pb-12 sm:grid-cols-5">
          {/* Brand Info & Live System Status */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-[#0d253d]">
              <span className="h-3 w-3 rounded-full bg-[#533afd]" />
              <span>Sera</span>
              <span className="rounded bg-[#533afd]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#533afd]">
                LMS Yayasan
              </span>
            </Link>

            <p className="max-w-xs text-xs leading-relaxed text-[#64748d]">
              Platform LMS &amp; ERP sekolah multi-tenant terpadu untuk yayasan pendidikan di Indonesia.
              Dikembangkan oleh PT Santosa Tech Indonesia.
            </p>

            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e3e8ee] bg-[#f6f9fc] px-3 py-1.5 text-[11px] font-medium text-[#273951]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0a7a4a] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0a7a4a]" />
              </span>
              <span>Semua Sistem Beroperasi Normal</span>
              <span className="text-[#64748d]">(99.9% Uptime)</span>
            </div>
          </div>

          {/* Column: Produk */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0d253d]">Produk</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-[#64748d]">
              <li>
                <a href="#fitur" className="hover:text-[#533afd] transition-colors">
                  Presensi &amp; Disiplin
                </a>
              </li>
              <li>
                <a href="#fitur" className="hover:text-[#533afd] transition-colors">
                  E-Rapor Merdeka
                </a>
              </li>
              <li>
                <a href="#keuangan" className="hover:text-[#533afd] transition-colors">
                  SPP Online Midtrans
                </a>
              </li>
              <li>
                <a href="#fitur" className="hover:text-[#533afd] transition-colors">
                  Portal Orang Tua
                </a>
              </li>
              <li>
                <a href="#fitur" className="hover:text-[#533afd] transition-colors">
                  Tahfidz Al-Qur&apos;an
                </a>
              </li>
              <li>
                <a href="#fitur" className="hover:text-[#533afd] transition-colors">
                  Bot WhatsApp Otomatis
                </a>
              </li>
            </ul>
          </div>

          {/* Column: Arsitektur */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0d253d]">Solusi</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-[#64748d]">
              <li>
                <a href="#arsitektur" className="hover:text-[#533afd] transition-colors">
                  Multi-Tenant Yayasan
                </a>
              </li>
              <li>
                <a href="#arsitektur" className="hover:text-[#533afd] transition-colors">
                  Hierarki Hak Akses (RBAC)
                </a>
              </li>
              <li>
                <a href="#keuangan" className="hover:text-[#533afd] transition-colors">
                  Rekonsiliasi Kas Otomatis
                </a>
              </li>
              <li>
                <a href="#arsitektur" className="hover:text-[#533afd] transition-colors">
                  Keamanan &amp; Enkripsi Data
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#533afd] transition-colors">
                  Bantuan Migrasi Spreadsheet
                </a>
              </li>
            </ul>
          </div>

          {/* Column: Perusahaan & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0d253d]">Perusahaan</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-[#64748d]">
              <li>
                <Link href="/landing/register/foundation" className="hover:text-[#533afd] transition-colors">
                  Daftar Akun Yayasan
                </Link>
              </li>
              <li>
                <Link href="/auth/sign-in" className="hover:text-[#533afd] transition-colors">
                  Masuk ke Akun
                </Link>
              </li>
              <li>
                <a href="#harga" className="hover:text-[#533afd] transition-colors">
                  Paket &amp; Investasi
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#533afd] transition-colors">
                  Pusat Bantuan &amp; FAQ
                </a>
              </li>
              <li>
                <span className="text-[#64748d]">Kebijakan Privasi</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-[#e3e8ee]" />

        {/* Bottom Attribution */}
        <div className="flex flex-col items-center justify-between gap-3 pt-6 text-xs text-[#64748d] sm:flex-row">
          <span>
            &copy; {currentYear} PT Santosa Tech Indonesia (Persero). Seluruh hak cipta dilindungi.
          </span>
          <span>Dibuat khusus untuk Yayasan Pendidikan Rahmaniyah Al-Islamy &amp; Sekolah Modern.</span>
        </div>
      </div>
    </footer>
  );
}
