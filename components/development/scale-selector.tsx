"use client";

import { cn } from "@/lib/utils";

export type ScaleOption = { id: string; label: string; color: string | null };

type ScaleSelectorProps = {
  scales: ScaleOption[];
  value: string | null;
  onChange: (scaleId: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
};

/**
 * Toggle group skala penilaian. Warna diambil dari `AssessmentScale.color`;
 * tanpa warna (null) memakai warna teks netral (`currentColor`).
 */
export function ScaleSelector({
  scales,
  value,
  onChange,
  disabled = false,
  ariaLabel,
  className,
}: ScaleSelectorProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel ?? "Pilih skala penilaian"}
      className={cn("flex flex-wrap items-center gap-1", className)}
    >
      {scales.map((scale) => {
        const active = scale.id === value;
        return (
          <button
            key={scale.id}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            title={scale.label}
            onClick={() => onChange(scale.id)}
            className={cn(
              "focus-visible:ring-ring/80 inline-flex items-center gap-1 rounded-lg border px-1.5 py-0.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
              active
                ? "bg-muted text-foreground border-transparent"
                : "border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              disabled && "cursor-not-allowed opacity-50",
            )}
            style={
              active && scale.color
                ? { boxShadow: `inset 0 0 0 2px ${scale.color}` }
                : undefined
            }
          >
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: scale.color ?? "currentColor" }}
            />
            {scale.label}
          </button>
        );
      })}
    </div>
  );
}
