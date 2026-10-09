"use client";

import {
  type ClassProgressStudentDTO,
  type DailyLogDTO,
  type EvidenceInput,
} from "@/app/(types)/types/development-types";
import {
  useAccessibleClasses,
  useGetClassProgress,
} from "@/app/(hooks)/hooks/Development/useClassProgress";
import {
  useGetIndicators,
  useGetPeriods,
  useGetScales,
} from "@/app/(hooks)/hooks/Development/useDevelopmentConfig";
import {
  useBulkCreateDailyLogs,
  useCreateDailyLog,
  useDeleteDailyLog,
  useGetDailyLogs,
  useReviewDailyLog,
  useSubmitDailyLog,
  useUpdateDailyLog,
} from "@/app/(hooks)/hooks/Development/useDailyLogs";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { DailyLogTable } from "@/components/development/daily-log-table";
import { DailyLogEditDialog } from "@/components/development/daily-log-edit-dialog";
import { EvidenceUploader } from "@/components/development/evidence-uploader";
import { ObservationTemplatePicker } from "@/components/development/observation-template-picker";
import Loading from "@/components/loading";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/betterauth/authClients";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { AlertCircle, Search, Save } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type RowState = {
  selected: boolean;
  activity: string;
  indicatorId: string;
  scaleId: string;
  observation: string;
  /** Bawaan per baris; disalin ke `DailyLog.parentVisible` saat disimpan. */
  parentVisible: boolean;
  evidences: EvidenceInput[];
};

const EMPTY_EVIDENCES: EvidenceInput[] = [];

const EMPTY_ROW: RowState = {
  selected: false,
  activity: "",
  indicatorId: "",
  scaleId: "",
  observation: "",
  parentVisible: false,
  evidences: EMPTY_EVIDENCES,
};

/** Halaman daftar log tersimpan — paginasi server, bukan potongan diam-diam. */
const LOG_PAGE_LIMIT = 20;

function todayInputValue() {
  return format(new Date(), "yyyy-MM-dd");
}

export default function DailyLogbookPage() {
  const searchParams = useSearchParams();
  const { data: session, isPending: isSessionPending } = useSession();
  const { data: userData, isLoading: isLoadingUser } = useGetUserByIdBetterAuth(
    session?.user?.id ?? "",
  );
  const { classes, isLoading: isLoadingClasses } =
    useAccessibleClasses(userData);

  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(todayInputValue);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [logPage, setLogPage] = useState(1);
  const [savingStudentId, setSavingStudentId] = useState("");
  /** Bawaan bulk: "Terlihat oleh orang tua" untuk "Simpan Semua". */
  const [bulkParentVisible, setBulkParentVisible] = useState(false);
  const [editingLog, setEditingLog] = useState<DailyLogDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DailyLogDTO | null>(null);

  const requestedClassId = searchParams.get("classId") ?? "";

  useEffect(() => {
    if (classId) return;
    if (requestedClassId && classes.some((c) => c.id === requestedClassId)) {
      setClassId(requestedClassId);
      return;
    }
    if (classes.length > 0) setClassId(classes[0].id);
  }, [classes, classId, requestedClassId]);

  const { data: progress, isLoading: isLoadingProgress } =
    useGetClassProgress(classId);
  const { data: periods = [] } = useGetPeriods({ status: "OPEN" });
  const { data: indicators = [] } = useGetIndicators({ isActive: true });
  const { data: scales = [] } = useGetScales({ isActive: true });
  const { data: logs, isLoading: isLoadingLogs } = useGetDailyLogs({
    classId,
    fromdate: date,
    todate: date,
    page: logPage,
    limit: LOG_PAGE_LIMIT,
    enabled: classId !== "",
  });
  const bulkCreate = useBulkCreateDailyLogs();
  const createLog = useCreateDailyLog();
  const updateLog = useUpdateDailyLog();
  const submitLog = useSubmitDailyLog();
  const reviewLog = useReviewDailyLog();
  const deleteLog = useDeleteDailyLog();

  // Kembali ke halaman 1 saat kelas/tanggal berganti.
  useEffect(() => {
    setLogPage(1);
  }, [classId, date]);

  const activePeriod = periods[0];
  const students = progress?.students ?? [];
  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return students;
    return students.filter((student) =>
      student.name.toLowerCase().includes(keyword),
    );
  }, [students, search]);

  const indicatorGroups = useMemo(() => {
    const groups = new Map<string, typeof indicators>();
    for (const indicator of indicators) {
      const area = indicator.developmentArea?.name ?? "Umum";
      const group = groups.get(area) ?? [];
      group.push(indicator);
      groups.set(area, group);
    }
    return [...groups.entries()];
  }, [indicators]);

  const roleName = (userData?.role?.name ?? "").toLowerCase().trim();
  const isAdmin = roleName === "admin" || roleName === "admin school";
  const isOwnLog = (log: DailyLogDTO) => log.teacherId === userData?.id;
  // Cermin `assertLogWritable`/`submitDailyLog` di server: draft milik sendiri,
  // atau admin. Aksi yang akan 403 tidak pernah ditampilkan.
  const canEditLog = (log: DailyLogDTO) =>
    isAdmin || (isOwnLog(log) && log.status === "DRAFT");
  const canSubmitLog = (log: DailyLogDTO) =>
    log.status === "DRAFT" && (isAdmin || isOwnLog(log));

  const handleToggleVisibility = (log: DailyLogDTO, next: boolean) => {
    updateLog.mutate(
      { id: log.id, data: { parentVisible: next } },
      {
        onSuccess: () =>
          toast.success(
            next
              ? "Log terlihat oleh orang tua"
              : "Log disembunyikan dari orang tua",
          ),
      },
    );
  };

  const handleSubmitLog = (log: DailyLogDTO) => {
    submitLog.mutate(log.id, {
      onSuccess: () => toast.success("Log dikirim untuk ditinjau"),
    });
  };

  const handleReviewLog = (log: DailyLogDTO) => {
    reviewLog.mutate(log.id, { onSuccess: () => toast.success("Log ditinjau") });
  };

  const handleDeleteLog = (log: DailyLogDTO) => {
    deleteLog.mutate(log.id, {
      onSuccess: () => {
        toast.success("Log dihapus");
        setDeleteTarget(null);
      },
    });
  };

  const renderRowActions = (log: DailyLogDTO) => (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-xs">
        <Checkbox
          checked={log.parentVisible}
          disabled={!canEditLog(log) || updateLog.isPending}
          onCheckedChange={(value) =>
            handleToggleVisibility(log, value === true)
          }
          aria-label="Terlihat oleh orang tua"
        />
        <span>
          {log.parentVisible ? "Terlihat orang tua" : "Tersembunyi"}
        </span>
      </label>
      <div className="flex flex-wrap gap-1">
        {canSubmitLog(log) && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={submitLog.isPending}
            onClick={() => handleSubmitLog(log)}
          >
            Kirim
          </Button>
        )}
        {canEditLog(log) && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setEditingLog(log)}
          >
            Edit
          </Button>
        )}
        {log.status === "DRAFT" && (isAdmin || isOwnLog(log)) && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={deleteLog.isPending}
            onClick={() => setDeleteTarget(log)}
          >
            Hapus
          </Button>
        )}
        {log.status === "SUBMITTED" && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={reviewLog.isPending}
            onClick={() => handleReviewLog(log)}
          >
            Tinjau
          </Button>
        )}
      </div>
    </div>
  );

  const updateRow = (studentId: string, patch: Partial<RowState>) => {
    setRows((current) => ({
      ...current,
      [studentId]: { ...(current[studentId] ?? EMPTY_ROW), ...patch },
    }));
  };

  const selectedStudents = students.filter(
    (s) => (rows[s.id] ?? EMPTY_ROW).selected,
  );

  const handleBulkSave = () => {
    const entries = selectedStudents
      .map((student) => ({ student, row: rows[student.id] ?? EMPTY_ROW }))
      .filter(
        ({ row }) =>
          row.activity.trim() !== "" &&
          row.indicatorId !== "" &&
          row.observation.trim() !== "",
      );

    if (entries.length === 0) {
      toast.error("Isi kegiatan, indikator, dan catatan minimal satu siswa");
      return;
    }
    if (entries.length !== selectedStudents.length) {
      toast.error("Beberapa siswa tercentang belum lengkap");
      return;
    }
    const withEvidence = selectedStudents.filter(
      (student) => (rows[student.id] ?? EMPTY_ROW).evidences.length > 0,
    );
    if (withEvidence.length > 0) {
      toast.error(
        `${withEvidence.length} siswa punya bukti — simpan siswa tersebut satu per satu lewat tombol Simpan di barisnya.`,
      );
      return;
    }

    bulkCreate.mutate(
      {
        classId,
        date: new Date(date),
        parentVisible: bulkParentVisible,
        entries: entries.map(({ student, row }) => ({
          studentId: student.id,
          activity: row.activity.trim(),
          observation: row.observation.trim(),
          indicatorId: row.indicatorId,
          scaleId: row.scaleId || null,
        })),
      },
      {
        onSuccess: (count) => {
          toast.success(`${count} log harian tersimpan`);
          setRows({});
        },
      },
    );
  };

  const handleRowSave = (student: ClassProgressStudentDTO) => {
    const row = rows[student.id] ?? EMPTY_ROW;
    if (
      row.activity.trim() === "" ||
      row.indicatorId === "" ||
      row.observation.trim() === ""
    ) {
      toast.error("Isi kegiatan, indikator, dan catatan siswa ini");
      return;
    }

    setSavingStudentId(student.id);
    createLog.mutate(
      {
        studentId: student.id,
        classId,
        date: new Date(date),
        activity: row.activity.trim(),
        parentVisible: row.parentVisible,
        observations: [
          {
            indicatorId: row.indicatorId,
            scaleId: row.scaleId || null,
            observation: row.observation.trim(),
          },
        ],
        evidences: row.evidences,
      },
      {
        onSuccess: () => {
          toast.success(`Log ${student.name} tersimpan`);
          setRows((current) => {
            const next = { ...current };
            delete next[student.id];
            return next;
          });
        },
        onSettled: () => setSavingStudentId(""),
      },
    );
  };

  const applyPreviousToRow = (studentId: string, previous: DailyLogDTO) => {
    const observation = previous.observations?.[0];
    updateRow(studentId, {
      activity: previous.activity,
      indicatorId: observation?.indicatorId ?? "",
      observation: observation?.observation ?? "",
    });
  };

  if (isSessionPending || isLoadingUser || isLoadingClasses) {
    return <Loading />;
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl space-y-6">
        <div>
          <h1 className="text-foreground text-3xl font-semibold tracking-tight">
            Buku Catatan Harian
          </h1>
          <p className="text-muted-foreground">
            Pilih kelas dan tanggal, lalu catat observasi siswa sekaligus.
          </p>
        </div>

        {classes.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Belum ada kelas</AlertTitle>
            <AlertDescription>
              Anda belum memiliki jadwal mengajar, jadi belum ada kelas yang
              bisa dicatat.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Kelas & Tanggal</CardTitle>
                <CardDescription>
                  {activePeriod
                    ? `Periode dibuka: ${activePeriod.name}`
                    : "Periode penilaian belum dibuka"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Kelas</label>
                    <Select value={classId} onValueChange={setClassId}>
                      <SelectTrigger className="w-52">
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
                    <label className="text-sm font-medium" htmlFor="log-date">
                      Tanggal
                    </label>
                    <Input
                      id="log-date"
                      type="date"
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      className="w-48"
                    />
                  </div>
                  <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Cari siswa..."
                      className="w-64 pl-9"
                    />
                  </div>
                </div>

                {!activePeriod && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Periode penilaian belum dibuka</AlertTitle>
                    <AlertDescription>
                      Hubungi admin untuk membuka periode sebelum menyimpan log.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Daftar Siswa ({filteredStudents.length})
                  </CardTitle>
                  <CardDescription>
                    {format(new Date(date), "d MMMM yyyy", {
                      locale: localeId,
                    })}
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {selectedStudents.length} dipilih
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingProgress ? (
                  <p className="text-muted-foreground text-sm">
                    Memuat siswa...
                  </p>
                ) : filteredStudents.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Tidak ada siswa yang cocok.
                  </p>
                ) : (
                  filteredStudents.map((student) => (
                    <StudentRow
                      key={student.id}
                      student={student}
                      row={rows[student.id] ?? EMPTY_ROW}
                      scales={scales}
                      indicatorGroups={indicatorGroups}
                      isSaving={savingStudentId === student.id}
                      onChange={(patch) => updateRow(student.id, patch)}
                      onCopyPrevious={(previous) =>
                        applyPreviousToRow(student.id, previous)
                      }
                      onSave={() => handleRowSave(student)}
                    />
                  ))
                )}

                <div className="flex w-full flex-col items-end gap-1 pt-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={bulkParentVisible}
                      onCheckedChange={(value) =>
                        setBulkParentVisible(value === true)
                      }
                    />
                    Terlihat oleh orang tua
                  </label>
                  <Button
                    type="button"
                    onClick={handleBulkSave}
                    disabled={
                      bulkCreate.isPending || selectedStudents.length === 0
                    }
                  >
                    <Save className="h-4 w-4" />
                    Simpan Semua
                  </Button>
                  <p className="text-muted-foreground text-xs">
                    Siswa dengan bukti disimpan satu per satu.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h2 className="text-foreground text-xl font-semibold">
                Log Tersimpan
              </h2>
              <DailyLogTable
                logs={logs?.data ?? []}
                isLoading={isLoadingLogs}
                emptyMessage="Belum ada log pada tanggal ini."
                total={logs?.pagination?.total}
                page={logPage}
                hasMore={logs?.pagination?.hasMore}
                onPageChange={setLogPage}
                renderRowActions={renderRowActions}
              />
            </div>
          </>
        )}
      </div>

      <DailyLogEditDialog
        open={editingLog !== null}
        onOpenChange={(open) => {
          if (!open) setEditingLog(null);
        }}
        log={editingLog}
        scales={scales}
        indicatorGroups={indicatorGroups}
      />

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus log harian?</AlertDialogTitle>
            <AlertDialogDescription>
              Log {deleteTarget?.student?.name ?? "siswa ini"} akan dihapus
              permanen beserta observasi dan buktinya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) handleDeleteLog(deleteTarget);
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StudentRow({
  student,
  row,
  scales,
  indicatorGroups,
  isSaving,
  onChange,
  onCopyPrevious,
  onSave,
}: {
  student: ClassProgressStudentDTO;
  row: RowState;
  scales: { id: string; label: string; color: string | null }[];
  indicatorGroups: [string, { id: string; name: string }[]][];
  isSaving: boolean;
  onChange: (patch: Partial<RowState>) => void;
  onCopyPrevious: (previous: DailyLogDTO) => void;
  onSave: () => void;
}) {
  return (
    <div className="rounded-3xl border p-3">
      <div className="mb-3 flex items-center gap-3">
        <Checkbox
          checked={row.selected}
          onCheckedChange={(value) => onChange({ selected: value === true })}
          aria-label={`Pilih ${student.name}`}
        />
        <span className="font-medium">{student.name}</span>
        {student.hasLogToday && (
          <Badge variant="secondary">Sudah dicatat</Badge>
        )}
        <label className="ml-auto flex items-center gap-2 text-xs">
          <Checkbox
            checked={row.parentVisible}
            onCheckedChange={(value) =>
              onChange({ parentVisible: value === true })
            }
          />
          Terlihat oleh orang tua
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium">Kegiatan</label>
          <Input
            value={row.activity}
            onChange={(event) => onChange({ activity: event.target.value })}
            placeholder="Misal: Membaca cerita"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Indikator</label>
          <Select
            value={row.indicatorId}
            onValueChange={(value) => onChange({ indicatorId: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih indikator" />
            </SelectTrigger>
            <SelectContent>
              {indicatorGroups.map(([area, items]) => (
                <SelectGroup key={area}>
                  <SelectLabel>{area}</SelectLabel>
                  {items.map((indicator) => (
                    <SelectItem key={indicator.id} value={indicator.id}>
                      {indicator.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Hasil</label>
          <Select
            value={row.scaleId}
            onValueChange={(value) => onChange({ scaleId: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih hasil" />
            </SelectTrigger>
            <SelectContent>
              {scales.map((scale) => (
                <SelectItem key={scale.id} value={scale.id}>
                  {scale.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">Catatan</label>
            <ObservationTemplatePicker
              value={row.observation}
              onChange={(value) => onChange({ observation: value })}
              studentId={student.id}
              onCopyPrevious={onCopyPrevious}
            />
          </div>
          <Input
            value={row.observation}
            onChange={(event) => onChange({ observation: event.target.value })}
            placeholder="Hasil observasi"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <EvidenceUploader
          value={row.evidences}
          onChange={(evidences) => onChange({ evidences })}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
