"use client";

import type { BulkTeacherAttendanceInput, CreateTeacherAttendanceInput, TeacherAttendanceRecord, TeacherAttendanceReport, UpdateTeacherAttendanceInput } from "@/app/(types)/types/teacher-attendance-types";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetTeacherAttendance = (date?: string, teacherId?: string) => {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  if (teacherId) params.append("teacherId", teacherId);

  return useQuery({
    queryKey: ["teacherAttendance", date, teacherId],
    queryFn: async () => {
      const response = await apiGet(`/api/teacherattendance${params.toString() ? `?${params}` : ""}`);
      return response.data as TeacherAttendanceRecord[];
    },
  });
};

export const useCreateTeacherAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTeacherAttendanceInput) => {
      const response = await apiPost("/api/teacherattendance", data);
      return response.data as TeacherAttendanceRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherAttendance"] });
    },
  });
};

export const useUpdateTeacherAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTeacherAttendanceInput) => {
      const response = await apiPut("/api/teacherattendance", data);
      return response.data as TeacherAttendanceRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherAttendance"] });
    },
  });
};

export const useGetTeacherAttendanceReports = (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  return useQuery({
    queryKey: ["teacherAttendanceReports", startDate, endDate],
    queryFn: async () => {
      const response = await apiGet(`/api/teacherattendance/reports${params.toString() ? `?${params}` : ""}`);
      return response.data as TeacherAttendanceReport[];
    },
  });
};

export const useBulkCreateTeacherAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkTeacherAttendanceInput) => {
      const response = await apiPost("/api/teacherattendance/bulk", data);
      return response.data as TeacherAttendanceRecord[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherAttendance"] });
    },
  });
};

export const useDeleteTeacherAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiDelete(`/api/teacherattendance/?id=${id}`);
      return response.data as TeacherAttendanceRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherAttendance"] });
    },
  });
};
