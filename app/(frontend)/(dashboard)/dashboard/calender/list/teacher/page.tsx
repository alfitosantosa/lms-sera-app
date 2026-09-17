"use client";

import { useGetSchedulesByTeacher } from "@/app/(hooks)/hooks/Schedules/useSchedules";
import { useGetSpecialSchedules } from "@/app/(hooks)/hooks/SpecialSchedules/useSpecialSchedule";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import Loading from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarBody,
  CalendarDate,
  CalendarDatePagination,
  CalendarDatePicker,
  CalendarHeader,
  CalendarItem,
  CalendarMonthPicker,
  CalendarProvider,
  CalendarYearPicker,
} from "@/components/ui/kibo-ui/calendar";
import { useSession } from "@/lib/authClients";
import { format, isSameDay } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { useMemo, useState } from "react";

type CalendarFeature = {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  status: {
    id: string;
    name: string;
    color: string;
  };
  description?: string;
  type?: "schedule" | "special";
};

export default function CalendarPage() {
  // Get session from Better Auth
  const { data: session } = useSession();
  const { data: userData } = useGetUserByIdBetterAuth(session?.user?.id ?? "");

  // State for selected date
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: schedules = [], isLoading: schedulesLoading } =
    useGetSchedulesByTeacher(userData?.id ?? "");
  const { data: specialSchedules = [], isLoading: specialSchedulesLoading } =
    useGetSpecialSchedules();

  // Status untuk berbagai jenis event
  const statuses = {
    regularClass: { id: "1", name: "Kelas Reguler", color: "#3B82F6" }, // Blue
    holiday: { id: "2", name: "Libur", color: "#EF4444" }, // Red
    exam: { id: "3", name: "Ujian", color: "#F59E0B" }, // Orange
    event: { id: "4", name: "Event", color: "#10B981" }, // Green
  };

  // Konversi schedules menjadi calendar features (jadwal mingguan berulang)
  const scheduleFeatures = useMemo(() => {
    if (!schedules || schedules.length === 0) return [];

    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const endOfYear = new Date(currentDate.getFullYear(), 11, 31);

    const features: CalendarFeature[] = [];

    schedules.forEach((schedule) => {
      // Generate recurring events untuk setiap minggu dalam tahun
      const currentWeekStart = new Date(startOfYear);

      // Cari hari pertama sesuai dayOfWeek
      while (
        currentWeekStart.getDay() !==
        (schedule.dayOfWeek === 7 ? 0 : schedule.dayOfWeek)
      ) {
        currentWeekStart.setDate(currentWeekStart.getDate() + 1);
      }

      // Generate event untuk setiap minggu
      while (currentWeekStart <= endOfYear) {
        const [startHour, startMinute] = schedule.startTime
          .split(":")
          .map(Number);
        const [endHour, endMinute] = schedule.endTime.split(":").map(Number);

        const startAt = new Date(currentWeekStart);
        startAt.setHours(startHour, startMinute, 0, 0);

        const endAt = new Date(currentWeekStart);
        endAt.setHours(endHour, endMinute, 0, 0);

        features.push({
          id: `${schedule.id}-${currentWeekStart.getTime()}`,
          name: `${schedule?.subject?.name} - ${schedule?.class?.name}`,
          startAt,
          endAt,
          status: statuses.regularClass,
          description: `Guru: ${schedule?.teacher?.name}\nRuang: ${schedule.room}\nWaktu: ${schedule.startTime} - ${schedule.endTime}`,
          type: "schedule",
        });

        // Pindah ke minggu berikutnya
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      }
    });

    return features;
  }, [schedules]);

  // Konversi special schedules menjadi calendar features
  const specialScheduleFeatures = useMemo(() => {
    if (!specialSchedules || specialSchedules.length === 0) return [];

    return specialSchedules
      .filter((schedule) => schedule.isPublished)
      .map((schedule) => {
        const eventDate = new Date(schedule.eventDate);

        // Set waktu untuk event khusus (full day event)
        const startAt = new Date(eventDate);
        startAt.setHours(0, 0, 0, 0);

        const endAt = new Date(eventDate);
        endAt.setHours(23, 59, 59, 999);

        let status = statuses.event;
        if (schedule.eventType === "HOLIDAY") {
          status = statuses.holiday;
        } else if (schedule.eventType === "EXAM") {
          status = statuses.exam;
        }

        return {
          id: schedule.id,
          name: schedule.title,
          startAt,
          endAt,
          status,
          description: schedule.description || undefined,
          type: "special" as const,
        };
      });
  }, [specialSchedules]);

  // Gabungkan semua features
  const allFeatures = useMemo(() => {
    return [...scheduleFeatures, ...specialScheduleFeatures].sort(
      (a, b) => a.startAt.getTime() - b.startAt.getTime(),
    );
  }, [scheduleFeatures, specialScheduleFeatures]);

  // Hitung range tahun dari semua events
  const { earliestYear, latestYear } = useMemo(() => {
    if (allFeatures.length === 0) {
      const currentYear = new Date().getFullYear();
      return { earliestYear: currentYear, latestYear: currentYear + 1 };
    }

    const years = allFeatures.flatMap((feature) => [
      feature.startAt.getFullYear(),
      feature.endAt.getFullYear(),
    ]);

    return {
      earliestYear: Math.min(...years),
      latestYear: Math.max(...years),
    };
  }, [allFeatures]);

  // Filter schedules for selected date
  const selectedDateSchedules = useMemo(() => {
    if (!selectedDate) return [];

    return allFeatures.filter(
      (feature) =>
        isSameDay(feature.startAt, selectedDate) ||
        isSameDay(feature.endAt, selectedDate),
    );
  }, [selectedDate, allFeatures]);

  // Check if a date has schedules

  // Loading state
  if (schedulesLoading || specialSchedulesLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Info */}
        <div className="mb-6 space-y-4">
          <div>
            <h1 className="text-3xl font-bold">Kalender Akademik</h1>
            <p className="text-muted-foreground mt-1">
              Jadwal kelas dan event khusus tahun akademik
            </p>
          </div>

          {/* Legend */}
          <div className="bg-muted/30 flex flex-wrap gap-4 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded"
                style={{ backgroundColor: statuses.regularClass.color }}
              />
              <span className="text-sm font-medium">
                {statuses.regularClass.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded"
                style={{ backgroundColor: statuses.holiday.color }}
              />
              <span className="text-sm font-medium">
                {statuses.holiday.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded"
                style={{ backgroundColor: statuses.exam.color }}
              />
              <span className="text-sm font-medium">{statuses.exam.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded"
                style={{ backgroundColor: statuses.event.color }}
              />
              <span className="text-sm font-medium">{statuses.event.name}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="bg-info-surface border-info-border rounded-lg border p-4">
              <p className="text-info text-sm font-medium">Jadwal Reguler</p>
              <p className="text-info-strong mt-1 text-2xl font-bold">
                {schedules.length}
              </p>
            </div>
            <div className="bg-caution-surface border-caution-border rounded-lg border p-4">
              <p className="text-caution text-sm font-medium">Event Khusus</p>
              <p className="text-caution-strong mt-1 text-2xl font-bold">
                {specialSchedules.filter((s) => s.isPublished).length}
              </p>
            </div>
            <div className="bg-success-surface border-success-border rounded-lg border p-4">
              <p className="text-success text-sm font-medium">Total Event</p>
              <p className="text-success-strong mt-1 text-2xl font-bold">
                {allFeatures.length}
              </p>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <CalendarProvider locale="id" startDay={1}>
          <CalendarDate>
            <CalendarDatePicker>
              <CalendarMonthPicker />
              <CalendarYearPicker end={latestYear} start={earliestYear} />
            </CalendarDatePicker>
            <CalendarDatePagination />
          </CalendarDate>
          <CalendarHeader />
          <CalendarBody
            features={allFeatures}
            onDateClick={setSelectedDate}
            selectedDate={selectedDate}
          >
            {({ feature }) => (
              <CalendarItem feature={feature} key={feature.id} />
            )}
          </CalendarBody>
        </CalendarProvider>

        {/* Schedule List for Selected Date */}
        {selectedDate && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Jadwal untuk{" "}
                {format(selectedDate, "EEEE, d MMMM yyyy", { locale: id })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateSchedules.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateSchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="hover:bg-muted/50 space-y-3 rounded-lg border p-4 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">
                            {schedule.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              style={{
                                backgroundColor: `${schedule.status.color}20`,
                                color: schedule.status.color,
                              }}
                            >
                              {schedule.status.name}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {schedule.description && (
                        <div className="text-muted-foreground text-sm whitespace-pre-line">
                          {schedule.description}
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <Clock className="text-muted-foreground h-4 w-4" />
                          <span>
                            {format(schedule.startAt, "HH:mm")} -{" "}
                            {format(schedule.endAt, "HH:mm")}
                          </span>
                        </div>

                        {schedule.type === "schedule" &&
                          schedule.description && (
                            <>
                              <div className="flex items-center gap-2">
                                <MapPin className="text-muted-foreground h-4 w-4" />
                                <span>
                                  {schedule.description
                                    .split("\n")[2]
                                    ?.replace("Ruang: ", "") || "-"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="text-muted-foreground h-4 w-4" />
                                <span>
                                  {schedule.description
                                    .split("\n")[0]
                                    ?.replace("Guru: ", "") || "-"}
                                </span>
                              </div>
                            </>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="text-muted-foreground">
                    <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p className="mb-2 text-lg font-medium">Tidak ada jadwal</p>
                    <p className="text-sm">
                      Tidak ada jadwal atau event pada tanggal ini
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {allFeatures.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              Tidak ada jadwal atau event yang tersedia
            </p>
          </div>
        )}
      </div>
    </>
  );
}
