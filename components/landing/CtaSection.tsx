"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Sparkles, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  const router = useRouter();

  const handleRegisterFoundation = () => {
    router.push("/landing/register/foundation");
  };

  const handleSignIn = () => {
    router.push("/auth/sign-in");
  };

  return (
    <section className="relative overflow-hidden bg-navy py-24 text-center text-white">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 select-none opacity-40">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-primary blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-[#ea2261] blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#00d4ff] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-xs font-semibold text-brand-accent backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Mulai Transformasi Digital Sekolah</span>
        </div>

        <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-white leading-[1.14]">
          Siap merapikan operasional sekolah &amp; yayasan Anda?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/75">
          Aktifkan akun yayasan Anda hari ini. Tim teknis Sera siap mendampingi proses setup awal dan
          migrasi data siswa dari spreadsheet lama Anda tanpa biaya tambahan.
        </p>

        {/* Action Buttons */}
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Button
            size="lg"
            onClick={handleRegisterFoundation}
            className="group w-full rounded-full bg-primary px-8 py-6 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover sm:w-auto"
          >
            <span>Daftar Akun Yayasan Gratis</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleSignIn}
            className="w-full rounded-full border-white/20 bg-white/10 px-7 py-6 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20 hover:text-white sm:w-auto"
          >
            Masuk ke Akun
          </Button>
        </div>

        {/* Micro-proof points */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/60">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#00d924]" />
            Tanpa kartu kredit
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#00d924]" />
            Didampingi tim onboarding
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#00d924]" />
            Uptime SLA 99.9%
          </span>
        </div>
      </div>
    </section>
  );
}
