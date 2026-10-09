"use client";

import { useAccessibleClasses } from "@/app/(hooks)/hooks/Development/useClassProgress";
import { useGetPeriods } from "@/app/(hooks)/hooks/Development/useDevelopmentConfig";
import {
  useGenerateReports,
  useGetReports,
} from "@/app/(hooks)/hooks/Reports/useReports";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSession } from "@/lib/betterauth/authClients";
import { AlertCircle, Eye, FilePlus2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 20;

export default function TeacherReportsPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const { data: userData, isLoading: isLoadingUser } = useGetUserByIdBetterAuth(
    session?.user?.id ?? "",
  );
  const { classes, isLoading: isLoadingClasses } =
    useAccessibleClasses(userData);

  const { data: periods = [] } = useGetPeriods();

  const [classId, setClassId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!classId && classes.length > 0) setClassId(classes[0].id);
  }, [classes, classId]);

  // Default: periode yang sedang dibuka, kalau tidak ada pakai yang terbaru.
  useEffect(() => {
    if (periodId || periods.length === 0) return;
    const sorted = [...periods].sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );
    const open = sorted.find((period) => period.status === "OPEN");
    setPeriodId((open ?? sorted[0]).id);
  }, [periods, periodId]);

  // Filter berubah → kembali ke halaman 1 supaya tidak menampilkan halaman kosong.
  useEffect(() => setPage(1), [classId, periodId]);

  const ready = Boolean(classId && periodId);
  const { data, isLoading, error } = useGetReports({
    classId,
    periodId,
    page,
    limit: PAGE_SIZE,
    enabled: ready,
  });
  const generate = useGenerateReports();

  const reports = data?.data ?? [];
  const total = data?.pagination.total ?? 0;
  const hasMore = data?.pagination.hasMore ?? false;

  const handleGenerate = async () => {
    if (!ready) return;
    try {
      const result = await generate.mutateAsync({ classId, periodId });
      const failed = result.errors.length;
      toast.success(
        `Rapor dibuat: ${result.created} baru, ${result.updated} diperbarui.` +
          (failed > 0 ? ` ${failed} siswa gagal.` : ""),
      );
    } catch {
      // Pesan error server sudah ditampilkan `errorHandlerFrontend` di hook.
    }
  };

  if (isSessionPending || isLoadingUser || isLoadingClasses) {
    return <Loading />;
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl space-y-6">
        <div>
          <h1 className="text-foreground text-3xl font-semibold tracking-tight">Rapor Siswa</h1>
          <p className="text-muted-foreground">
            Draft rapor per kelas dan periode, dengan alur tinjau → setujui →
            publikasi.
          </p>
        </div>

        {classes.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Belum ada kelas</AlertTitle>
            <AlertDescription>
              Anda belum memiliki jadwal mengajar.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-end justify-between gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-xs">Kelas</span>
                    <Select value={classId} onValueChange={setClassId}>
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Pilih kelas" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-xs">
                      Periode
                    </span>
                    <Select value={periodId} onValueChange={setPeriodId}>
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Pilih periode" />
                      </SelectTrigger>
                      <SelectContent>
                        {periods.map((period) => (
                          <SelectItem key={period.id} value={period.id}>
                            {period.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!ready || generate.isPending}
                >
                  {generate.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FilePlus2 className="h-4 w-4" />
                  )}
                  Buat Draf Rapor
                </Button>
              </CardHeader>
              <CardDescription className="px-6 pb-4">
                Tombol ini membuat/menyegarkan draft rapor seluruh siswa di
                kelas ini. Narasi tidak diubah otomatis.
              </CardDescription>
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Gagal memuat daftar rapor</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daftar Rapor</CardTitle>
                <CardDescription>
                  {isLoading
                    ? "Memuat rapor..."
                    : `${total} rapor pada kelas dan periode ini`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-hidden rounded-3xl border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Siswa</TableHead>
                        <TableHead>NISN</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-muted-foreground h-24 text-center"
                          >
                            Memuat rapor...
                          </TableCell>
                        </TableRow>
                      ) : reports.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-muted-foreground h-24 text-center"
                          >
                            Belum ada rapor. Klik &ldquo;Buat Draf
                            Rapor&rdquo; untuk membuat draft.
                          </TableCell>
                        </TableRow>
                      ) : (
                        reports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">
                              {report.student?.name ?? "-"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {report.student?.nisn ?? "-"}
                            </TableCell>
                            <TableCell>
                              {report.class?.name ?? "-"}
                            </TableCell>
                            <TableCell>
                              <ReportStatusBadge status={report.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="outline" size="sm">
                                <Link
                                  href={`/dashboard/teacher/development/reports/${report.id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                  Buka
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {total > 0 && (
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-xs">
                      Menampilkan {reports.length} dari {total} rapor
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1 || isLoading}
                        onClick={() => setPage((current) => current - 1)}
                      >
                        Sebelumnya
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!hasMore || isLoading}
                        onClick={() => setPage((current) => current + 1)}
                      >
                        Berikutnya
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
