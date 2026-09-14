"use client";

import { apiGet } from "@/lib/apiClients";
import { useQuery } from "@tanstack/react-query";

type AttendanceParams = {
  date: string;
  scheduleId: string;
};

export const useAttendanceIsSubmitted = ({ date, scheduleId }: AttendanceParams) => {
  return useQuery<boolean>({
    queryKey: ["attendance-is-submitted", date, scheduleId],
    queryFn: async () => await apiGet<{ data: boolean }>("/api/attendance/issubmited?date=" + date + "&scheduleId=" + scheduleId).then((res) => (res.data.data ? true : false)),
  });
};
