"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleMark } from "@/components/entry/GoogleMark";
import {
  FieldGroup,
  Sheet,
  SheetActions,
  SheetHeading,
  SheetMasthead,
  SheetPage,
} from "@/components/entry/Sheet";
import { signIn, signUp } from "@/lib/authClients";
import { ChangeEvent, FormEvent, useState } from "react";

async function convertImageToBase64(file: File): Promise<string> {
  const { promise, resolve, reject } = Promise.withResolvers<string>();
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result as string);
  reader.onerror = reject;
  reader.readAsDataURL(file);
  return promise;
}

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  const handleSignUp = async (e: FormEvent) => {
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
            toast.error(
              ctx.error.message || "Gagal membuat akun. Silakan coba lagi.",
            );
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
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat pendaftaran";
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
            toast.error(
              ctx.error.message || "Gagal mendaftar dengan akun Google.",
            );
          },
        },
      );
    } catch (err: unknown) {
      setLoading(false);
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat pendaftaran Google";
      toast.error(message);
    }
  };

  return (
    <SheetPage>
      <SheetMasthead label="PENDAFTARAN AKUN" />

      <Sheet>
        <SheetHeading
          title="Buat akun"
          description="Akun ini dipakai untuk masuk ke portal sekolah. Data profil bisa dilengkapi setelah akun aktif."
        />

        <form onSubmit={handleSignUp}>
          <FieldGroup label="IDENTITAS">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="first-name"
                  className="text-secondary-foreground text-[13px] font-medium"
                >
                  Nama depan
                </Label>
                <Input
                  id="first-name"
                  placeholder="Ahmad"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="last-name"
                  className="text-secondary-foreground text-[13px] font-medium"
                >
                  Nama belakang
                </Label>
                <Input
                  id="last-name"
                  placeholder="Ramadhan"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-secondary-foreground text-[13px] font-medium"
              >
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
                className="h-11"
              />
            </div>
          </FieldGroup>

          <FieldGroup label="KATA SANDI">
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-secondary-foreground text-[13px] font-medium"
              >
                Kata sandi (min. 8 karakter)
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password_confirmation"
                className="text-secondary-foreground text-[13px] font-medium"
              >
                Konfirmasi kata sandi
              </Label>
              <Input
                id="password_confirmation"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="h-11"
              />
            </div>
          </FieldGroup>

          <FieldGroup label="FOTO PROFIL (OPSIONAL)">
            <div className="space-y-1.5">
              <Label
                htmlFor="image"
                className="text-secondary-foreground text-[13px] font-medium"
              >
                Foto profil (opsional, maks 2MB)
              </Label>
              <div className="flex items-center gap-3">
                {imagePreview ? (
                  <div className="border-primary/30 relative h-12 w-12 overflow-hidden rounded-sm border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-navy/60 absolute inset-0 flex items-center justify-center text-white opacity-0 transition-opacity hover:opacity-100"
                      aria-label="Hapus foto"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-border bg-secondary text-muted-foreground flex h-12 w-12 items-center justify-center rounded-sm border border-dashed">
                    <Camera className="h-5 w-5" />
                  </div>
                )}

                <div className="flex-1">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file:bg-brand-tint file:text-primary h-11 text-xs file:mr-2 file:rounded-md file:border-0 file:text-xs file:font-semibold"
                  />
                </div>
              </div>
            </div>
          </FieldGroup>

          <SheetActions
            aside={
              <>
                Sudah punya akun?{" "}
                <Link
                  href="/auth/sign-in"
                  className="text-primary font-medium underline-offset-4 hover:underline"
                >
                  Masuk
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
                  Mendaftarkan...
                </>
              ) : (
                "Buat akun"
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
            onClick={handleGoogleSignUp}
            className="mt-4 w-full"
          >
            <GoogleMark />
            Daftar dengan Google
          </Button>
        </div>
      </Sheet>
    </SheetPage>
  );
}
