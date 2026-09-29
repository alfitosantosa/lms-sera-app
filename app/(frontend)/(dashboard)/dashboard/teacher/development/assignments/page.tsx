"use client";

import {
  type AssignmentDTO,
  type AssignmentSubmissionDTO,
  type GradeTypeDTO,
  getErrorMessage,
} from "@/app/(types)";
import {
  useCreateAssignment,
  useGetAssignments,
  useGetGradeTypes,
  useGetSubmissions,
  useGradeSubmission,
} from "@/app/(hooks)/hooks/Assignments/useAssignments";
import { useAccessibleSchedules } from "@/app/(hooks)/hooks/Development/useClassProgress";
import { useGetIndicators } from "@/app/(hooks)/hooks/Development/useDevelopmentConfig";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/authClients";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/** Sentinel: Radix Select tidak menerima value string kosong. */
const NONE = "__none__";

const dateTime = (value: string) => new Date(value).toLocaleString("id-ID");

function GradeForm({
  assignment,
  submission,
  gradeTypes,
  onSaved,
}: {
  assignment: AssignmentDTO;
  submission: AssignmentSubmissionDTO;
  gradeTypes: GradeTypeDTO[];
  onSaved: () => void;
}) {
  const grade = useGradeSubmission();
  const [score, setScore] = useState(submission.score?.toString() ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [gradeTypeId, setGradeTypeId] = useState(
    assignment.gradeTypeId ?? gradeTypes[0]?.id ?? "",
  );

  useEffect(() => {
    if (!gradeTypeId && gradeTypes.length > 0) setGradeTypeId(gradeTypes[0].id);
  }, [gradeTypes, gradeTypeId]);

  const submit = async () => {
    if (!gradeTypeId) {
      toast.error("Jenis penilaian wajib dipilih");
      return;
    }
    if (score === "") {
      toast.error("Nilai wajib diisi");
      return;
    }
    try {
      await grade.mutateAsync({
        assignmentId: assignment.id,
        submissionId: submission.id,
        data: {
          score: Number(score),
          feedback: feedback || null,
          gradeTypeId,
        },
      });
      toast.success("Nilai tugas disimpan");
      onSaved();
    } catch {
      // Pesan Bahasa Indonesia dari backend sudah ditampilkan errorHandlerFrontend.
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <Input
        type="number"
        min={0}
        max={Number(assignment.maxScore)}
        className="sm:w-24"
        placeholder="Nilai"
        value={score}
        onChange={(event) => setScore(event.target.value)}
      />
      <Select value={gradeTypeId} onValueChange={setGradeTypeId}>
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="Jenis penilaian" />
        </SelectTrigger>
        <SelectContent>
          {gradeTypes.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              {type.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder="Feedback untuk siswa"
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
      />
      <Button onClick={submit} disabled={grade.isPending}>
        Simpan nilai
      </Button>
    </div>
  );
}

export default function TeacherAssignmentsPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const { data: userData, isLoading: isLoadingUser } = useGetUserByIdBetterAuth(
    session?.user?.id ?? "",
  );
  const { schedules, isLoading: isLoadingSchedules } =
    useAccessibleSchedules(userData);
  const { data: gradeTypes = [] } = useGetGradeTypes();
  const { data: indicators = [] } = useGetIndicators({ isActive: true });

  const [listPage, setListPage] = useState(1);
  const assignmentsQuery = useGetAssignments({ page: listPage, limit: 20 });
  const assignments = assignmentsQuery.data?.data ?? [];
  const pagination = assignmentsQuery.data?.pagination;
  const create = useCreateAssignment();

  const [selectedId, setSelectedId] = useState("");
  const submissionsQuery = useGetSubmissions(selectedId || undefined);
  const selected = assignments.find((item) => item.id === selectedId) ?? null;

  const [scheduleId, setScheduleId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [gradeTypeId, setGradeTypeId] = useState("");
  const [indicatorId, setIndicatorId] = useState(NONE);
  const [allowLate, setAllowLate] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    if (!scheduleId && schedules.length > 0) setScheduleId(schedules[0].id);
  }, [schedules, scheduleId]);

  useEffect(() => {
    if (!gradeTypeId && gradeTypes.length > 0) {
      setGradeTypeId(gradeTypes[0].id);
    }
  }, [gradeTypes, gradeTypeId]);

  const scheduleLabel = (id: string) => {
    const schedule = schedules.find((item) => item.id === id);
    if (!schedule) return "Jadwal";
    return `${schedule.class?.name ?? "Kelas"} — ${schedule.subject?.name ?? "Mapel"}`;
  };

  const submit = async () => {
    if (!scheduleId) {
      toast.error("Jadwal wajib dipilih");
      return;
    }
    if (!dueDate) {
      toast.error("Tenggat wajib diisi");
      return;
    }
    if (!gradeTypeId) {
      toast.error("Jenis penilaian wajib dipilih");
      return;
    }
    try {
      const created = await create.mutateAsync({
        scheduleId,
        title,
        description,
        dueDate: new Date(dueDate),
        maxScore: Number(maxScore),
        gradeTypeId,
        indicatorId: indicatorId === NONE ? null : indicatorId,
        allowLateSubmission: allowLate,
        isPublished,
        attachments: [],
      });
      toast.success("Tugas dibuat");
      setTitle("");
      setDescription("");
      setDueDate("");
      setSelectedId(created.id);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isSessionPending || isLoadingUser || isLoadingSchedules) {
    return <Loading />;
  }

  return (
    <div className="from-muted/40 to-muted/60 min-h-screen bg-linear-to-br">
      <div className="max-w-7xl space-y-6">
        <div>
          <h1 className="text-foreground text-3xl font-bold">Tugas & Nilai</h1>
          <p className="text-muted-foreground">
            Buat tugas, nilai pengumpulan siswa, dan tautkan ke indikator
            perkembangan.
          </p>
        </div>

        {schedules.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Belum ada jadwal</AlertTitle>
            <AlertDescription>
              Anda belum memiliki jadwal mengajar, jadi belum bisa membuat
              tugas.
            </AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Buat Tugas</CardTitle>
              <CardDescription>
                Guru dan mata pelajaran diambil dari jadwal yang dipilih.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="assignment-schedule">Jadwal</Label>
                  <Select value={scheduleId} onValueChange={setScheduleId}>
                    <SelectTrigger id="assignment-schedule" className="w-full">
                      <SelectValue placeholder="Pilih jadwal" />
                    </SelectTrigger>
                    <SelectContent>
                      {schedules.map((schedule) => (
                        <SelectItem key={schedule.id} value={schedule.id}>
                          {scheduleLabel(schedule.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="assignment-title">Judul tugas</Label>
                  <Input
                    id="assignment-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Mis. Latihan pecahan"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="assignment-due">Tenggat</Label>
                  <Input
                    id="assignment-due"
                    type="datetime-local"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="assignment-max">Nilai maksimal</Label>
                  <Input
                    id="assignment-max"
                    type="number"
                    min={1}
                    value={maxScore}
                    onChange={(event) => setMaxScore(event.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="assignment-gradetype">Jenis penilaian</Label>
                  <Select value={gradeTypeId} onValueChange={setGradeTypeId}>
                    <SelectTrigger id="assignment-gradetype" className="w-full">
                      <SelectValue placeholder="Pilih jenis penilaian" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="assignment-indicator">
                    Indikator perkembangan (opsional)
                  </Label>
                  <Select value={indicatorId} onValueChange={setIndicatorId}>
                    <SelectTrigger id="assignment-indicator" className="w-full">
                      <SelectValue placeholder="Pilih indikator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Tidak ditautkan</SelectItem>
                      {indicators.map((indicator) => (
                        <SelectItem key={indicator.id} value={indicator.id}>
                          {indicator.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="assignment-description">Deskripsi</Label>
                <Textarea
                  id="assignment-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Instruksi tugas untuk siswa"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={allowLate}
                    onCheckedChange={(value) => setAllowLate(value === true)}
                  />
                  Izinkan pengumpulan terlambat
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={isPublished}
                    onCheckedChange={(value) => setIsPublished(value === true)}
                  />
                  Publikasikan ke siswa
                </label>
                <Button onClick={submit} disabled={create.isPending}>
                  Simpan tugas
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daftar Tugas</CardTitle>
            <CardDescription>
              {assignmentsQuery.data
                ? `${assignmentsQuery.data.pagination.total} tugas`
                : "Memuat tugas..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignmentsQuery.isLoading ? (
              <p className="text-muted-foreground text-sm">Memuat tugas...</p>
            ) : assignments.length === 0 ? (
              <p className="text-muted-foreground text-sm">Belum ada tugas.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Kelas / Mapel</TableHead>
                    <TableHead>Tenggat</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pengumpulan</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {assignment.title}
                      </TableCell>
                      <TableCell>
                        {assignment.class?.name ?? "-"} /{" "}
                        {assignment.subject?.name ?? "-"}
                      </TableCell>
                      <TableCell>{dateTime(assignment.dueDate)}</TableCell>
                      <TableCell className="space-x-1">
                        <Badge
                          variant={
                            assignment.isPublished ? "default" : "secondary"
                          }
                        >
                          {assignment.isPublished ? "Terbit" : "Draft"}
                        </Badge>
                        {!assignment.isActive && (
                          <Badge variant="destructive">Dihapus</Badge>
                        )}
                        {assignment.indicator && (
                          <Badge variant="outline">Indikator</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {assignment._count?.submissions ?? 0}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedId(assignment.id)}
                        >
                          Lihat pengumpulan
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-muted-foreground text-sm">
                  Halaman {pagination.page} dari {pagination.pages} (
                  {pagination.total} tugas)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setListPage((page) => Math.max(1, page - 1))}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasMore}
                    onClick={() => setListPage((page) => page + 1)}
                  >
                    Berikutnya
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {selected && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Pengumpulan — {selected.title}
              </CardTitle>
              <CardDescription>
                Nilai yang disimpan juga tercatat sebagai nilai akademik
                {selected.indicator ? " dan bukti perkembangan siswa" : ""}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {submissionsQuery.isLoading ? (
                <p className="text-muted-foreground text-sm">
                  Memuat pengumpulan...
                </p>
              ) : (submissionsQuery.data ?? []).length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Belum ada siswa yang mengumpulkan.
                </p>
              ) : (
                <div className="space-y-4">
                  {(submissionsQuery.data ?? []).map((submission) => (
                    <div
                      key={submission.id}
                      className="space-y-2 rounded-lg border p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">
                          {submission.student?.name ?? "Siswa"}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          Dikirim {dateTime(submission.submittedAt)}
                        </span>
                        {submission.isLate && (
                          <Badge variant="destructive">Terlambat</Badge>
                        )}
                        {submission.score !== null && (
                          <Badge variant="secondary">
                            Nilai: {Number(submission.score)}
                          </Badge>
                        )}
                      </div>
                      {submission.notes && (
                        <p className="text-muted-foreground text-sm">
                          {submission.notes}
                        </p>
                      )}
                      <GradeForm
                        assignment={selected}
                        submission={submission}
                        gradeTypes={gradeTypes}
                        onSaved={() => void submissionsQuery.refetch()}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
