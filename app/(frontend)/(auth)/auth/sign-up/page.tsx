"use client";

import { useRouter } from "next/navigation";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleMark } from "@/components/entry/GoogleMark";
import { EntryAside } from "@/components/entry/EntryAside";
import {
  EntryBanner,
  EntryDivider,
  EntryField,
  EntryFooter,
  EntryForm,
  EntryGroup,
  EntryHeading,
  EntryLink,
  EntryScreen,
} from "@/components/entry/Entry";
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
    <EntryScreen aside={<EntryAside />}>
      <EntryForm>
        <EntryBanner />

        <EntryHeading
          title="Buat akun"
          description="Akun ini dipakai untuk masuk ke portal sekolah. Data profil bisa dilengkapi setelah akun aktif."
        />

        <form onSubmit={handleSignUp} className="flex flex-col gap-6">
          <EntryGroup
            label="Identitas"
            delay="animate-element animate-delay-300"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <EntryField label="Nama depan" htmlFor="first-name">
                <Input
                  id="first-name"
                  placeholder="Ahmad"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </EntryField>

              <EntryField label="Nama belakang" htmlFor="last-name">
                <Input
                  id="last-name"
                  placeholder="Ramadhan"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </EntryField>
            </div>

            <EntryField label="Email" htmlFor="email">
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
          </EntryGroup>

          <EntryGroup
            label="Kata sandi"
            delay="animate-element animate-delay-400"
          >
            <EntryField
              label="Kata sandi (min. 8 karakter)"
              htmlFor="password"
            >
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </EntryField>

            <EntryField
              label="Konfirmasi kata sandi"
              htmlFor="password_confirmation"
            >
              <Input
                id="password_confirmation"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
              />
            </EntryField>
          </EntryGroup>

          <EntryGroup
            label="Foto profil"
            delay="animate-element animate-delay-500"
          >
            <EntryField label="Foto profil (opsional, maks 2MB)" htmlFor="image">
              <div className="flex items-center gap-3">
                {imagePreview ? (
                  <div className="border-border relative size-12 shrink-0 overflow-hidden rounded-xl border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Pratinjau foto profil"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-foreground/50 focus-visible:ring-ring/80 absolute inset-0 flex items-center justify-center text-white opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:outline-none"
                      aria-label="Hapus foto"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-border bg-secondary text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-xl border border-dashed">
                    <Camera className="size-5" />
                  </div>
                )}

                <div className="flex-1">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file:bg-secondary file:rounded-lg h-11 text-xs file:mr-3 file:border-0 file:text-xs file:font-semibold"
                  />
                </div>
              </div>
            </EntryField>
          </EntryGroup>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="animate-element animate-delay-600 w-full"
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
        </form>

        <EntryDivider label="atau lanjut dengan" />

        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={loading}
          onClick={handleGoogleSignUp}
          className="animate-element animate-delay-800 w-full"
        >
          <GoogleMark />
          Daftar dengan Google
        </Button>

        <EntryFooter>
          Sudah punya akun? <EntryLink href="/auth/sign-in">Masuk</EntryLink>
        </EntryFooter>
      </EntryForm>
    </EntryScreen>
  );
}
