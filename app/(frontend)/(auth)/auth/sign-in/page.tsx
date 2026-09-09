"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { signIn } from "@/lib/authClients";

export default function SignIn() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const router = useRouter();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Silakan masukkan email dan password Anda.");
      return;
    }

    try {
      setLoading(true);
      await signIn.email(
        {
          email,
          password,
          callbackURL: "/dashboard/profile",
        },
        {
          onRequest: () => setLoading(true),
          onResponse: () => setLoading(false),
          onError: (ctx) => {
            setLoading(false);
            toast.error(ctx.error.message || "Gagal masuk. Periksa kembali email dan password Anda.");
          },
          onSuccess: () => {
            setLoading(false);
            toast.success("Berhasil masuk! Mengarahkan ke dasbor...");
            router.push("/dashboard/profile");
          },
        },
      );
    } catch (err: unknown) {
      setLoading(false);
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat masuk";
      toast.error(message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signIn.social(
        {
          provider: "google",
          callbackURL: "/dashboard/profile",
        },
        {
          onRequest: () => setLoading(true),
          onResponse: () => setLoading(false),
          onError: (ctx) => {
            setLoading(false);
            toast.error(ctx.error.message || "Gagal masuk dengan akun Google.");
          },
        },
      );
    } catch (err: unknown) {
      setLoading(false);
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat autentikasi Google";
      toast.error(message);
    }
  };

  const clientName = process.env.NEXT_PUBLIC_CLIENT_NAME || "Yayasan Rahmaniyah Al-Islamy";

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center bg-[#f6f9fc] px-4 py-12 overflow-hidden selection:bg-[#533afd]/20 selection:text-[#533afd]">
      {/* Stripe-style ambient luminous glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        <div className="absolute -left-20 -top-20 h-[450px] w-[500px] rounded-full bg-[#f5e9d4] opacity-80 blur-[100px]" />
        <div className="absolute right-[-10%] top-[-10%] h-[450px] w-[500px] rounded-full bg-[#533afd] opacity-25 blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[20%] h-[400px] w-[480px] rounded-full bg-[#ea2261] opacity-15 blur-[110px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[420px] w-[450px] rounded-full bg-[#b9b9f9] opacity-40 blur-[100px]" />
      </div>

      {/* Floating Back to Home Link */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-[#e3e8ee] bg-white/80 px-3.5 py-1.5 text-xs font-medium text-[#273951] shadow-xs backdrop-blur-md transition-all hover:border-[#533afd]/40 hover:bg-white hover:text-[#533afd]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Brand & School Logo */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Link href="/" className="group inline-flex items-center gap-2.5 mb-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#533afd] opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#533afd]" />
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-[#0d253d] transition-colors group-hover:text-[#533afd]">
              Sera
            </span>
            <span className="rounded-full bg-[#533afd]/10 px-2 py-0.5 text-[10px] font-bold text-[#533afd]">
              LMS
            </span>
          </Link>

          <h1 className="text-lg font-bold text-[#0d253d]">
            {clientName}
          </h1>
          <p className="text-xs text-[#64748d] mt-0.5">
            Sistem Informasi Sekolah &amp; Manajemen Pembelajaran
          </p>
        </div>

        {/* Sign In Card */}
        <Card className="rounded-2xl border border-[#e3e8ee] bg-white p-2 shadow-[0_13px_27px_-5px_rgba(50,50,93,0.1),0_8px_16px_-8px_rgba(0,0,0,0.06)]">
          <CardHeader className="space-y-1 pb-4 pt-6 px-6 text-center">
            <CardTitle className="text-xl font-extrabold text-[#0d253d]">Masuk ke Akun</CardTitle>
            <CardDescription className="text-xs text-[#64748d]">
              Masukkan email dan password Anda untuk melanjutkan
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 px-6">
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-[#273951]">
                  Email Sekolah / Akun
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@sekolah.com"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl border-[#e3e8ee] bg-[#fdfdfe] text-xs transition-all focus-visible:border-[#533afd] focus-visible:ring-2 focus-visible:ring-[#533afd]/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-[#273951]">
                    Kata Sandi
                  </Label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info("Silakan hubungi staf admin/TU sekolah untuk mereset kata sandi Anda.");
                    }}
                    className="text-[11px] font-medium text-[#533afd] hover:underline"
                  >
                    Lupa password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border-[#e3e8ee] bg-[#fdfdfe] text-xs transition-all focus-visible:border-[#533afd] focus-visible:ring-2 focus-visible:ring-[#533afd]/20"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="rounded border-[#e3e8ee] data-[state=checked]:bg-[#533afd] data-[state=checked]:border-[#533afd]"
                />
                <Label htmlFor="remember" className="text-xs font-normal text-[#64748d] cursor-pointer">
                  Ingat sesi saya di perangkat ini
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-full bg-[#533afd] text-xs font-semibold text-white shadow-sm shadow-[#533afd]/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4434d4] hover:shadow-md hover:shadow-[#533afd]/35 active:translate-y-0 active:bg-[#2e2b8c]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memproses...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span>Masuk</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-[#e3e8ee]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 text-[#64748d] font-semibold">Atau lanjutkan dengan</span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full h-11 rounded-full border-[#e3e8ee] bg-white text-xs font-semibold text-[#273951] hover:bg-[#f6f9fc] hover:border-[#533afd]/30 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 262" className="mr-2">
                <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" />
                <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" />
                <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z" />
                <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" />
              </svg>
              <span>Masuk dengan Google</span>
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 pb-6 pt-2 px-6 text-center text-xs">
            <div className="text-[#64748d]">
              Belum punya akun?{" "}
              <Link href="/auth/sign-up" className="font-semibold text-[#533afd] hover:underline">
                Daftar sekarang
              </Link>
            </div>
            <div className="text-[11px] text-[#64748d]">
              Pengelola Yayasan?{" "}
              <Link href="/landing/register/foundation" className="font-semibold text-[#533afd] hover:underline">
                Daftar Sekolah Baru
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-[#64748d]">
          <p>&copy; {new Date().getFullYear()} {clientName}. Seluruh hak cipta dilindungi.</p>
        </div>
      </div>
    </div>
  );
}
