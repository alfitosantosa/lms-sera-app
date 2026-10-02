"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const PROOFS = [
  {
    text: "51 tabel data terintegrasi",
    tone: "bg-info-surface text-info-strong",
    icon: (
      <path d="M4 6c0-1.1 3.6-2 8-2s8 .9 8 2-3.6 2-8 2-8-.9-8-2Zm0 0v6c0 1.1 3.6 2 8 2s8-.9 8-2V6M4 12v6c0 1.1 3.6 2 8 2s8-.9 8-2v-6" />
    ),
  },
  {
    text: "Multi-cabang dalam satu yayasan",
    tone: "bg-success-surface text-success-strong",
    icon: (
      <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-5h6v5M9 11h.01M15 11h.01" />
    ),
  },
  {
    text: "Presensi dan SPP dalam satu sistem",
    tone: "bg-warning-surface text-warning-strong",
    icon: <path d="M4 7h16v12H4zM4 7l2-3h12l2 3M9 13l2 2 4-4" />,
  },
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
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="text-navy-foreground max-w-[20ch] text-3xl leading-[1.15] font-semibold tracking-tight text-balance sm:text-5xl">
            Siap merapikan administrasi sekolah dan yayasan Anda?
          </h2>

          <p className="text-navy-muted mt-5 max-w-[56ch] text-base leading-relaxed">
            Buat akun yayasan, lalu daftarkan cabang SMP, SMA, atau SMK IT di
            bawahnya. Data siswa dan nilai dari berkas Excel lama dapat diimpor
            langsung ke dalam sistem.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              onClick={handleRegisterFoundation}
              className="bg-navy-accent text-navy hover:bg-navy-accent/90 active:bg-navy-accent/80 w-full px-7 py-6 text-sm font-semibold transition-colors sm:w-auto"
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

        <div className="border-navy-border bg-navy-foreground/5 rounded-3xl border p-6 lg:col-span-5 lg:p-8">
          <ul className="space-y-5">
            {PROOFS.map((proof) => (
              <li key={proof.text} className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${proof.tone}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {proof.icon}
                  </svg>
                </span>
                <span className="text-navy-foreground text-base leading-snug font-medium">
                  {proof.text}
                </span>
              </li>
            ))}
          </ul>

          <div className="border-navy-border mt-6 border-t pt-5">
            <span className="text-navy-accent border-navy-accent inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 12 5 5 9-10" />
              </svg>
              Terverifikasi
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
