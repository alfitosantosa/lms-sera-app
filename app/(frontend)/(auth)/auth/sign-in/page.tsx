"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
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
    process.env.NEXT_PUBLIC_CLIENT_NAME || "Yayasan Santosatechid Al-Islamy";

  return (
    <div className="bg-secondary selection:bg-primary/20 selection:text-primary relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-12">
      {/* Stripe-style ambient luminous glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      >
        <div
          aria-hidden="true"
          className="bg-primary/20 pointer-events-none absolute -top-20 -left-20 h-[450px] w-[500px] rounded-full blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="bg-info/15 pointer-events-none absolute right-[-10%] bottom-[-10%] h-[450px] w-[480px] rounded-full blur-[120px]"
        />
      </div>

      {/* Floating Back to Home Link */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="border-border bg-background/80 text-secondary-foreground hover:border-primary/40 hover:bg-background hover:text-primary inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium shadow-xs backdrop-blur-md transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Brand & School Logo */}
        <div className="mb-6 flex flex-col items-center text-center">
          <Link
            href="/"
            className="group mb-3 inline-flex items-center gap-2.5"
          >
            <span className="relative flex h-3 w-3">
              <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
              <span className="bg-primary relative inline-flex h-3 w-3 rounded-full" />
            </span>
            <span className="text-foreground group-hover:text-primary text-2xl font-extrabold tracking-tight transition-colors">
              Sera
            </span>
            <span className="bg-brand-tint text-primary rounded-full px-2 py-0.5 text-[10px] font-bold">
              LMS
            </span>
          </Link>

          <Image
            src={
              process.env.NEXT_PUBLIC_CLIENT_IMAGE_URL
                ? process.env.NEXT_PUBLIC_CLIENT_IMAGE_URL
                : ""
            }
            alt="Logo Yayasan Santosatechid Al-Islamy"
            width={40}
            height={40}
          />
          <p className="text-muted-foreground mt-0.5 text-xs">
            Sistem Informasi Sekolah &amp; Manajemen Pembelajaran
          </p>
        </div>

        {/* Sign In Card */}
        <Card className="border-border bg-card rounded-xl border p-2 shadow-lg">
          <CardHeader className="space-y-1 px-6 pt-6 pb-4 text-center">
            <CardTitle className="text-foreground text-2xl font-extrabold tracking-tight">
              Masuk ke Akun
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Masukkan email dan password Anda untuk melanjutkan
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 px-6">
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-secondary-foreground text-xs font-semibold"
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
                    className="border-border bg-background focus-visible:border-primary focus-visible:ring-primary/20 h-11 text-xs transition-all focus-visible:ring-2"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-secondary-foreground text-xs font-semibold"
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
                    className="text-primary text-[11px] font-medium hover:underline"
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
                  className="border-border bg-background focus-visible:border-primary focus-visible:ring-primary/20 h-11 text-xs transition-all focus-visible:ring-2"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded"
                />
                <Label
                  htmlFor="remember"
                  className="text-muted-foreground cursor-pointer text-xs font-normal"
                >
                  Ingat sesi saya di perangkat ini
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="bg-primary text-primary-foreground shadow-primary/25 hover:bg-primary-hover hover:shadow-primary/35 active:bg-primary-active h-11 w-full rounded-full text-xs font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
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
                <Separator className="bg-border w-full" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-card text-muted-foreground px-2 font-semibold">
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
              className="border-border bg-background text-secondary-foreground hover:bg-secondary hover:border-primary/30 h-11 w-full rounded-full text-xs font-semibold transition-all"
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

          <CardFooter className="flex flex-col space-y-2 px-6 pt-2 pb-6 text-center text-xs">
            <div className="text-muted-foreground">
              Belum punya akun?{" "}
              <Link
                href="/auth/sign-up"
                className="text-primary font-semibold hover:underline"
              >
                Daftar sekarang
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Footer info */}
        <div className="text-muted-foreground mt-8 text-center text-xs">
          <p>
            &copy; {new Date().getFullYear()} {clientName}. Seluruh hak cipta
            dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
}
