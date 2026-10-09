"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleMark } from "@/components/entry/GoogleMark";
import {
  EntryDivider,
  EntryField,
  EntryFooter,
  EntryForm,
  EntryHeading,
  EntryLink,
  EntryScreen,
} from "@/components/entry/Entry";
import { signIn } from "@/lib/betterauth/authClients";
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
    <EntryScreen>
      <EntryForm>
        <EntryHeading
          title="Masuk ke akun Anda"
          description="Gunakan email dan kata sandi akun sekolah yang diberikan admin yayasan atau cabang Anda."
        />

        <form onSubmit={handleEmailSignIn} className="flex flex-col gap-6">
          <EntryField
            label="Email sekolah"
            htmlFor="email"
            delay="animate-element animate-delay-300"
          >
            <Input
              id="email"
              type="email"
              placeholder="nama@sekolah.com"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </EntryField>

          <EntryField
            label="Kata sandi"
            htmlFor="password"
            delay="animate-element animate-delay-400"
            hint={
              <button
                type="button"
                onClick={() =>
                  toast.info(
                    "Silakan hubungi staf admin/TU sekolah untuk mereset kata sandi Anda.",
                  )
                }
                className="text-interactive focus-visible:ring-ring/80 rounded-lg text-xs font-medium underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:outline-none"
              >
                Lupa kata sandi?
              </button>
            }
          >
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </EntryField>

          <div className="animate-element animate-delay-500 flex items-center gap-3">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
            />
            <Label
              htmlFor="remember"
              className="cursor-pointer text-sm font-normal"
            >
              Ingat sesi saya di perangkat ini
            </Label>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="animate-element animate-delay-600 w-full"
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
        </form>

        <EntryDivider label="atau lanjut dengan" />

        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={loading}
          onClick={handleGoogleSignIn}
          className="animate-element animate-delay-800 w-full"
        >
          <GoogleMark />
          Masuk dengan Google
        </Button>

        <EntryFooter>
          Belum punya akun?{" "}
          <EntryLink href="/auth/sign-up">Buat akun</EntryLink>
        </EntryFooter>
      </EntryForm>
    </EntryScreen>
  );
}
