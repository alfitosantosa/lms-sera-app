"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const PROOFS = [
  "51 tabel data terintegrasi",
  "Multi-cabang dalam satu yayasan",
  "Presensi dan SPP dalam satu sistem",
];

export function CtaSection() {
  const router = useRouter();

  const handleRegisterFoundation = () => {
    router.push("/landing/register/foundation");
  };

  const handleSignIn = () => {
    router.push("/auth/sign-in");
  };

  return (
    <section className="bg-navy text-navy-foreground py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-3xl">
          <p className="text-navy-muted text-sm">Pendaftaran yayasan</p>

          <h2 className="text-navy-foreground mt-4 text-3xl leading-[1.15] font-semibold tracking-tight text-balance sm:text-4xl">
            Siap merapikan administrasi sekolah dan yayasan Anda?
          </h2>

          <p className="text-navy-muted mt-4 max-w-[68ch] text-base leading-relaxed">
            Buat akun yayasan, lalu daftarkan cabang SMP, SMA, atau SMK IT di
            bawahnya. Data siswa dan nilai dari berkas Excel lama dapat diimpor
            langsung ke dalam sistem.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              onClick={handleRegisterFoundation}
              className="bg-navy-foreground text-navy hover:bg-navy-muted active:bg-navy-muted w-full px-7 py-6 text-sm font-semibold transition-colors sm:w-auto"
            >
              Daftar Akun Yayasan
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleSignIn}
              className="border-navy-border text-navy-foreground hover:bg-navy-foreground/10 w-full bg-transparent px-7 py-6 text-sm font-medium transition-colors sm:w-auto"
            >
              Masuk ke Akun
            </Button>
          </div>
        </div>

        {/* Proof entries, closed by one verified mark */}
        <div className="mt-16 flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <ul className="grid flex-1 gap-x-10 gap-y-5 sm:grid-cols-3">
            {PROOFS.map((proof) => (
              <li
                key={proof}
                className="text-navy-foreground text-sm leading-snug"
              >
                {proof}
              </li>
            ))}
          </ul>

          <span className="text-navy-accent border-navy-accent animate-card self-start rounded-2xl border px-4 py-2 text-sm font-semibold">
            Terverifikasi
          </span>
        </div>
      </div>
    </section>
  );
}
