"use client";

import { useGetSchedulesByStudent } from "@/app/(hooks)/hooks/Schedules/useSchedules";
import { useGetSpecialSchedules } from "@/app/(hooks)/hooks/SpecialSchedules/useSpecialSchedule";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import Loading from "@/components/loading";
import { CalendarBody, CalendarDate, CalendarDatePagination, CalendarDatePicker, CalendarHeader, CalendarItem, CalendarMonthPicker, CalendarProvider, CalendarYearPicker } from "@/components/ui/kibo-ui/calendar";
import { useSession } from "@/lib/authClients";
import { useMemo } from "react";

// Type definitions berdasarkan JSON
type Schedule = {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  academicYearId: string;
  dayOfWeek: number; // 1 = Monday, 7 = Sunday
  startTime: string;
  endTime: string;
  room: string;
  class: {
    id: string;
    name: string;
    grade: number;
  };
  subject: {
    id: string;
    code: string;
    name: string;
    credits: number;
  };
  teacher: {
    id: string;
    name: string;
  };
};

type SpecialSchedule = {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  eventType: "HOLIDAY" | "EXAM" | "EVENT";
  isPublished: boolean;
  academicYearId: string;
  createdAt: string;
  updatedAt: string;
};

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
  const { data: session, isPending } = useSession();

  const { data: userData } = useGetUserByIdBetterAuth(session?.user?.id ?? "");

  const { data: schedules = [], isLoading: schedulesLoading } = useGetSchedulesByStudent(userData?.id ?? "");
  const { data: specialSchedules = [], isLoading: specialSchedulesLoading } = useGetSpecialSchedules();

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
      while (currentWeekStart.getDay() !== (schedule.dayOfWeek === 7 ? 0 : schedule.dayOfWeek)) {
        currentWeekStart.setDate(currentWeekStart.getDate() + 1);
      }

      // Generate event untuk setiap minggu
      while (currentWeekStart <= endOfYear) {
        const [startHour, startMinute] = schedule.startTime.split(":").map(Number);
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
          description: `Guru: ${schedule?.teacher?.name}\nRuang: ${schedule?.room}\nWaktu: ${schedule?.startTime} - ${schedule?.endTime}`,
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
      .map((schedule ) => {
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
    return [...scheduleFeatures, ...specialScheduleFeatures].sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  }, [scheduleFeatures, specialScheduleFeatures]);

  // Hitung range tahun dari semua events
  const { earliestYear, latestYear } = useMemo(() => {
    if (allFeatures.length === 0) {
      const currentYear = new Date().getFullYear();
      return { earliestYear: currentYear, latestYear: currentYear + 1 };
    }

    const years = allFeatures.flatMap((feature) => [feature.startAt.getFullYear(), feature.endAt.getFullYear()]);

    return {
      earliestYear: Math.min(...years),
      latestYear: Math.max(...years),
    };
  }, [allFeatures]);

  // Loading state
  if (schedulesLoading || specialSchedulesLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="w-max-7xl mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Info */}
        <div className="mb-6 space-y-4">
          <div>
            <h1 className="text-3xl font-bold">Kalender Akademik</h1>
            <p className="text-muted-foreground mt-1">Jadwal kelas dan event khusus tahun akademik</p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: statuses.regularClass.color }} />
              <span className="text-sm font-medium">{statuses.regularClass.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: statuses.holiday.color }} />
              <span className="text-sm font-medium">{statuses.holiday.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: statuses.exam.color }} />
              <span className="text-sm font-medium">{statuses.exam.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: statuses.event.color }} />
              <span className="text-sm font-medium">{statuses.event.name}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Jadwal Reguler</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{schedules.length}</p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Event Khusus</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-1">{specialSchedules.filter((s) => s.isPublished).length}</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Event</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">{allFeatures.length}</p>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <CalendarProvider>
          <CalendarDate>
            <CalendarDatePicker>
              <CalendarMonthPicker />
              <CalendarYearPicker end={latestYear} start={earliestYear} />
            </CalendarDatePicker>
            <CalendarDatePagination />
          </CalendarDate>
          <CalendarHeader />
          <CalendarBody features={allFeatures}>{({ feature }) => <CalendarItem feature={feature} key={feature.id} />}</CalendarBody>
        </CalendarProvider>

        {/* Empty State */}
        {allFeatures.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Tidak ada jadwal atau event yang tersedia</p>
          </div>
        )}
      </div>
    </>
  );
}
