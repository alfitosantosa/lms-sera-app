import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[60vh] w-full flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      <div
        aria-hidden="true"
        className="bg-primary/15 pointer-events-none absolute -top-24 left-1/2 h-[360px] w-[560px] -translate-x-1/2 rounded-full blur-[120px] select-none"
      />

      <div className="relative z-10 max-w-md">
        <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
          Halaman ini tidak ada.
        </h1>
        <p className="text-foreground/80 mt-3 text-base leading-relaxed">
          Alamatnya mungkin salah ketik, atau halaman sudah dipindahkan. Kembali
          ke dasbor untuk melanjutkan pekerjaan Anda.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild className="w-full rounded-full px-6 sm:w-auto">
            <Link href="/dashboard">
              <span>Kembali ke Dasbor</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-border w-full rounded-full px-6 sm:w-auto"
          >
            <Link href="/">Halaman Utama</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
