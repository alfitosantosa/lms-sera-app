"use client";

import {
  type ClassProgressStudentDTO,
  type DailyLogDTO,
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
  useGetDailyLogs,
} from "@/app/(hooks)/hooks/Development/useDailyLogs";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { DailyLogTable } from "@/components/development/daily-log-table";
import { ObservationTemplatePicker } from "@/components/development/observation-template-picker";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/authClients";
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
};

const EMPTY_ROW: RowState = {
  selected: false,
  activity: "",
  indicatorId: "",
  scaleId: "",
  observation: "",
};

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
    limit: 100,
    enabled: classId !== "",
  });
  const bulkCreate = useBulkCreateDailyLogs();

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

    bulkCreate.mutate(
      {
        classId,
        date: new Date(date),
        parentVisible: false,
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
    <div className="from-muted/40 to-muted/60 min-h-screen bg-linear-to-br">
      <div className="max-w-7xl space-y-6">
        <div>
          <h1 className="text-foreground text-3xl font-bold">
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
                      onChange={(patch) => updateRow(student.id, patch)}
                      onCopyPrevious={(previous) =>
                        applyPreviousToRow(student.id, previous)
                      }
                    />
                  ))
                )}

                <div className="flex justify-end pt-2">
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
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StudentRow({
  student,
  row,
  scales,
  indicatorGroups,
  onChange,
  onCopyPrevious,
}: {
  student: ClassProgressStudentDTO;
  row: RowState;
  scales: { id: string; label: string; color: string | null }[];
  indicatorGroups: [string, { id: string; name: string }[]][];
  onChange: (patch: Partial<RowState>) => void;
  onCopyPrevious: (previous: DailyLogDTO) => void;
}) {
  return (
    <div className="rounded-md border p-3">
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
    </div>
  );
}
