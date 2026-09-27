"use client";

import {
  type AttemptStatusTypes,
  type ExamResultsDTO,
} from "@/app/(types)/types/exam-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toPercentage } from "@/lib/exam/exam.grading";

const ATTEMPT_STATUS_LABELS: Record<AttemptStatusTypes, string> = {
  IN_PROGRESS: "Sedang Mengerjakan",
  SUBMITTED: "Dikumpulkan",
  GRADED: "Sudah Dinilai",
};

const formatScore = (score: number | null) =>
  score === null ? "-" : String(score);

/** Tabel hasil ujian + daftar siswa yang belum mengerjakan. */
export function ExamResultsTable({ data }: { data: ExamResultsDTO }) {
  const scoredRows = data.rows.filter((row) => row.score !== null);
  const averageScore = scoredRows.length
    ? Math.round(
        scoredRows.reduce((sum, row) => sum + (row.score ?? 0), 0) /
          scoredRows.length,
      )
    : null;
  const passedCount = data.rows.filter((row) => row.passed === true).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-normal">
              Jumlah Peserta
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {data.rows.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-normal">
              Rata-rata Skor
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {averageScore === null ? "-" : `${averageScore} / ${data.exam.maxScore}`}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-normal">
              Lulus
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {passedCount} siswa
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-normal">
              Belum Mengerjakan
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {data.notAttempted.length} siswa
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Hasil Pengerjaan</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>NISN</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Skor</TableHead>
                <TableHead className="text-center">Persentase</TableHead>
                <TableHead className="text-center">Kelulusan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-muted-foreground py-8 text-center"
                  >
                    Belum ada siswa yang mengerjakan ujian ini.
                  </TableCell>
                </TableRow>
              ) : (
                data.rows.map((row) => (
                  <TableRow key={row.attemptId}>
                    <TableCell className="font-medium">
                      {row.studentName}
                    </TableCell>
                    <TableCell>{row.nisn ?? "-"}</TableCell>
                    <TableCell>{row.className ?? "-"}</TableCell>
                    <TableCell>
                      {ATTEMPT_STATUS_LABELS[row.status] ?? row.status}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatScore(row.score)} / {data.exam.maxScore}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.score === null
                        ? "-"
                        : `${toPercentage(row.score, data.exam.maxScore)}%`}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.passed === true ? (
                        <Badge className="bg-green-600 text-white">Lulus</Badge>
                      ) : row.passed === false ? (
                        <Badge variant="destructive">Tidak Lulus</Badge>
                      ) : (
                        <Badge variant="outline">Belum Dinilai</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Belum Mengerjakan</h3>
        {data.notAttempted.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Semua siswa sudah mengerjakan ujian ini.
          </p>
        ) : (
          <ul className="divide-y rounded-md border">
            {data.notAttempted.map((student) => (
              <li
                key={student.studentId}
                className="flex items-center justify-between gap-3 p-3 text-sm"
              >
                <span className="font-medium">{student.studentName}</span>
                <span className="text-muted-foreground">
                  NISN: {student.nisn ?? "-"}
                </span>
                <Badge variant="outline">Belum mengerjakan</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
