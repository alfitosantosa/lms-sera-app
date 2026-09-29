"use client";

import {
  useApproveReport,
  useGetReport,
  usePublishReport,
  useRegenerateNarrative,
  useReviewReport,
  useUpdateReport,
} from "@/app/(hooks)/hooks/Reports/useReports";
import {
  canDownloadReportPdf,
  useReportPdf,
} from "@/app/(hooks)/hooks/Reports/useReportPdf";
import {
  type ReportUpdateInput,
  type StudentReportDTO,
} from "@/app/(types)";
import {
  ReportCardEditor,
  useReportCardForm,
} from "@/components/development/report-card-editor";
import { ReportPreview } from "@/components/development/report-preview";
import { ReportStatusBadge } from "@/components/development/report-status-badge";
import Loading from "@/components/loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  Loader2,
  RefreshCw,
  Send,
  ShieldCheck,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback } from "react";

/** Label item kelengkapan rapor (PRD §71). */
const COMPLETION_ITEMS: {
  key: keyof NonNullable<StudentReportDTO["completion"]>;
  label: string;
}[] = [
  { key: "academic", label: "Nilai akademik" },
  { key: "assessment", label: "Penilaian perkembangan" },
  { key: "attendance", label: "Data kehadiran" },
  { key: "narrative", label: "Narasi guru" },
  { key: "review", label: "Tinjauan guru" },
];

export default function ReportEditorPage() {
  const params = useParams<{ id: string }>();
  const reportId = params?.id ?? "";

  const { data: report, isLoading, error } = useGetReport(reportId);
  const form = useReportCardForm(report);
  const { download, isGenerating } = useReportPdf();

  const update = useUpdateReport();
  const regenerate = useRegenerateNarrative();
  const review = useReviewReport();
  const approve = useApproveReport();
  const publish = usePublishReport();

  const busy =
    update.isPending ||
    regenerate.isPending ||
    review.isPending ||
    approve.isPending ||
    publish.isPending;

  const editable =
    report?.status === "DRAFT" || report?.status === "REVIEW";
  const downloadReady = report ? canDownloadReportPdf(report) : false;
  const completion = report?.completion ?? report?.snapshot?.completion ?? null;

  /** Kosongkan string kosong → `null` agar tidak menyimpan teks hampa. */
  const save = useCallback(
    async (values: ReportUpdateInput) => {
      if (!report) return;
      const normalize = (value: string | null | undefined) =>
        value && value.trim() !== "" ? value : null;
      const normalized = {
        teacherNarrative: normalize(values.teacherNarrative),
        homeroomNote: normalize(values.homeroomNote),
        principalNote: normalize(values.principalNote),
      };
      try {
        await update.mutateAsync({ id: report.id, ...normalized });
        // Baseline baru = nilai tersimpan; ketikan yang lebih baru tetap dirty
        // sehingga autosave tidak berputar tanpa henti.
        form.reset(
          {
            teacherNarrative: normalized.teacherNarrative ?? "",
            homeroomNote: normalized.homeroomNote ?? "",
            principalNote: normalized.principalNote ?? "",
          },
          { keepDirtyValues: true },
        );
      } catch {
        // Pesan server sudah ditampilkan `errorHandlerFrontend` di dalam hook.
      }
    },
    [form, report, update],
  );

  const submitReview = async () => {
    if (!report) return;
    await form.handleSubmit(save)();
    if (form.formState.isDirty) return; // validasi gagal — jangan lanjut
    try {
      await review.mutateAsync(report.id);
    } catch {
      // Pesan 409 dari server sudah ditampilkan hook.
    }
  };

  const run = async (action: () => Promise<unknown>) => {
    try {
      await action();
    } catch {
      // Pesan 409 dari server sudah ditampilkan hook.
    }
  };

  if (isLoading) return <Loading />;

  if (error || !report) {
    return (
      <div className="from-muted/40 to-muted/60 min-h-screen bg-linear-to-br">
        <div className="max-w-7xl space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Tidak dapat memuat rapor</AlertTitle>
            <AlertDescription>
              {error?.message ?? "Rapor tidak ditemukan."}
            </AlertDescription>
          </Alert>
          <Button asChild variant="outline">
            <Link href="/dashboard/teacher/development/reports">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke daftar rapor
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="from-muted/40 to-muted/60 min-h-screen bg-linear-to-br">
      <div className="max-w-7xl space-y-6">
        {/* ── Kepala ── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-foreground text-3xl font-bold">
                {report.student?.name ?? "Rapor"}
              </h1>
              <ReportStatusBadge status={report.status} />
            </div>
            <p className="text-muted-foreground">
              {report.class?.name ?? "-"}
              {report.period ? ` · ${report.period.name}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/teacher/development/reports">
                <ArrowLeft className="h-4 w-4" />
                Daftar rapor
              </Link>
            </Button>
            <Button
              variant="outline"
              disabled={!downloadReady || isGenerating}
              title={
                downloadReady
                  ? "Unduh PDF rapor"
                  : "PDF hanya tersedia setelah rapor disetujui"
              }
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
        </div>

        <Tabs defaultValue="editor">
          <TabsList>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Pratinjau Cetak</TabsTrigger>
          </TabsList>

          {/* ══════════ EDITOR ══════════ */}
          <TabsContent value="editor" className="space-y-6 pt-4">
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              {/* ── Hasil perkembangan + narasi ── */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Hasil Perkembangan
                    </CardTitle>
                    <CardDescription>
                      Capaian per area pengembangan pada periode ini.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {report.snapshot ? (
                      report.snapshot.development.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                          Belum ada data perkembangan.
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Area</TableHead>
                              <TableHead>Indikator</TableHead>
                              <TableHead>Skala</TableHead>
                              <TableHead>Catatan</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {report.snapshot.development.map((area) =>
                              area.indicators.length === 0 ? (
                                <TableRow key={area.area}>
                                  <TableCell className="font-medium">
                                    {area.area}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    -
                                  </TableCell>
                                  <TableCell>
                                    {area.finalScale?.label ?? "-"}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    -
                                  </TableCell>
                                </TableRow>
                              ) : (
                                area.indicators.map((indicator, index) => (
                                  <TableRow
                                    key={`${area.area}-${indicator.indicator}-${index}`}
                                  >
                                    <TableCell className="font-medium">
                                      {index === 0 ? area.area : ""}
                                    </TableCell>
                                    <TableCell>{indicator.indicator}</TableCell>
                                    <TableCell>{indicator.scale}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {indicator.note ?? "-"}
                                    </TableCell>
                                  </TableRow>
                                ))
                              ),
                            )}
                          </TableBody>
                        </Table>
                      )
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Rincian belum tersedia</AlertTitle>
                        <AlertDescription>
                          Rapor baru berstatus{" "}
                          {report.status === "DRAFT" ? "draft" : "tinjauan"} —
                          snapshot hasil perkembangan dibekukan saat rapor
                          disetujui.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Narasi &amp; Catatan
                    </CardTitle>
                    <CardDescription>
                      Narasi selalu berupa draft yang harus ditinjau guru
                      sebelum disetujui.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReportCardEditor
                      form={form}
                      editable={editable}
                      isSaving={update.isPending}
                      onSave={save}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* ── Kelengkapan + alur kerja ── */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Kelengkapan</CardTitle>
                    <CardDescription>
                      {completion
                        ? `${completion.percent}% lengkap`
                        : "Belum ada data kelengkapan"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Progress value={completion?.percent ?? 0} />
                    <ul className="space-y-1 text-sm">
                      {COMPLETION_ITEMS.map((item) => {
                        const done = Boolean(completion?.[item.key]);
                        return (
                          <li
                            key={item.key}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle2
                              className={
                                done
                                  ? "h-4 w-4 text-emerald-600"
                                  : "text-muted-foreground/40 h-4 w-4"
                              }
                            />
                            <span
                              className={done ? "" : "text-muted-foreground"}
                            >
                              {item.label}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Alur Rapor</CardTitle>
                    <CardDescription>
                      Urutan wajib: Draft → Tinjau → Setujui → Publikasi.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    {editable && (
                      <Button
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          void run(() => regenerate.mutateAsync(report.id))
                        }
                      >
                        {regenerate.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        Regenerate Draft
                      </Button>
                    )}

                    {report.status === "DRAFT" && (
                      <Button disabled={busy} onClick={() => void submitReview()}>
                        {review.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Submit Review
                      </Button>
                    )}

                    {report.status === "REVIEW" && (
                      <Button
                        disabled={busy}
                        onClick={() =>
                          void run(() => approve.mutateAsync(report.id))
                        }
                      >
                        {approve.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-4 w-4" />
                        )}
                        Approve
                      </Button>
                    )}

                    {report.status === "APPROVED" && (
                      <Button
                        disabled={busy}
                        onClick={() =>
                          void run(() => publish.mutateAsync(report.id))
                        }
                      >
                        {publish.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        Publish
                      </Button>
                    )}

                    {!editable && (
                      <p className="text-muted-foreground text-xs">
                        Rapor sudah dikunci. Perubahan status hanya bisa
                        dilakukan oleh tahap berikutnya.
                      </p>
                    )}

                    {report.approvedBy && report.approvedAt && (
                      <p className="text-muted-foreground text-xs">
                        Disetujui oleh {report.approvedBy.name} pada{" "}
                        {format(new Date(report.approvedAt), "d MMM yyyy", {
                          locale: localeId,
                        })}
                      </p>
                    )}
                    {report.publishedAt && (
                      <p className="text-muted-foreground text-xs">
                        Dipublikasikan{" "}
                        {format(new Date(report.publishedAt), "d MMM yyyy", {
                          locale: localeId,
                        })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ══════════ PRATINJAU ══════════ */}
          <TabsContent value="preview" className="pt-4">
            {report.snapshot ? (
              <ReportPreview
                snapshot={report.snapshot}
                context={{
                  teacherNarrative: report.teacherNarrative,
                  homeroomNote: report.homeroomNote,
                  principalNote: report.principalNote,
                  approvedByName: report.approvedBy?.name ?? null,
                }}
              />
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Pratinjau belum tersedia</AlertTitle>
                <AlertDescription>
                  Pratinjau cetak dibangun dari snapshot tersimpan, yang
                  dibekukan saat rapor disetujui.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
