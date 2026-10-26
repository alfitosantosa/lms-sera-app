"use client";
import { type ScheduleTypes } from "@/types";
import { apiGet } from "@/lib/http/apiClient";
import { useQuery } from "@tanstack/react-query";

export const useGetSchedulesByIdClass = (classId: string) => {
  return useQuery({
    queryKey: ["schedules", classId],
    queryFn: async () => {
      const response = await apiGet<ScheduleTypes[]>(
        `/api/schedules/class/${classId}`,
      );
      return response.data;
    },
    enabled: !!classId,
  });
};
