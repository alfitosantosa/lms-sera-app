import type { ProductStatus } from "@/lib/marketing/products";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<ProductStatus, { label: string; className: string }> = {
  tersedia: {
    label: "Tersedia",
    className:
      "bg-success-chip text-success-strong border-success-border",
  },
  pengembangan: {
    label: "Dalam pengembangan",
    className:
      "bg-warning-chip text-warning-strong border-warning-border",
  },
  kustom: {
    label: "Proyek kustom",
    className: "bg-info-chip text-info-strong border-info-border",
  },
};

/**
 * Chip status ketersediaan modul — dipakai katalog dan halaman produk, jadi
 * gayanya satu tempat.
 */
export function StatusChip({
  status,
  className,
}: {
  status: ProductStatus;
  className?: string;
}) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        style.className,
        className,
      )}
    >
      {style.label}
    </span>
  );
}
