"use client";

import {
  useAccessibleClasses,
  useGetClassProgress,
} from "@/app/(hooks)/hooks/Development/useClassProgress";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import Loading from "@/components/loading";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSession } from "@/lib/authClients";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { AlertCircle, Eye } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DevelopmentStudentsPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const { data: userData, isLoading: isLoadingUser } = useGetUserByIdBetterAuth(
    session?.user?.id ?? "",
  );
  const { classes, isLoading: isLoadingClasses } =
    useAccessibleClasses(userData);

  const [classId, setClassId] = useState("");

  useEffect(() => {
    if (!classId && classes.length > 0) setClassId(classes[0].id);
  }, [classes, classId]);

  const {
    data: progress,
    isLoading: isLoadingProgress,
    error: progressError,
  } = useGetClassProgress(classId);

  if (isSessionPending || isLoadingUser || isLoadingClasses) {
    return <Loading />;
  }

  return (
    <div className="from-muted/40 to-muted/60 min-h-screen bg-linear-to-br">
      <div className="max-w-7xl space-y-6">
        <div>
          <h1 className="text-foreground text-3xl font-bold">
            Perkembangan Siswa
          </h1>
          <p className="text-muted-foreground">
            Progres logbook tiap siswa di kelas yang Anda ajar.
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
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base">Kelas</CardTitle>
                  <CardDescription>
                    {progress
                      ? `${progress.totalStudents} siswa`
                      : "Memuat data kelas..."}
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
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Logbook hari ini</span>
                    <span className="text-muted-foreground">
                      {progress?.percentLogbook ?? 0}%
                    </span>
                  </div>
                  <Progress value={progress?.percentLogbook ?? 0} />
                  <p className="text-muted-foreground text-xs">
                    {progress?.loggedToday ?? 0} dari{" "}
                    {progress?.totalStudents ?? 0} siswa sudah dicatat hari ini
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Penilaian</span>
                    <span className="text-muted-foreground">
                      {progress?.percentAssessment ?? 0}%
                    </span>
                  </div>
                  <Progress value={progress?.percentAssessment ?? 0} />
                  <p className="text-muted-foreground text-xs">
                    Capaian indikator pada periode penilaian aktif
                  </p>
                </div>
              </CardContent>
            </Card>

            {progressError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Gagal memuat data kelas</AlertTitle>
                <AlertDescription>{progressError.message}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daftar Siswa</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingProgress ? (
                  <p className="text-muted-foreground text-sm">
                    Memuat siswa...
                  </p>
                ) : (progress?.students ?? []).length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Belum ada siswa di kelas ini.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>NISN</TableHead>
                        <TableHead>Jumlah Log</TableHead>
                        <TableHead>Terakhir Dicatat</TableHead>
                        <TableHead>Hari Ini</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(progress?.students ?? []).map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {student.nisn ?? "-"}
                          </TableCell>
                          <TableCell>{student.logCount}</TableCell>
                          <TableCell>
                            {student.lastLogAt
                              ? format(
                                  new Date(student.lastLogAt),
                                  "d MMM yyyy",
                                  { locale: localeId },
                                )
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {student.hasLogToday ? (
                              <Badge variant="secondary">Sudah</Badge>
                            ) : (
                              <Badge variant="outline">Belum</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="outline" size="sm">
                              <Link
                                href={`/dashboard/teacher/development/students/${student.id}`}
                              >
                                <Eye className="h-4 w-4" />
                                Profil
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
