import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Target } from "lucide-react";

import { SeraLogo } from "@/components/SeraLogo";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/landing/StatusChip";
import { products } from "@/lib/marketing/products";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return { title: "Produk tidak ditemukan" };
  return {
    title: `${product.name} — Sera`,
    description: product.description,
  };
}

/**
 * Halaman detail satu modul. Template tunggal untuk sepuluh slug, seluruh
 * konten dari lib/marketing/products.ts — statis, cepat, dan bisa dicetak.
 */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const index = products.indexOf(product);
  const prev = products[(index - 1 + products.length) % products.length];
  const next = products[(index + 1) % products.length];
  const Icon = product.icon;

  return (
    <div className="bg-background text-foreground min-h-[100dvh] antialiased">
      <nav className="border-border bg-background/85 sticky top-0 z-50 border-b backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
          <Link
            href="/"
            className="focus-visible:ring-ring/80 shrink-0 rounded-xl focus-visible:ring-[3px] focus-visible:outline-none"
            aria-label="Sera App — beranda"
          >
            <SeraLogo markClassName="h-8 w-auto" />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/#produk">Semua produk</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/landing/register/foundation">Daftar yayasan</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main>
        <header className="border-border border-b">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:py-16 lg:grid-cols-12 lg:py-20">
            <div className="min-w-0 lg:col-span-7">
              <p className="text-primary flex items-baseline gap-3 font-mono text-sm font-semibold tabular-nums">
                <span className="text-muted-foreground/60">{product.no}</span>
                <span className="text-border">/</span>
                <span>Produk</span>
              </p>
              <h1 className="mt-4 text-[clamp(2rem,3.4vw,3rem)] leading-[1.05] font-bold tracking-[-0.03em] text-balance">
                {product.name}
              </h1>
              <p className="text-foreground/80 mt-3 text-lg font-medium text-pretty">
                {product.tagline}
              </p>
              <p className="text-muted-foreground mt-4 max-w-[60ch] text-base leading-relaxed">
                {product.description}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <StatusChip status={product.status} />
                <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
                  <Target aria-hidden className="size-4" />
                  {product.target}
                </span>
              </div>
              {product.statusNote ? (
                <p className="text-muted-foreground mt-3 max-w-[60ch] text-xs leading-relaxed">
                  {product.statusNote}
                </p>
              ) : null}
            </div>

            <div className="lg:col-span-5">
              <div className="bg-secondary border-border rounded-3xl border p-6">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Termasuk dalam
                </p>
                <p className="text-foreground mt-3 text-base font-semibold">
                  {product.included}
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <Button asChild size="lg" className="w-full">
                    <Link href="/landing/register/foundation">
                      Mulai dari modul ini
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link href="/#paket">Bandingkan paket &amp; harga</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <h2 className="text-[clamp(1.5rem,2.2vw,2rem)] leading-[1.15] font-semibold tracking-[-0.02em] text-balance">
            Apa saja di dalam {product.name}?
          </h2>

          <div className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2">
            {product.features.map((feature, i) => (
              <div
                key={feature.title}
                className="border-border grid grid-cols-[auto_1fr] gap-x-5 border-t pt-6"
              >
                <span className="text-muted-foreground/50 font-mono text-xs font-medium tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="text-foreground text-base font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground mt-2 max-w-[56ch] text-sm leading-relaxed">
                    {feature.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <nav
          aria-label="Modul lain"
          className="border-border border-t"
        >
          <div className="mx-auto grid max-w-6xl grid-cols-2 px-6 py-10">
            <Link
              href={`/produk/${prev.slug}`}
              className="group focus-visible:ring-ring/80 rounded-2xl p-4 focus-visible:ring-[3px] focus-visible:outline-none"
            >
              <span className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                <ArrowLeft
                  aria-hidden
                  className="group-hover:text-primary size-4 transition-colors"
                />
                Sebelumnya
              </span>
              <span className="text-foreground mt-2 block text-sm font-semibold">
                {prev.name}
              </span>
            </Link>
            <Link
              href={`/produk/${next.slug}`}
              className="group focus-visible:ring-ring/80 rounded-2xl p-4 text-right focus-visible:ring-[3px] focus-visible:outline-none"
            >
              <span className="text-muted-foreground flex items-center justify-end gap-2 text-xs font-medium">
                Berikutnya
                <ArrowRight
                  aria-hidden
                  className="group-hover:text-primary size-4 transition-colors"
                />
              </span>
              <span className="text-foreground mt-2 block text-sm font-semibold">
                {next.name}
              </span>
            </Link>
          </div>
        </nav>
      </main>

      <footer className="border-border border-t px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs sm:flex-row">
          <p className="text-muted-foreground">
            <Icon aria-hidden className="mr-2 inline size-4" />
            Sera · SantosaTechID — {new Date().getFullYear()}
          </p>
          <p className="text-muted-foreground">
            {product.no} dari {products.length} modul
          </p>
        </div>
      </footer>
    </div>
  );
}
