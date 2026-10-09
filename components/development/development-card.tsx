"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/shadCN/utils";

export type DevelopmentCardScale = {
  label: string;
  color: string | null;
};

type DevelopmentCardProps = {
  areaName: string;
  scale?: DevelopmentCardScale | null;
  description?: string | null;
};

/**
 * Kartu perkembangan satu area dengan skala terakhir.
 * Warna/label selalu berasal dari baris `AssessmentScale` — tidak ada kode
 * skala yang ditulis di UI.
 */
export function DevelopmentCard({
  areaName,
  scale,
  description,
}: DevelopmentCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{areaName}</CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {scale ? (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
              !scale.color && "bg-muted text-muted-foreground",
            )}
            style={
              scale.color
                ? { backgroundColor: scale.color, color: "#fff" }
                : undefined
            }
          >
            {scale.label}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">
            Belum ada catatan
          </span>
        )}
      </CardContent>
    </Card>
  );
}
