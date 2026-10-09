"use client";

import {
  type ClassProgressDTO,
  type ScheduleTypes,
  type UserDataTypes,
} from "@/app/(types)";
import { useGetSchedulesByTeacher } from "@/app/(hooks)/hooks/Schedules/useSchedules";
import { apiGet } from "@/lib/api/apiClients";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export type ClassOption = { id: string; name: string };

/**
 * Progress buku catatan harian satu kelas (roster + jumlah log hari ini).
 */
export const useGetClassProgress = (classId?: string) => {
  return useQuery({
    queryKey: ["class-progress", classId],
    enabled: Boolean(classId),
    queryFn: async (): Promise<ClassProgressDTO | null> => {
      const response = await apiGet<{
        success: boolean;
        message?: string;
        data: ClassProgressDTO;
      }>(`/api/development/classes/${classId}/progress`);
      if (!response.data?.success) {
        throw new Error(
          response.data?.message ?? "Gagal memuat progress kelas",
        );
      }
      return response.data.data;
    },
  });
};

const isTeacherRole = (roleName: string) => {
  const role = roleName.toLowerCase();
  return (
    role.includes("teacher") ||
    role.includes("guru") ||
    role.includes("head of school") ||
    role.includes("kepala sekolah")
  );
};

/**
 * Jadwal yang boleh dipilih aktor di modul pengembangan.
 *
 * Guru: jadwal mengajarnya sendiri. Admin/Admin Sekolah tidak punya jadwal,
 * jadi memakai seluruh jadwal yayasan — guard backend tetap menentukan
 * boleh/tidaknya akses.
 */
export const useAccessibleSchedules = (
  userData?: UserDataTypes | null,
): { schedules: ScheduleTypes[]; isLoading: boolean; isTeacher: boolean } => {
  const roleName = userData?.role?.name ?? "";
  const isTeacher = isTeacherRole(roleName);
  const isAdminLike =
    !isTeacher &&
    (roleName.toLowerCase().includes("admin") ||
      roleName.toLowerCase().includes("yayasan"));

  const { data: teacherSchedules = [], isLoading: isLoadingTeacher } =
    useGetSchedulesByTeacher(isTeacher ? (userData?.id ?? "") : "");

  const { data: allSchedules = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ["schedules"],
    enabled: isAdminLike,
    queryFn: async (): Promise<ScheduleTypes[]> => {
      const response = await apiGet<ScheduleTypes[]>("/api/schedules");
      return response.data ?? [];
    },
  });

  return {
    schedules: isTeacher ? teacherSchedules : isAdminLike ? allSchedules : [],
    isLoading: isTeacher ? isLoadingTeacher : isAdminLike && isLoadingAll,
    isTeacher,
  };
};

/**
 * Kelas yang boleh dipilih guru di modul pengembangan (turunan unik dari
 * jadwal yang boleh diakses).
 */
export const useAccessibleClasses = (
  userData?: UserDataTypes | null,
): { classes: ClassOption[]; isLoading: boolean; isTeacher: boolean } => {
  const { schedules, isLoading, isTeacher } = useAccessibleSchedules(userData);

  const classes = useMemo(() => {
    const byId = new Map<string, ClassOption>();
    for (const schedule of schedules) {
      if (schedule.classId) {
        byId.set(schedule.classId, {
          id: schedule.classId,
          name: schedule.class?.name ?? "Kelas",
        });
      }
    }
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [schedules]);

  return { classes, isLoading, isTeacher };
};
