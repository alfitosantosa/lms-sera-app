import {
  REPORT_STATUS_LABELS,
  type ReportStatusTypes,
} from "@/app/(types)";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/shadCN/utils";

/**
 * Warna status rapor. Label selalu dari `REPORT_STATUS_LABELS` (satu sumber),
 * hanya tone visual yang ditentukan di sini.
 */
const STATUS_STYLES: Record<ReportStatusTypes, string> = {
  DRAFT: "border-border bg-muted text-muted-foreground",
  REVIEW: "border-warning-border bg-warning-chip text-warning-strong",
  APPROVED: "border-success-border bg-success-chip text-success-strong",
  PUBLISHED: "border-info-border bg-info-chip text-info-strong",
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
