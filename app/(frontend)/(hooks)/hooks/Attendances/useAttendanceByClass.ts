"use client";
import { attendanceClassResponseTypes } from "@/app/(types)/types/attendance-types";
import { apiGet } from "@/lib/apiClients";
import { useQuery } from "@tanstack/react-query";

export const useGetAttendanceByClass = (classId?: string, startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (classId) params.append("classId", classId);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  return useQuery({
    queryKey: ["attendanceByClass", classId, startDate, endDate, params],
    queryFn: async () => {
      const response = await apiGet<attendanceClassResponseTypes>(`/api/attendance/class${params.toString() ? `?${params}` : ""}`);
      return response.data;
    },
    enabled: !!classId && !!startDate && !!endDate,
  });
};
