"use client";

import {
  useGetClassProgress,
  useAccessibleClasses,
} from "@/app/(hooks)/hooks/Development/useClassProgress";
import { useGetPeriods } from "@/app/(hooks)/hooks/Development/useDevelopmentConfig";
import { useGetDailyLogs } from "@/app/(hooks)/hooks/Development/useDailyLogs";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import Loading from "@/components/loading";
import { DailyLogTable } from "@/components/development/daily-log-table";
import { QuickLogDialog } from "@/components/development/quick-log-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/authClients";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  AlertCircle,
  CalendarPlus,
  ClipboardList,
  GraduationCap,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TeacherDevelopmentPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const { data: userData, isLoading: isLoadingUser } = useGetUserByIdBetterAuth(
    session?.user?.id ?? "",
  );
  const { classes, isLoading: isLoadingClasses } =
    useAccessibleClasses(userData);

  const [classId, setClassId] = useState("");
  const [quickLogOpen, setQuickLogOpen] = useState(false);

  useEffect(() => {
    if (!classId && classes.length > 0) setClassId(classes[0].id);
  }, [classes, classId]);

  const {
    data: progress,
    isLoading: isLoadingProgress,
    error: progressError,
  } = useGetClassProgress(classId);
  const { data: periods = [] } = useGetPeriods({ status: "OPEN" });
  const { data: recentLogs, isLoading: isLoadingLogs } = useGetDailyLogs({
    classId,
    limit: 10,
    enabled: classId !== "",
  });

  const activePeriod = periods[0];

  if (isSessionPending || isLoadingUser || isLoadingClasses) {
    return <Loading />;
  }

  return (
    <div className="from-muted/40 to-muted/60 min-h-screen bg-linear-to-br">
      <div className="max-w-7xl">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <GraduationCap className="text-primary h-8 w-8" />
            <h1 className="text-foreground text-4xl font-bold">
              Pengembangan Siswa
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Pantau dan catat perkembangan siswa di kelas yang Anda ajar
          </p>
        </div>

        {classes.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Belum ada kelas</AlertTitle>
            <AlertDescription>
              Anda belum memiliki jadwal mengajar, jadi belum ada kelas yang
              bisa dicatat perkembangannya.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ClipboardList className="h-4 w-4" />
                    Pilih Kelas
                  </CardTitle>
                  <CardDescription>
                    Hanya kelas yang Anda ajar yang ditampilkan
                  </CardDescription>
                </div>
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
              </CardHeader>
              <CardContent>
                {activePeriod ? (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="secondary">Periode dibuka</Badge>
                    <span className="font-medium">{activePeriod.name}</span>
                    <span className="text-muted-foreground">
                      {format(new Date(activePeriod.startDate), "d MMM yyyy", {
                        locale: localeId,
                      })}{" "}
                      –{" "}
                      {format(new Date(activePeriod.endDate), "d MMM yyyy", {
                        locale: localeId,
                      })}
                    </span>
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Periode penilaian belum dibuka</AlertTitle>
                    <AlertDescription>
                      Log harian tidak dapat disimpan sebelum admin membuka
                      periode penilaian.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {progressError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Gagal memuat data kelas</AlertTitle>
                <AlertDescription>{progressError.message}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Jumlah Siswa</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {progress?.totalStudents ?? 0}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Sudah Dicatat Hari Ini</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-success-strong text-3xl font-bold">
                    {progress?.loggedToday ?? 0}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Belum Dicatat</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-warning-strong text-3xl font-bold">
                    {progress?.pendingToday ?? 0}
                  </p>
                  <Progress value={progress?.percentLogbook ?? 0} />
                  <p className="text-muted-foreground text-xs">
                    {progress?.percentLogbook ?? 0}% logbook hari ini
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Aksi Cepat</CardTitle>
                <CardDescription>
                  Catat perkembangan tanpa berpindah halaman
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link
                    href={`/dashboard/teacher/development/logbook?classId=${classId}`}
                  >
                    <CalendarPlus className="h-4 w-4" />+ Daily Log
                  </Link>
                </Button>
                <Button
                  type="button"
                  onClick={() => setQuickLogOpen(true)}
                  disabled={!classId}
                >
                  <Zap className="h-4 w-4" />+ Quick Log
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h2 className="text-foreground text-xl font-semibold">
                Aktivitas Terbaru
              </h2>
              <p className="text-muted-foreground text-sm">
                10 log terbaru dari{" "}
                {recentLogs?.pagination?.total ?? recentLogs?.data?.length ?? 0}{" "}
                log kelas ini.
              </p>
              <DailyLogTable
                logs={recentLogs?.data ?? []}
                isLoading={isLoadingProgress || isLoadingLogs}
                emptyMessage="Belum ada log harian di kelas ini."
                total={recentLogs?.pagination?.total}
              />
            </div>
          </div>
        )}

        <QuickLogDialog
          open={quickLogOpen}
          onOpenChange={setQuickLogOpen}
          classId={classId}
          students={progress?.students ?? []}
        />
      </div>
    </div>
  );
}
