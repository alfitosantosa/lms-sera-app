"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Camera, Loader2, Lock, Mail, User, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { signIn, signUp } from "@/lib/authClients";

async function convertImageToBase64(file: File): Promise<string> {
  const { promise, resolve, reject } = Promise.withResolvers<string>();
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result as string);
  reader.onerror = reject;
  reader.readAsDataURL(file);
  return promise;
}

export default function SignUp() {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordConfirmation, setPasswordConfirmation] = React.useState("");
  const [image, setImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran foto maksimal 2 MB.");
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim()) {
      toast.error("Nama depan wajib diisi.");
      return;
    }
    if (!email.trim()) {
      toast.error("Alamat email wajib diisi.");
      return;
    }
    if (password.length < 8) {
      toast.error("Kata sandi minimal 8 karakter.");
      return;
    }
    if (password !== passwordConfirmation) {
      toast.error("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    try {
      setLoading(true);
      const base64Image = image ? await convertImageToBase64(image) : "";

      await signUp.email({
        email,
        password,
        name: `${firstName} ${lastName}`.trim(),
        image: base64Image,
        callbackURL: "/dashboard/profile",
        fetchOptions: {
          onRequest: () => setLoading(true),
          onResponse: () => setLoading(false),
          onError: (ctx) => {
            setLoading(false);
            toast.error(ctx.error.message || "Gagal membuat akun. Silakan coba lagi.");
          },
          onSuccess: async () => {
            setLoading(false);
            toast.success("Akun berhasil dibuat! Mengarahkan...");
            router.push("/dashboard/profile");
          },
        },
      });
    } catch (err: unknown) {
      setLoading(false);
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat pendaftaran";
      toast.error(message);
    }
  };

  const handleGoogleSignUp = async () => {
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
            toast.error(ctx.error.message || "Gagal mendaftar dengan akun Google.");
          },
        },
      );
    } catch (err: unknown) {
      setLoading(false);
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat pendaftaran Google";
      toast.error(message);
    }
  };

  const clientName = process.env.NEXT_PUBLIC_CLIENT_NAME || "Yayasan Rahmaniyah Al-Islamy";

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center bg-secondary px-4 py-12 overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* Stripe-style ambient luminous glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 h-[450px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[450px] w-[480px] rounded-full bg-info/15 blur-[120px]" />
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

      <div className="relative z-10 w-full max-w-[460px]">
        {/* Brand & School Logo */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Link href="/" className="group inline-flex items-center gap-2.5 mb-3">
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

          <h1 className="text-lg font-bold text-foreground">
            {clientName}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Buat akun pengguna untuk mengakses portal sekolah
          </p>
        </div>

        {/* Sign Up Card */}
        <Card className="rounded-xl border border-border bg-card p-2 shadow-lg">
          <CardHeader className="space-y-1 pb-4 pt-6 px-6 text-center">
            <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground">Daftar Akun Baru</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Lengkapi data profil Anda untuk registrasi ke sistem
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 px-6">
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* Two-Column Name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="first-name" className="text-xs font-semibold text-secondary-foreground">
                    Nama Depan
                  </Label>
                  <Input
                    id="first-name"
                    placeholder="Ahmad"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-10 rounded-xl border-border bg-background text-xs transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="last-name" className="text-xs font-semibold text-secondary-foreground">
                    Nama Belakang
                  </Label>
                  <Input
                    id="last-name"
                    placeholder="Ramadhan"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-10 rounded-xl border-border bg-background text-xs transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-secondary-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@sekolah.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-xl border-border bg-background text-xs transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-secondary-foreground">
                  Kata Sandi (Min. 8 karakter)
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-xl border-border bg-background text-xs transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password_confirmation" className="text-xs font-semibold text-secondary-foreground">
                  Konfirmasi Kata Sandi
                </Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="h-10 rounded-xl border-border bg-background text-xs transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>

              {/* Profile Image (Optional) */}
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="image" className="text-xs font-semibold text-secondary-foreground">
                  Foto Profil (Opsional, maks 2MB)
                </Label>
                <div className="flex items-center gap-3">
                  {imagePreview ? (
                    <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-primary/30">
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute inset-0 flex items-center justify-center bg-navy/60 text-white opacity-0 hover:opacity-100 transition-opacity"
                        aria-label="Hapus foto"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-border bg-secondary text-muted-foreground">
                      <Camera className="h-5 w-5" />
                    </div>
                  )}

                  <div className="flex-1">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="h-10 text-xs file:text-xs file:bg-brand-tint file:text-primary file:font-semibold file:border-0 file:rounded-md file:mr-2"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md hover:shadow-primary/35 active:translate-y-0 active:bg-primary-active"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Mendaftarkan...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span>Buat Akun</span>
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
                <span className="bg-card px-2 text-muted-foreground font-semibold">Atau daftar dengan</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleGoogleSignUp}
              className="w-full h-11 rounded-full border-border bg-background text-xs font-semibold text-secondary-foreground hover:bg-secondary hover:border-primary/30 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 262" className="mr-2">
                <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" />
                <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" />
                <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z" />
                <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" />
              </svg>
              <span>Daftar dengan Google</span>
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 pb-6 pt-2 px-6 text-center text-xs">
            <div className="text-muted-foreground">
              Sudah memiliki akun?{" "}
              <Link href="/auth/sign-in" className="font-semibold text-primary hover:underline">
                Masuk di sini
              </Link>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Pengelola Yayasan?{" "}
              <Link href="/landing/register/foundation" className="font-semibold text-primary hover:underline">
                Daftar Sekolah Baru
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {clientName}. Seluruh hak cipta dilindungi.</p>
        </div>
      </div>
    </div>
  );
}
