"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
            toast.error(
              ctx.error.message ||
                "Gagal masuk. Periksa kembali email dan password Anda.",
            );
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
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan saat masuk";
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
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat autentikasi Google";
      toast.error(message);
    }
  };

  const clientName =
    process.env.NEXT_PUBLIC_CLIENT_NAME || "Yayasan Rahmaniyah Al-Islamy";

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center bg-secondary px-4 py-12 overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* Stripe-style ambient luminous glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -top-20 h-[450px] w-[500px] rounded-full bg-primary/20 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[450px] w-[480px] rounded-full bg-info/15 blur-[120px]"
        />
      </div>

      {/* Floating Back to Home Link */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3.5 py-1.5 text-xs font-medium text-secondary-foreground shadow-xs backdrop-blur-md transition-all hover:border-primary/40 hover:bg-background hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Brand & School Logo */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 mb-3"
          >
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-foreground transition-colors group-hover:text-primary">
              Sera
            </span>
            <span className="rounded-full bg-brand-tint px-2 py-0.5 text-[10px] font-bold text-primary">
              LMS
            </span>
          </Link>

          <h1 className="text-lg font-bold text-foreground">{clientName}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sistem Informasi Sekolah &amp; Manajemen Pembelajaran
          </p>
        </div>

        {/* Sign In Card */}
        <Card className="rounded-xl border border-border bg-card p-2 shadow-lg">
          <CardHeader className="space-y-1 pb-4 pt-6 px-6 text-center">
            <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground">
              Masuk ke Akun
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Masukkan email dan password Anda untuk melanjutkan
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 px-6">
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold text-secondary-foreground"
                >
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
                    className="h-11 border-border bg-background text-xs transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-xs font-semibold text-secondary-foreground"
                  >
                    Kata Sandi
                  </Label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info(
                        "Silakan hubungi staf admin/TU sekolah untuk mereset kata sandi Anda.",
                      );
                    }}
                    className="text-[11px] font-medium text-primary hover:underline"
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
                  className="h-11 border-border bg-background text-xs transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                  className="rounded border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor="remember"
                  className="text-xs font-normal text-muted-foreground cursor-pointer"
                >
                  Ingat sesi saya di perangkat ini
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md hover:shadow-primary/35 active:translate-y-0 active:bg-primary-active"
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
                <Separator className="w-full bg-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-card px-2 text-muted-foreground font-semibold">
                  Atau lanjutkan dengan
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full h-11 rounded-full border-border bg-background text-xs font-semibold text-secondary-foreground hover:bg-secondary hover:border-primary/30 transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 256 262"
                className="mr-2"
              >
                <path
                  fill="#4285F4"
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                />
                <path
                  fill="#34A853"
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                />
                <path
                  fill="#FBBC05"
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                />
                <path
                  fill="#EB4335"
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                />
              </svg>
              <span>Masuk dengan Google</span>
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 pb-6 pt-2 px-6 text-center text-xs">
            <div className="text-muted-foreground">
              Belum punya akun?{" "}
              <Link
                href="/auth/sign-up"
                className="font-semibold text-primary hover:underline"
              >
                Daftar sekarang
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {clientName}. Seluruh hak cipta
            dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
}
