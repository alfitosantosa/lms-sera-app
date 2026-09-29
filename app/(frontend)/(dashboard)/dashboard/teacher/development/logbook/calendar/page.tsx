"use client";

import { useAccessibleClasses } from "@/app/(hooks)/hooks/Development/useClassProgress";
import { useGetDailyLogs } from "@/app/(hooks)/hooks/Development/useDailyLogs";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { DailyLogTable } from "@/components/development/daily-log-table";
import Loading from "@/components/loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  CalendarBody,
  CalendarDate,
  CalendarDatePagination,
  CalendarHeader,
  CalendarMonthPicker,
  CalendarProvider,
  CalendarYearPicker,
  type Feature,
  useCalendarMonth,
  useCalendarYear,
} from "@/components/ui/kibo-ui/calendar";
import { useSession } from "@/lib/authClients";
import { CHART_SERIES } from "@/lib/charts";
import { format, isSameDay } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { AlertCircle, CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";

export default function LogbookCalendarPage() {
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

  if (isSessionPending || isLoadingUser || isLoadingClasses) {
    return <Loading />;
  }

  return (
    <div className="from-muted/40 to-muted/60 min-h-screen bg-linear-to-br">
      <div className="max-w-7xl space-y-6">
        <div>
          <h1 className="text-foreground text-3xl font-bold">
            Kalender Logbook
          </h1>
          <p className="text-muted-foreground">
            Lihat hari-hari yang sudah tercatat, klik tanggal untuk melihat
            detailnya.
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
                <CardTitle className="text-base">Kelas</CardTitle>
                <CardDescription>
                  Kalender menampilkan log kelas yang dipilih
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            <CalendarProvider
              locale="id-ID"
              startDay={1}
              className="rounded-xl border shadow-sm"
            >
              <LogbookCalendar classId={classId} />
            </CalendarProvider>
          </>
        )}
      </div>
    </div>
  );
}

function LogbookCalendar({ classId }: { classId: string }) {
  const [month] = useCalendarMonth();
  const [year] = useCalendarYear();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fromdate = format(new Date(year, month, 1), "yyyy-MM-dd");
  const todate = format(new Date(year, month + 1, 0), "yyyy-MM-dd");

  const { data: logs, isLoading } = useGetDailyLogs({
    classId,
    fromdate,
    todate,
    limit: 100,
    enabled: classId !== "",
  });

  const logList = logs?.data ?? [];

  const features: Feature[] = logList.map((log) => ({
    id: log.id,
    name: `${log.student?.name ?? "Siswa"} • ${log.activity}`,
    startAt: new Date(log.date),
    endAt: new Date(log.date),
    status: { id: "log", name: "Log", color: CHART_SERIES.info },
  }));

  const selectedLogs = selectedDate
    ? logList.filter((log) => isSameDay(new Date(log.date), selectedDate))
    : [];

  return (
    <div>
      <CalendarDate>
        <CalendarDatePagination />
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          <CalendarMonthPicker className="w-40" />
          <CalendarYearPicker start={year - 5} end={year + 5} />
        </div>
      </CalendarDate>

      <CalendarHeader />
      <CalendarBody
        features={features}
        selectedDate={selectedDate}
        onDateClick={setSelectedDate}
      >
        {() => null}
      </CalendarBody>

      <div className="space-y-3 border-t p-4">
        <h2 className="text-foreground font-semibold">
          {selectedDate
            ? `Log ${format(selectedDate, "d MMMM yyyy", { locale: localeId })}`
            : "Pilih tanggal pada kalender"}
        </h2>
        {selectedDate && (
          <DailyLogTable
            logs={selectedLogs}
            isLoading={isLoading}
            emptyMessage="Tidak ada log pada tanggal ini."
          />
        )}
      </div>
    </div>
  );
}
