"use client";

import { type attendanceTypes } from "@/types/attendance-types";
import { apiGet } from "@/lib/http/apiClient";
import { useQuery } from "@tanstack/react-query";

export const useGetAttendanceByIdSchedule = (id: string) => {
  return useQuery({
    queryKey: ["attendance", id],
    queryFn: async () => {
      try {
        const res = await apiGet<attendanceTypes[]>(
          `/api/attendance/schedule/${id}`,
        );
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
    enabled: !!id,
  });
};
