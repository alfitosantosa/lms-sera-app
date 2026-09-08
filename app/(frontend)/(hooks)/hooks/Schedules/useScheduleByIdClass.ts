"use client";
import { ScheduleTypes } from "@/app/(types)";
import { apiGet } from "@/lib/apiClients";
import { useQuery } from "@tanstack/react-query";

export const useGetSchedulesByIdClass = (classId: string) => {
  return useQuery({
    queryKey: ["schedules", classId],
    queryFn: async () => {
      const response = await apiGet<ScheduleTypes[]>(`/api/schedules/class/${classId}`);
      return response.data;
    },
    enabled: !!classId,
  });
};
