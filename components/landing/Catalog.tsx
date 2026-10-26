import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { products } from "@/lib/marketing/products";
import { Reveal } from "./Reveal";
import { StatusChip } from "./StatusChip";

/**
 * Katalog sepuluh modul sebagai kartu yang bisa diklik — tiap kartu membuka
 * halaman detailnya sendiri di /produk/[slug]. Seluruh kartu adalah tautan,
 * bukan baris dengan tombol terpisah.
 */
export function Catalog() {
  return (
    <section id="produk" className="border-border border-b">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
        <Reveal>
          <div className="max-w-[62ch]">
            <h2 className="text-[clamp(1.75rem,2.6vw,2.5rem)] leading-[1.1] font-semibold tracking-[-0.025em] text-balance">
              Sepuluh modul, satu platform.
            </h2>
            <p className="text-muted-foreground mt-4 max-w-[62ch] text-base leading-relaxed">
              Tidak harus membeli semuanya sekaligus. Mulai dari satu modul,
              tambah yang lain kapan saja — datanya tetap satu sistem, tidak
              perlu migrasi.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => {
            const Icon = product.icon;
            return (
              <Reveal key={product.slug} delay={Math.min(i, 5) * 60} className="h-full">
                <Link
                  href={`/produk/${product.slug}`}
                  className="group border-border bg-card hover:border-primary/50 focus-visible:ring-ring/80 hover:shadow-[0_16px_32px_-16px_rgba(83,58,253,0.35)] flex h-full flex-col rounded-3xl border p-6 transition-all focus-visible:ring-[3px] focus-visible:outline-none active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground/60 font-mono text-sm font-medium tabular-nums">
                      {product.no}
                    </span>
                    <Icon
                      className="text-primary size-5 shrink-0"
                      aria-hidden
                    />
                  </div>

                  <h3 className="text-foreground group-hover:text-primary mt-5 text-base font-semibold tracking-tight transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground mt-2 max-w-[42ch] text-sm leading-relaxed">
                    {product.tagline}
                  </p>

                  <div className="mt-auto flex items-end justify-between gap-3 pt-6">
                    <div className="min-w-0">
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {product.target}
                      </p>
                      <StatusChip status={product.status} className="mt-2" />
                    </div>
                    <ArrowUpRight
                      aria-hidden
                      className="text-muted-foreground/40 group-hover:text-primary size-5 shrink-0 transition-colors"
                    />
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal>
          <p className="text-muted-foreground mt-6 text-xs leading-relaxed">
            Status &ldquo;tersedia&rdquo; berarti modulnya sudah berjalan dan
            didukung data nyata. Modul lain sedang dikembangkan atau dikerjakan
            sebagai proyek kustom — tanyakan saat konsultasi.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
