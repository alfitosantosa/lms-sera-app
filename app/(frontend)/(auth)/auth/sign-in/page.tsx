"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleMark } from "@/components/entry/GoogleMark";
import {
  Sheet,
  SheetActions,
  SheetHeading,
  SheetMasthead,
  SheetPage,
} from "@/components/entry/Sheet";
import { signIn } from "@/lib/authClients";
import { type FormEvent, useState } from "react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleEmailSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email dan kata sandi wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      await signIn.email(
        {
          email,
          password,
          callbackURL: "/dashboard/profile",
          rememberMe,
        },
        {
          onRequest: () => setLoading(true),
          onResponse: () => setLoading(false),
          onError: (ctx) => {
            setLoading(false);
            toast.error(
              ctx.error.message ||
                "Gagal masuk. Periksa kembali email dan kata sandi Anda.",
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

  return (
    <SheetPage>
      <SheetMasthead label="MASUK AKUN" />

      <Sheet>
        <SheetHeading
          title="Masuk ke akun Anda"
          description="Gunakan email dan kata sandi akun sekolah yang diberikan admin yayasan atau cabang Anda."
        />

        <form onSubmit={handleEmailSignIn}>
          <div className="border-border space-y-5 border-t px-6 py-6">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-secondary-foreground text-[13px] font-medium"
              >
                Email sekolah
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@sekolah.com"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Label
                  htmlFor="password"
                  className="text-secondary-foreground text-[13px] font-medium"
                >
                  Kata sandi
                </Label>
                <button
                  type="button"
                  onClick={() =>
                    toast.info(
                      "Silakan hubungi staf admin/TU sekolah untuk mereset kata sandi Anda.",
                    )
                  }
                  className="text-primary focus-visible:ring-ring/50 rounded-sm text-xs font-medium underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:outline-none"
                >
                  Lupa kata sandi?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label
                htmlFor="remember"
                className="text-muted-foreground cursor-pointer text-xs font-normal"
              >
                Ingat sesi saya di perangkat ini
              </Label>
            </div>
          </div>

          <SheetActions
            aside={
              <>
                Belum punya akun?{" "}
                <Link
                  href="/auth/sign-up"
                  className="text-primary font-medium underline-offset-4 hover:underline"
                >
                  Buat akun
                </Link>
              </>
            }
          >
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </SheetActions>
        </form>

        <div className="border-border border-t px-6 py-6">
          <div className="flex items-center gap-4">
            <span className="border-border h-px flex-1 border-t" />
            <span className="text-muted-foreground text-xs">atau</span>
            <span className="border-border h-px flex-1 border-t" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="mt-4 w-full"
          >
            <GoogleMark />
            Masuk dengan Google
          </Button>
        </div>
      </Sheet>
    </SheetPage>
  );
}
