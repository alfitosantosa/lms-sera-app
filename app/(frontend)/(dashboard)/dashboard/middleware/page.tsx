"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  Info,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";

export default function MiddlewarePage() {
  return (
    <div className="from-muted/40 to-info-surface flex min-h-[calc(100vh-80px)] items-center justify-center bg-linear-to-br px-4 py-10">
      <div className="w-full max-w-4xl space-y-6">
        {/* Main Alert */}
        <Alert variant="destructive" className="border-destructive/50">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">
            Akses Ditolak
          </AlertTitle>
          <AlertDescription>
            Halaman ini tidak termasuk dalam daftar izin (permissions) untuk
            role Anda. Sistem middleware membatasi akses berdasarkan konfigurasi
            role &amp; permissions.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Information */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="text-destructive h-5 w-5" />
                  Kenapa Saya Melihat Halaman Ini?
                </CardTitle>
                <CardDescription>
                  Alasan mengapa akses Anda dibatasi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">•</span>
                    <span>
                      URL ini tidak ada di daftar{" "}
                      <span className="text-foreground font-medium">
                        role.permissions
                      </span>{" "}
                      Anda.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">•</span>
                    <span>Anda mencoba mengakses halaman milik role lain.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">•</span>
                    <span>
                      Admin belum memberikan izin ke menu ini untuk role Anda.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="text-info h-5 w-5" />
                  Apa yang Bisa Anda Lakukan?
                </CardTitle>
                <CardDescription>
                  Langkah-langkah yang dapat Anda ambil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-info mt-1">•</span>
                    <span>Kembali ke dashboard utama sesuai role Anda.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-info mt-1">•</span>
                    <span>
                      Hubungi admin jika Anda merasa seharusnya punya akses.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-info mt-1">•</span>
                    <span>Pastikan Anda login dengan akun yang benar.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
                <CardDescription>
                  Navigasi cepat ke halaman yang dapat diakses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard" className="block">
                  <Button size="lg" className="w-full justify-center gap-2">
                    <Home className="h-4 w-4" />
                    Kembali ke Dashboard
                  </Button>
                </Link>

                <Link href="/" className="block">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Halaman Utama
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Butuh Bantuan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Jika Anda yakin ini adalah kesalahan, sampaikan ke
                  administrator sistem dan sertakan{" "}
                  <span className="text-foreground font-medium">
                    email &amp; role
                  </span>{" "}
                  Anda untuk pengecekan konfigurasi permissions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <p className="text-muted-foreground text-center text-xs">
          Middleware access control • Dibangun untuk menjaga keamanan dan
          ketertiban akses setiap role di sistem sekolah.
        </p>
      </div>
    </div>
  );
}
