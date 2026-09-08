import { attendanceTypes } from "@/app/(types)/types/attendance-types";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetAttendance = () => {
  return useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const response = await apiGet<attendanceTypes[]>("/api/attendance");
      return response.data;
    },
  });
};

export const useCreateAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiPost("/api/attendance", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiPut(`/api/attendance/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
};

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiDelete(`/api/attendance/`, {
        body: JSON.stringify({ id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
};
