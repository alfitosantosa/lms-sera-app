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
          {/* Column label */}
          <div className="border-navy-border border-t-2 pt-4">
            <span className="font-display text-navy-muted text-[11px] tracking-wide">
              Pendaftaran yayasan
            </span>
          </div>

          <h2 className="font-display mt-6 text-3xl leading-[1.15] tracking-tight text-balance sm:text-4xl">
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
              className="bg-navy-foreground text-navy hover:bg-navy-muted active:bg-navy-muted w-full rounded-sm px-7 py-6 text-sm font-semibold transition-colors sm:w-auto"
            >
              Daftar Akun Yayasan
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleSignIn}
              className="border-navy-border text-navy-foreground hover:bg-navy-foreground/10 hover:text-white w-full rounded-sm bg-transparent px-7 py-6 text-sm font-medium shadow-none transition-colors sm:w-auto"
            >
              Masuk ke Akun
            </Button>
          </div>
        </div>

        {/* Ruled proof entries, closed by one stamp */}
        <div className="border-navy-border mt-16 flex flex-col gap-8 border-t-2 pt-6 sm:flex-row sm:items-start sm:justify-between">
          <ul className="grid flex-1 gap-x-10 gap-y-5 sm:grid-cols-3">
            {PROOFS.map((proof) => (
              <li
                key={proof}
                className="border-navy-border font-display border-b pb-2 text-[13px] leading-snug text-navy-foreground sm:border-b-0 sm:pb-0"
              >
                {proof}
              </li>
            ))}
          </ul>

          <span className="stamp stamp-in font-display text-navy-accent border-navy-accent self-start rounded-sm border-2 px-3 py-1 text-sm">
            Terverifikasi
          </span>
        </div>
      </div>
    </section>
  );
}
