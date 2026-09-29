import {
  REPORT_STATUS_LABELS,
  type ReportStatusTypes,
} from "@/app/(types)";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Warna status rapor. Label selalu dari `REPORT_STATUS_LABELS` (satu sumber),
 * hanya tone visual yang ditentukan di sini.
 */
const STATUS_STYLES: Record<ReportStatusTypes, string> = {
  DRAFT: "border-slate-300 bg-slate-100 text-slate-700",
  REVIEW: "border-amber-300 bg-amber-100 text-amber-800",
  APPROVED: "border-emerald-300 bg-emerald-100 text-emerald-800",
  PUBLISHED: "border-blue-300 bg-blue-100 text-blue-800",
};

export function ReportStatusBadge({
  status,
  className,
}: {
  status: ReportStatusTypes;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(STATUS_STYLES[status], "font-medium", className)}
    >
      {REPORT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
