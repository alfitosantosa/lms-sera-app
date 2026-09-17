"use client";

import { useAttendanceIsSubmitted } from "@/app/(hooks)/hooks/Attendances/useAttendanceIsSubmitted";
import { useGetScheduleByIdAcademicYearActive } from "@/app/(hooks)/hooks/Schedules/useGetScheduleById";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { type ScheduleTypes } from "@/app/(types)";
import Loading from "@/components/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/authClients";
import {
  BookOpen,
  CalendarDays,
  Clock,
  Eye,
  GraduationCap,
  MapPin,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { unauthorized } from "next/navigation";
import React, { useState } from "react";

const ScheduleCard = ({ schedule }: { schedule: ScheduleTypes }) => {
  const getDayName = (dayOfWeek: number) => {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    return days[dayOfWeek];
  };

  const getDayColor = (dayOfWeek: number) => {
    const colors = [
      "bg-destructive-chip text-destructive-strong",
      "bg-info-chip text-info-strong",
      "bg-success-chip text-success-strong",
      "bg-warning-chip text-warning-strong",
      "bg-tertiary-chip text-tertiary-strong",
      "bg-info-chip text-info-strong",
      "bg-tertiary-chip text-tertiary-strong",
    ];
    return colors[dayOfWeek];
  };

  const isTodaySchedule = (dayOfWeek: number) => {
    const today = new Date().getDay();
    return dayOfWeek === today;
  };

  // Get today's date in YYYY-MM-DD format
  const todayDate = new Date().toISOString().split("T")[0];

  // Call the hook for each schedule
  const { data: isSubmitted, isLoading: isLoadingIsSubmitted } =
    useAttendanceIsSubmitted({
      date: todayDate,
      scheduleId: schedule.id,
    });

  if (isLoadingIsSubmitted) {
    return <Loading />;
  }

  const isButtonDisabled =
    isSubmitted === true || !isTodaySchedule(schedule.dayOfWeek);

  const getButtonText = isSubmitted
    ? "Sudah Diabsen"
    : !isTodaySchedule(schedule.dayOfWeek)
      ? "Bukan Hari Ini"
      : "Buat Absensi";

  return (
    <Card className="transition-shadow duration-200 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-foreground text-xl">
              {schedule?.subject?.name}
            </CardTitle>
            <CardDescription className="text-base">
              Kode: {schedule?.subject?.code}
            </CardDescription>
          </div>
          <Badge
            className={`${getDayColor(schedule.dayOfWeek)} border-0`}
            variant="secondary"
          >
            {getDayName(schedule.dayOfWeek)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Users className="text-muted-foreground h-4 w-4" />
              <span className="text-foreground">
                <span className="font-medium">Kelas:</span>{" "}
                {schedule?.tahfidzGroup?.name
                  ? schedule?.tahfidzGroup?.name
                  : schedule?.class?.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="text-muted-foreground h-4 w-4" />
              <span className="text-foreground">
                <span className="font-medium">Ruangan:</span> {schedule.room}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="text-muted-foreground h-4 w-4" />
              <span className="text-foreground">
                <span className="font-medium">Waktu:</span> {schedule.startTime}{" "}
                - {schedule.endTime}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <BookOpen className="text-muted-foreground h-4 w-4" />
              <span className="text-foreground">
                <span className="font-medium">SKS:</span>{" "}
                {schedule?.subject?.credits}
              </span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="text-muted-foreground text-sm">
          <span className="font-medium">Tahun Akademik:</span>{" "}
          {schedule?.academicYear?.year}
        </div>
      </CardContent>

      <CardFooter className="bg-muted/50 flex flex-wrap items-center gap-2">
        <Link href={`/dashboard/teacher/schedule/${schedule.id}`} passHref>
          <Button variant="outline" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Lihat Absensi
          </Button>
        </Link>
        <Button
          disabled={isButtonDisabled}
          className={`flex items-center gap-2 ${isButtonDisabled ? "bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed opacity-10" : ""}`}
          onClick={() => {
            if (!isButtonDisabled) {
              if (schedule.tahfidzGroup?.name) {
                window.location.href = `/dashboard/teacher/attendance/tahfidz/${schedule.id}`;
              } else {
                window.location.href = `/dashboard/teacher/attendance/${schedule.id}`;
              }
            }
          }}
        >
          <Plus className="h-4 w-4" />
          {getButtonText}
        </Button>
        {(schedule.tahfidzGroupId || schedule.tahfidzGroup?.id) && (
          <Link
            href={`/dashboard/teacher/tahfidzrecord/${schedule.tahfidzGroupId ?? schedule.tahfidzGroup?.id}`}
            passHref
          >
            <Button variant="outline" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Setoran Hafalan
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

function TeacherAttendancePage() {
  // Get session from Better Auth first
  const { data: session } = useSession();

  const today = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState<string>(today.toString());

  // Get session from Better Auth

  const { data: userData } = useGetUserByIdBetterAuth(session?.user?.id ?? "");

  const {
    data: scheduleData = [],
    isLoading: isLoadingSchedule,
    error: scheduleError,
  } = useGetScheduleByIdAcademicYearActive(userData?.id ?? "");

  const dayOptions = [
    { value: "all", label: "Semua Hari" },
    { value: "0", label: "Minggu" },
    { value: "1", label: "Senin" },
    { value: "2", label: "Selasa" },
    { value: "3", label: "Rabu" },
    { value: "4", label: "Kamis" },
    { value: "5", label: "Jumat" },
    { value: "6", label: "Sabtu" },
  ];
  //filtered base on hour entry student at start time
  const filteredScheduleData =
    selectedDay === "all"
      ? scheduleData
      : scheduleData.filter(
          (schedule: ScheduleTypes) =>
            schedule.dayOfWeek.toString() === selectedDay &&
            schedule.startTime === schedule.startTime,
        );

  const ScheduleCardSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-32" />
        <Skeleton className="ml-2 h-10 w-40" />
      </CardFooter>
    </Card>
  );

  return (
    <>
      <div className="from-muted/40 to-muted/60 min-h-screen bg-linear-to-br">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2">
              <GraduationCap className="text-primary h-8 w-8" />
              <h1 className="text-foreground text-4xl font-bold">
                Jadwal Mengajar
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Kelola jadwal dan absensi kelas Anda dengan mudah
            </p>
          </div>

          {/* Filter Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Filter Jadwal
              </CardTitle>
              <CardDescription>
                Pilih hari untuk melihat jadwal spesifik
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <label className="text-foreground min-w-fit text-sm font-medium">
                  Pilih Hari:
                </label>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Pilih hari" />
                  </SelectTrigger>
                  <SelectContent>
                    {dayOptions.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Content Section */}
          {isLoadingSchedule ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <ScheduleCardSkeleton key={i} />
              ))}
            </div>
          ) : scheduleError ? (
            <Alert variant="destructive">
              <AlertDescription>
                Terjadi kesalahan saat memuat jadwal:{" "}
                {(scheduleError as Error).message}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {filteredScheduleData.length === 0 ? (
                <Card className="py-12 text-center">
                  <CardContent>
                    <CalendarDays className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                    <h3 className="text-foreground mb-2 text-lg font-medium">
                      Tidak ada jadwal
                    </h3>
                    <p className="text-muted-foreground">
                      Tidak ada jadwal untuk hari yang dipilih.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Summary Badge */}
                  <div className="mb-4 flex items-center gap-2">
                    <Badge variant="secondary" className="px-3 py-1">
                      {filteredScheduleData.length} Jadwal Ditemukan
                    </Badge>
                  </div>

                  {/* Schedule Cards */}
                  {filteredScheduleData.map((schedule: ScheduleTypes) => (
                    <ScheduleCard key={schedule.id} schedule={schedule} />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function UserDataTable() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;

  const { data: userData, isLoading: isLoadingUserData } =
    useGetUserByIdBetterAuth(userId as string);
  const userRole = userData?.role?.name;

  // Show loading while checking authorization
  if (isPending || isLoadingUserData) {
    return <Loading />;
  }

  // Check if user is Admin and Teacher
  if (userRole !== "Teacher") {
    if (userRole !== "Head Of School") {
      unauthorized();
      return null;
    }
  }

  // Render dashboard only after authorization is confirmed
  return <TeacherAttendancePage />;
}
