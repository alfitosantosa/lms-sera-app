import Link from "next/link";
import { Check } from "lucide-react";
import { pricingNote, tiers } from "@/lib/marketing/products";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

/**
 * Empat paket harga. Yang direkomendasikan (Professional) naik satu tingkat —
 * sisanya diam. Nominal ditulis sebagai rentang ilustrasi, dengan catatan
 * kejujuran di bawah: harga akhir mengikuti jumlah siswa dan cakupan.
 */
export function Pricing() {
  return (
    <section id="paket" className="border-border border-b">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
        <Reveal>
          <div className="max-w-[62ch]">
            <h2 className="text-[clamp(1.75rem,2.6vw,2.5rem)] leading-[1.1] font-semibold tracking-[-0.025em] text-balance">
              Paket yang mudah dibeli, sesuai anggaran sekolah.
            </h2>
            <p className="text-muted-foreground mt-4 max-w-[62ch] text-base leading-relaxed">
              Empat paket dengan manfaat yang jelas — dari sekolah yang baru
              memulai digitalisasi sampai yayasan dengan banyak unit.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-4">
          {tiers.map((tier, i) => (
            <Reveal key={tier.id} delay={i * 80} className="h-full">
              <article
                className={cn(
                  "flex h-full flex-col rounded-3xl border p-6",
                  tier.highlighted
                    ? "border-primary border-2 shadow-[0_20px_40px_-15px_rgba(83,58,253,0.25)]"
                    : "border-border bg-card",
                )}
              >
                {tier.highlighted ? (
                  <span className="bg-primary text-primary-foreground self-start rounded-full px-3 py-1 text-xs font-semibold">
                    Rekomendasi
                  </span>
                ) : null}

                <h3 className="text-foreground mt-4 text-lg font-semibold tracking-tight">
                  {tier.name}
                </h3>
                <p className="text-foreground mt-2 text-2xl font-bold tracking-tight tabular-nums">
                  {tier.price}
                </p>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {tier.audience}
                </p>

                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        aria-hidden
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          tier.highlighted ? "text-primary" : "text-success",
                        )}
                      />
                      <span className="text-secondary-foreground text-sm leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  <p className="text-muted-foreground mb-4 text-xs leading-relaxed">
                    {tier.model}
                  </p>
                  <Button
                    asChild
                    size="lg"
                    variant={tier.highlighted ? "default" : "outline"}
                    className="w-full"
                  >
                    <Link href="/landing/register/foundation">
                      Mulai konsultasi
                    </Link>
                  </Button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="text-muted-foreground mt-8 max-w-[72ch] text-xs leading-relaxed">
            {pricingNote}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
