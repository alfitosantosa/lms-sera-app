"use client";

import { createPDFReportCard } from "@/app/(action)/createPDF/ReportCard/studentReport";
import { type StudentReportDTO } from "@/app/(types)";
import { errorHandlerFrontend } from "@/lib/errorHandlerFrontend";
import { reportPdfContext, toReportPdfData } from "@/lib/report/report.pdf.data";
import { useCallback, useState } from "react";
import { toast } from "sonner";

/** Status yang boleh diunduh — dokumen hanya terbit setelah snapshot membeku. */
export const REPORT_PDF_STATUSES = ["APPROVED", "PUBLISHED"] as const;

export const canDownloadReportPdf = (report: StudentReportDTO): boolean =>
  (REPORT_PDF_STATUSES as readonly string[]).includes(report.status) &&
  Boolean(report.snapshot);

/**
 * Pembungkus unduh PDF rapor. Selalu memetakan dari `snapshot` tersimpan —
 * tidak pernah menghitung ulang agregat di klien — dan menolak status yang
 * belum disetujui dengan pesan Bahasa Indonesia.
 */
export function useReportPdf() {
  const [isGenerating, setIsGenerating] = useState(false);

  const download = useCallback(async (report: StudentReportDTO) => {
    if (!(REPORT_PDF_STATUSES as readonly string[]).includes(report.status)) {
      toast.error(
        "Rapor belum disetujui. PDF hanya dapat diunduh setelah rapor disetujui.",
      );
      return false;
    }
    if (!report.snapshot) {
      toast.error("Snapshot rapor belum tersedia.");
      return false;
    }

    setIsGenerating(true);
    try {
      const data = toReportPdfData(report.snapshot, reportPdfContext(report));
      await createPDFReportCard(data);
      return true;
    } catch (error) {
      errorHandlerFrontend(error);
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { download, isGenerating };
}
