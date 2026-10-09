"use client";

import {
  type AssessmentUpsertInput,
  type BulkAssessmentInput,
  type ClassMatrixDTO,
  type StudentAssessmentDTO,
  type StudentOverviewDTO,
} from "@/app/(types)";
import { unwrap } from "@/app/(hooks)/hooks/Development/useDailyLogs";
import { apiGet, apiPost } from "@/lib/api/apiClients";
import { errorHandlerFrontend } from "@/lib/errorHandler/errorHandlerFrontend";
import { type PaginationResponse } from "@/lib/api/pagination";
import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

/**
 * Mutasi penilaian mengubah matriks, daftar, ringkasan siswa, dan progress
 * kelas (`percentAssessment`) — satu tempat agar tidak ada layar yang tertinggal.
 */
function invalidateAssessmentQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["assessments"] });
  queryClient.invalidateQueries({ queryKey: ["class-matrix"] });
  queryClient.invalidateQueries({ queryKey: ["student-overview"] });
  queryClient.invalidateQueries({ queryKey: ["class-progress"] });
  queryClient.invalidateQueries({ queryKey: ["development-me"] });
}

export type AssessmentFilters = {
  studentId?: string;
  classId?: string;
  periodId?: string;
  indicatorId?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
};

export const useGetAssessments = ({
  enabled = true,
  ...filters
}: AssessmentFilters = {}) => {
  return useQuery({
    queryKey: ["assessments", filters],
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
      const query = params.toString();
      const url = query ? `/api/assessments?${query}` : "/api/assessments";
      const response = await apiGet<
        { success: boolean } & PaginationResponse<StudentAssessmentDTO>
      >(url);
      return response.data;
    },
  });
};

/** Upsert satu nilai indikator (tombol skala di matriks). */
export const useUpsertAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AssessmentUpsertInput) => {
      const response = await apiPost<{
        success: boolean;
        data: StudentAssessmentDTO;
      }>("/api/assessments", data);
      return unwrap(response, "Gagal menyimpan penilaian").data;
    },
    onSuccess: () => {
      invalidateAssessmentQueries(queryClient);
    },
    onError: (error) => {
      errorHandlerFrontend(error);
    },
  });
};

/** Isi matriks satu kelas × satu indikator sekaligus. */
export const useBulkUpsertAssessments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BulkAssessmentInput) => {
      const response = await apiPost<{ success: boolean; count: number }>(
        "/api/assessments/bulk",
        data,
      );
      return unwrap(response, "Gagal menyimpan penilaian").count ?? 0;
    },
    onSuccess: () => {
      invalidateAssessmentQueries(queryClient);
    },
    onError: (error) => {
      errorHandlerFrontend(error);
    },
  });
};

export type ClassMatrixFilters = {
  classId?: string;
  periodId?: string;
  areaId?: string;
  indicatorId?: string;
};

/** Matriks siswa × indikator satu kelas pada satu periode. */
export const useGetClassMatrix = (filters: ClassMatrixFilters) => {
  const enabled = Boolean(filters.classId && filters.periodId);
  return useQuery({
    queryKey: ["class-matrix", filters],
    enabled,
    queryFn: async (): Promise<ClassMatrixDTO | null> => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await apiGet<{
        success: boolean;
        message?: string;
        data: ClassMatrixDTO;
      }>(`/api/assessments/class?${params.toString()}`);
      if (!response.data?.success) {
        throw new Error(response.data?.message ?? "Gagal memuat matriks nilai");
      }
      return response.data.data;
    },
  });
};

/** Ringkasan per area (skala terakhir & tertinggi) seorang siswa. */
export const useGetStudentOverview = (studentId: string) => {
  return useQuery({
    queryKey: ["student-overview", studentId],
    enabled: Boolean(studentId),
    queryFn: async (): Promise<StudentOverviewDTO | null> => {
      const response = await apiGet<{
        success: boolean;
        message?: string;
        data: StudentOverviewDTO;
      }>(`/api/development/students/${studentId}/overview`);
      if (!response.data?.success) {
        throw new Error(
          response.data?.message ?? "Gagal memuat ringkasan penilaian",
        );
      }
      return response.data.data;
    },
  });
};
