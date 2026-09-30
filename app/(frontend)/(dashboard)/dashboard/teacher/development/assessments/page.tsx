"use client";

import { useAccessibleClasses } from "@/app/(hooks)/hooks/Development/useClassProgress";
import {
  useGetAreas,
  useGetPeriods,
  useGetScales,
} from "@/app/(hooks)/hooks/Development/useDevelopmentConfig";
import {
  useBulkUpsertAssessments,
  useGetClassMatrix,
  useUpsertAssessment,
} from "@/app/(hooks)/hooks/Development/useAssessments";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { AssessmentMatrix } from "@/components/development/assessment-matrix";
import Loading from "@/components/loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { useSession } from "@/lib/authClients";
import { ASSESSMENT_PERIOD_STATUS_LABELS } from "@/app/(types)";
import { AlertCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";

export default function TeacherAssessmentsPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const { data: userData, isLoading: isLoadingUser } = useGetUserByIdBetterAuth(
    session?.user?.id ?? "",
  );
  const { classes, isLoading: isLoadingClasses } =
    useAccessibleClasses(userData);

  const { data: periods = [] } = useGetPeriods();
  const { data: areas = [] } = useGetAreas({ isActive: true });
  const { data: scales = [] } = useGetScales({ isActive: true });

  const [classId, setClassId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [areaId, setAreaId] = useState("");

  useEffect(() => {
    if (!classId && classes.length > 0) setClassId(classes[0].id);
  }, [classes, classId]);

  // Default: periode yang sedang dibuka, kalau tidak ada pakai yang terbaru.
  useEffect(() => {
    if (periodId || periods.length === 0) return;
    const sorted = [...periods].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );
    const open = sorted.find((period) => period.status === "OPEN");
    setPeriodId((open ?? sorted[0]).id);
  }, [periods, periodId]);

  useEffect(() => {
    if (!areaId && areas.length > 0) setAreaId(areas[0].id);
  }, [areas, areaId]);

  const matrixQuery = useGetClassMatrix({ classId, periodId, areaId });
  const matrix = matrixQuery.data;
  const upsert = useUpsertAssessment();
  const bulk = useBulkUpsertAssessments();

  const locked =
    matrix?.period?.status === "LOCKED" || matrix?.period?.status === "PUBLISHED";

  if (isSessionPending || isLoadingUser || isLoadingClasses) {
    return <Loading />;
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl space-y-6">
        <div>
          <h1 className="text-foreground text-3xl font-semibold tracking-tight">
            Penilaian Perkembangan
          </h1>
          <p className="text-muted-foreground">
            Isi capaian per indikator untuk seluruh siswa di kelas yang Anda ajar.
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
              <CardHeader>
                <CardTitle className="text-base">Pilih Data</CardTitle>
                <CardDescription>
                  Kelas, periode penilaian, dan area pengembangan
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs">Kelas</span>
                  <Select value={classId} onValueChange={setClassId}>
                    <SelectTrigger className="w-full">
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
                  <span className="text-muted-foreground text-xs">Periode</span>
                  <Select value={periodId} onValueChange={setPeriodId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih periode" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((period) => (
                        <SelectItem key={period.id} value={period.id}>
                          {period.name} (
                          {ASSESSMENT_PERIOD_STATUS_LABELS[period.status] ??
                            period.status}
                          )
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs">Area</span>
                  <Select value={areaId} onValueChange={setAreaId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih area" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {locked && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Periode sudah dikunci</AlertTitle>
                <AlertDescription>
                  Penilaian pada periode{" "}
                  {ASSESSMENT_PERIOD_STATUS_LABELS[matrix?.period?.status ?? ""] ??
                    matrix?.period?.status}
                  {" "}
                  tidak dapat diubah.
                </AlertDescription>
              </Alert>
            )}

            {matrixQuery.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Gagal memuat matriks penilaian</AlertTitle>
                <AlertDescription>{matrixQuery.error.message}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base">Matriks Penilaian</CardTitle>
                  <CardDescription>
                    {matrix
                      ? `${matrix.students.length} siswa × ${matrix.indicators.length} indikator`
                      : "Memuat data..."}
                  </CardDescription>
                </div>
                {matrix?.period && (
                  <Badge variant="secondary">{matrix.period.name}</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {matrixQuery.isLoading ? (
                  <p className="text-muted-foreground text-sm">
                    Memuat matriks...
                  </p>
                ) : matrix && matrix.students.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Belum ada siswa di kelas ini.
                  </p>
                ) : matrix ? (
                  <>
                    <p className="text-muted-foreground flex items-center gap-2 text-xs">
                      <Info className="h-3.5 w-3.5" />
                      Klik tombol skala pada sel untuk menyimpan. Gunakan panah
                      untuk berpindah sel; &ldquo;Isi semua&rdquo; mengisi satu
                      indikator untuk seluruh siswa.
                    </p>
                    <AssessmentMatrix
                      matrix={matrix}
                      scales={scales.map((scale) => ({
                        id: scale.id,
                        label: scale.label,
                        color: scale.color,
                      }))}
                      disabled={locked || scales.length === 0}
                      onSelect={async (entry) => {
                        const saved = await upsert.mutateAsync({
                          studentId: entry.studentId,
                          periodId: matrix.period?.id ?? periodId,
                          indicatorId: entry.indicatorId,
                          scaleId: entry.scaleId,
                        });
                        // Sel menunggu data server sebelum override optimistik
                        // dilepas (lihat AssessmentMatrix) agar tidak berkedip.
                        await matrixQuery.refetch();
                        return saved;
                      }}
                      onBulkApply={(indicatorId, scaleId) =>
                        bulk.mutateAsync({
                          classId,
                          periodId,
                          indicatorId,
                          entries: matrix.students.map((student) => ({
                            studentId: student.id,
                            scaleId,
                          })),
                        })
                      }
                    />
                  </>
                ) : null}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
