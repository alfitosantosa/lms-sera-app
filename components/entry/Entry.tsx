import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { SeraLogo } from "@/components/SeraLogo";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * The entry screens, in the house style. A split screen: the form column on
 * the left, one ink panel on the right, and the page assembling itself in a
 * single cascade — 100ms per step, top to bottom. See DESIGN.md §3.
 *
 * `delay` props take the literal class, e.g. `animate-delay-300`, because
 * Tailwind only generates the ones it can read in the source.
 */
export function EntryScreen({
  aside,
  children,
}: {
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="bg-background flex min-h-[100dvh] flex-col md:flex-row">
      <section className="flex flex-1 items-center justify-center px-6 py-10 sm:px-8 sm:py-14">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/80 animate-element inline-flex items-center gap-1.5 rounded-lg text-sm font-medium underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:outline-none"
          >
            <ArrowLeft className="size-4" />
            Kembali ke beranda
          </Link>

          {children}
        </div>
      </section>

      {aside ? (
        <section className="relative hidden p-4 md:block md:flex-1">
          {aside}
        </section>
      ) : null}
    </div>
  );
}

/** The stacked column the form lives in. */
export function EntryForm({ children }: { children: ReactNode }) {
  return <div className="mt-8 flex flex-col gap-6">{children}</div>;
}

/**
 * The banner the entry screens open with: who this system is, said once, with
 * the way to the page written for families. The actions behind the form are
 * for people who already have an account, so the banner points the ones who do
 * not at the school day told to the family. Kept to three short lines so the
 * form column still fits a laptop screen — it arrives first, ahead of the
 * heading's own delay.
 */
export function EntryBanner() {
  return (
    <div className="animate-element border-border bg-card rounded-3xl border p-5">
      <SeraLogo markClassName="h-8 w-auto" />

      <p className="text-foreground mt-4 text-sm leading-snug font-medium text-pretty">
        Presensi, tahfidz, dan tagihan SPP siswa dalam satu catatan.
      </p>

      <p className="text-muted-foreground mt-2 text-xs leading-relaxed text-pretty">
        Calon siswa atau orang tua?{" "}
        <EntryLink href="/landing/welcome">Halaman selamat datang</EntryLink>{" "}
        menjelaskan apa yang tercatat selama anak Anda di sekolah.
      </p>
    </div>
  );
}

export function EntryHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h1 className="animate-element animate-delay-100 text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h1>
      <p className="animate-element animate-delay-200 text-muted-foreground mt-3 text-sm leading-relaxed text-pretty">
        {description}
      </p>
    </div>
  );
}

/** One labelled field. */
export function EntryField({
  label,
  htmlFor,
  hint,
  delay,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  delay?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", delay)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint}
      </div>
      {children}
    </div>
  );
}

/** A named run of fields — one panel in the column. */
export function EntryGroup({
  label,
  delay,
  children,
}: {
  label: string;
  delay?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={label}
      className={cn(
        "border-border bg-card animate-element rounded-3xl border p-6",
        delay,
      )}
    >
      <h2 className="text-sm font-semibold">{label}</h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

/** The rule that says what comes next, with its label riding on the line. */
export function EntryDivider({
  label,
  delay = "animate-delay-700",
}: {
  label: string;
  delay?: string;
}) {
  return (
    <div
      className={cn(
        "animate-element relative flex items-center justify-center",
        delay,
      )}
    >
      <span className="border-border w-full border-t" />
      <span className="bg-background text-muted-foreground absolute rounded-full px-4 text-sm">
        {label}
      </span>
    </div>
  );
}

/** The last line of the screen: a question and the way to answer it. */
export function EntryFooter({
  delay = "animate-delay-900",
  children,
}: {
  delay?: string;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "animate-element text-muted-foreground text-center text-sm text-pretty",
        delay,
      )}
    >
      {children}
    </p>
  );
}

/** A link inside a sentence — the only place the accent appears as text. */
export function EntryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-interactive focus-visible:ring-ring/80 rounded-lg font-medium underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:outline-none"
    >
      {children}
    </Link>
  );
}
