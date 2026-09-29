"use client";

import {
  type BulkDailyLogInput,
  type DailyLogDTO,
  type DailyLogInput,
  type DailyLogUpdateInput,
  type TimelineEntryDTO,
} from "@/app/(types)";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/apiClients";
import { type PaginationResponse } from "@/lib/pagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type DailyLogFilters = {
  classId?: string;
  studentId?: string;
  teacherId?: string;
  fromdate?: string;
  todate?: string;
  status?: string;
  page?: number;
  limit?: number;
};

function buildQuery(filters?: Record<string, unknown>): string {
  const params = new URLSearchParams();
  Object.entries(filters ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });
  return params.toString();
}

export const useGetDailyLogs = (filters?: DailyLogFilters) => {
  return useQuery({
    queryKey: ["daily-logs", filters],
    queryFn: async () => {
      const query = buildQuery(filters);
      const url = query ? `/api/daily-logs?${query}` : "/api/daily-logs";
      const response = await apiGet<
        { success: boolean } & PaginationResponse<DailyLogDTO>
      >(url);
      return response.data;
    },
  });
};

export const useGetDailyLog = (id?: string) => {
  return useQuery({
    queryKey: ["daily-logs", "detail", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await apiGet<{ success: boolean; data: DailyLogDTO }>(
        `/api/daily-logs/${id}`,
      );
      return response.data?.data ?? null;
    },
  });
};

export const useCreateDailyLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: DailyLogInput) => {
      const response = await apiPost<{ success: boolean; data: DailyLogDTO }>(
        "/api/daily-logs",
        data,
      );
      return response.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-logs"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useUpdateDailyLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: DailyLogUpdateInput;
    }) => {
      const response = await apiPatch<{ success: boolean; data: DailyLogDTO }>(
        `/api/daily-logs/${id}`,
        data,
      );
      return response.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-logs"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useDeleteDailyLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiDelete(`/api/daily-logs/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-logs"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useSubmitDailyLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiPost<{ success: boolean; data: DailyLogDTO }>(
        `/api/daily-logs/${id}/submit`,
      );
      return response.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-logs"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useReviewDailyLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiPost<{ success: boolean; data: DailyLogDTO }>(
        `/api/daily-logs/${id}/review`,
      );
      return response.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-logs"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useBulkCreateDailyLogs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BulkDailyLogInput) => {
      const response = await apiPost<{ success: boolean; count: number }>(
        "/api/daily-logs/bulk",
        data,
      );
      return response.data?.count ?? 0;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-logs"] });
      queryClient.invalidateQueries({ queryKey: ["student-timeline"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useGetStudentTimeline = (
  studentId: string,
  filters?: { fromdate?: string; todate?: string },
) => {
  return useQuery({
    queryKey: ["student-timeline", studentId, filters],
    enabled: Boolean(studentId),
    queryFn: async () => {
      const query = buildQuery(filters);
      const url = `/api/development/students/${studentId}/timeline${
        query ? `?${query}` : ""
      }`;
      const response = await apiGet<{
        success: boolean;
        data: TimelineEntryDTO[];
      }>(url);
      return response.data?.data ?? [];
    },
  });
};
