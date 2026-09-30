import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export const CLIENT_NAME = process.env.NEXT_PUBLIC_CLIENT_NAME || "Yayasan";

/**
 * The entry screens are the same object as the landing's register: a sheet of
 * paper on the desk, bounded by rules instead of floating on a shadow. See
 * DESIGN.md §3 — every rule below separates two pieces of data.
 */
export function SheetPage({ children }: { children: ReactNode }) {
  return (
    <div className="bg-secondary min-h-[100dvh] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-[44rem]">
        <Link
          href="/"
          className="text-secondary-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-sm text-xs font-medium underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:outline-none"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke beranda
        </Link>

        {children}
      </div>
    </div>
  );
}

/** The head of a printed form: heavy top rule, then whose form it is. */
export function SheetMasthead({ label }: { label: string }) {
  return (
    <div className="border-foreground mt-5 border-t-2 pt-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <span className="font-display text-[11px] tracking-wide">{label}</span>
        <span className="font-display text-muted-foreground text-[11px] tracking-wide">
          {CLIENT_NAME.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

/** The sheet itself: one bounded column of form. */
export function Sheet({ children }: { children: ReactNode }) {
  return <div className="border-border bg-card mt-3 border">{children}</div>;
}

export function SheetHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-6 py-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-balance">
        {title}
      </h1>
      <p className="text-secondary-foreground mt-2 max-w-[68ch] text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

/** A section of the form, named the way a printed form names its parts. */
export function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={label} className="border-border border-t px-6 py-6">
      <h2 className="font-display text-muted-foreground text-[11px] tracking-wide">
        {label}
      </h2>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  );
}

/** The foot of the sheet: what else you can do on the left, the verb on the right. */
export function SheetActions({
  aside,
  children,
}: {
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="border-border bg-secondary/40 flex flex-col gap-4 border-t px-6 py-5 sm:flex-row sm:items-center sm:gap-8">
      {aside ? (
        <div className="text-muted-foreground text-xs">{aside}</div>
      ) : null}
      <div className="sm:ml-auto">{children}</div>
    </div>
  );
}
