"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

/**
 * Body error modul ujian dari backend: `{ success: false, message }`.
 * `apiGet`/`apiPost` tidak melempar pada status non-2xx, jadi body error harus
 * dideteksi manual supaya halaman tidak menampilkan DTO palsu.
 */
export type ExamApiErrorBody = { success: false; message: string };

export function isExamApiError(value: unknown): value is ExamApiErrorBody {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { success?: unknown; message?: unknown };
  return candidate.success === false && typeof candidate.message === "string";
}

/** Pesan error dari body API, atau `fallback` bila body bukan envelope error. */
export function examErrorMessage(value: unknown, fallback: string): string {
  return isExamApiError(value) ? value.message : fallback;
}

/** Format tanggal + jam, mis. "28 September 2026 08.30". */
export function formatExamDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** State 403/404: ujian tidak tersedia / tidak boleh diakses. */
export function ExamStateUnavailable({
  message = "Ujian tidak tersedia",
  backHref = "/dashboard/student/exam",
  backLabel = "Kembali ke Daftar Ujian",
  onRetry,
}: {
  message?: string;
  backHref?: string;
  backLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="mx-auto max-w-lg">
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <AlertCircle className="text-destructive size-10" />
        <p className="text-lg font-medium">{message}</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button asChild variant="outline">
            <Link href={backHref}>{backLabel}</Link>
          </Button>
          {onRetry && <Button onClick={onRetry}>Coba Lagi</Button>}
        </div>
      </CardContent>
    </Card>
  );
}

/** Skeleton daftar/kartu saat memuat. */
export function ExamStateSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: cards }).map((_, index) => (
        <Card key={index}>
          <CardContent className="space-y-3 py-6">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
