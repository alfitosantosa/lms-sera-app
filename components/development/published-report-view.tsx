"use client";

import {
  canDownloadReportPdf,
  useReportPdf,
} from "@/app/(hooks)/hooks/Reports/useReportPdf";
import { useGetReport } from "@/app/(hooks)/hooks/Reports/useReports";
import { ReportPreview } from "@/components/development/report-preview";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { reportPdfContext } from "@/lib/report/report.pdf.data";
import { AlertCircle, Download, Loader2 } from "lucide-react";

/**
 * Rapor terbit yang dibaca orang tua/siswa: pratinjau dari `snapshot`
 * tersimpan + unduh PDF (pemetaan Task 7, bukan turunan baru).
 *
 * Detail diambil lewat `GET /api/reports/[id]` — backend hanya mengembalikan
 * rapor `PUBLISHED` milik anak sendiri; status lain dijawab 404 (bukan versi
 * tersunting) dan pesannya ditampilkan apa adanya.
 */
export function PublishedReportView({ reportId }: { reportId: string }) {
  const { data: report, isLoading, error } = useGetReport(reportId);
  const { download, isGenerating } = useReportPdf();

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="text-destructive h-4 w-4" />
            Rapor tidak dapat dibuka
          </CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!report) return null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          {report.student?.name ?? ""}
          {report.period?.name ? ` • ${report.period.name}` : ""}
        </p>
        <Button
          variant="outline"
          disabled={!canDownloadReportPdf(report) || isGenerating}
          onClick={() => void download(report)}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Unduh PDF
        </Button>
      </div>

      {report.snapshot ? (
        <ReportPreview
          snapshot={report.snapshot}
          context={reportPdfContext(report)}
        />
      ) : (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center text-sm">
            Isi rapor belum tersedia.
          </CardContent>
        </Card>
      )}
    </>
  );
}
