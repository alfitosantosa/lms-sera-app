"use client";

import {
  type ReportStatusTypes,
  type ReportUpdateInput,
  type StudentReportDTO,
} from "@/app/(types)";
import { unwrap } from "@/app/(hooks)/hooks/Development/useDailyLogs";
import { apiGet, apiPatch, apiPost } from "@/lib/apiClients";
import { errorHandlerFrontend } from "@/lib/errorHandlerFrontend";
import { type PaginationResponse } from "@/lib/pagination";
import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

/**
 * Semua mutasi rapor mengubah daftar dan detailnya — satu tempat supaya tidak
 * ada layar yang menampilkan status lama.
 */
function invalidateReportQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["reports"] });
}

export type ReportFilters = {
  classId?: string;
  periodId?: string;
  status?: ReportStatusTypes;
  page?: number;
  limit?: number;
  /** Bukan query param — menahan query sampai kelas/periode dipilih. */
  enabled?: boolean;
};

export type ReportListResponse = { success: boolean } & PaginationResponse<
  StudentReportDTO
>;

export type GenerateReportsResult = {
  created: number;
  updated: number;
  errors: { studentId: string; message: string }[];
  periodId: string;
};

const reportKeys = (id: string) => ["report", id];

/** GET /api/reports (berpaginasi — konsumen wajib halaman atau pakai `total`). */
export const useGetReports = ({
  enabled = true,
  ...filters
}: ReportFilters = {}) => {
  return useQuery({
    queryKey: ["reports", filters],
    enabled,
    queryFn: async (): Promise<ReportListResponse> => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
      const query = params.toString();
      const url = query ? `/api/reports?${query}` : "/api/reports";
      const response = await apiGet<ReportListResponse>(url);
      return unwrap(response, "Gagal memuat daftar rapor");
    },
  });
};

/** GET /api/reports/[id] — detail + `snapshot` tersimpan (bukan aggregat live). */
export const useGetReport = (id: string, enabled = true) => {
  return useQuery({
    queryKey: reportKeys(id),
    enabled: enabled && id !== "",
    queryFn: async (): Promise<StudentReportDTO> => {
      const response = await apiGet<{
        success: boolean;
        data: StudentReportDTO;
      }>(`/api/reports/${id}`);
      return unwrap(response, "Gagal memuat rapor").data;
    },
  });
};

/** POST /api/reports/generate — massal satu kelas atau satu siswa. */
export const useGenerateReports = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      classId?: string;
      studentId?: string;
      periodId: string;
    }) => {
      const response = await apiPost<{
        success: boolean;
        data: GenerateReportsResult;
      }>("/api/reports/generate", data);
      return unwrap(response, "Gagal membuat draft rapor").data;
    },
    onSuccess: () => {
      invalidateReportQueries(queryClient);
    },
    onError: (error) => {
      errorHandlerFrontend(error);
    },
  });
};

/** PATCH narasi — hanya `DRAFT`/`REVIEW`. */
export const useUpdateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: ReportUpdateInput & { id: string }) => {
      const response = await apiPatch<{
        success: boolean;
        data: StudentReportDTO;
      }>(`/api/reports/${id}`, data);
      return unwrap(response, "Gagal menyimpan narasi rapor").data;
    },
    onSuccess: (_data, variables) => {
      invalidateReportQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: reportKeys(variables.id) });
    },
    onError: (error) => {
      errorHandlerFrontend(error);
    },
  });
};

/** POST regenerate narasi dari snapshot/agregat terbaru. */
export const useRegenerateNarrative = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiPost<{
        success: boolean;
        data: StudentReportDTO;
      }>(`/api/reports/${id}/narrative`, {});
      return unwrap(response, "Gagal membuat draft narasi").data;
    },
    onSuccess: (_data, id) => {
      invalidateReportQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: reportKeys(id) });
    },
    onError: (error) => {
      errorHandlerFrontend(error);
    },
  });
};

/** POST review — `DRAFT → REVIEW`. */
export const useReviewReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiPost<{
        success: boolean;
        data: StudentReportDTO;
      }>(`/api/reports/${id}/review`, {});
      return unwrap(response, "Gagal meninjau rapor").data;
    },
    onSuccess: (_data, id) => {
      invalidateReportQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: reportKeys(id) });
    },
    onError: (error) => {
      errorHandlerFrontend(error);
    },
  });
};

/** POST approve — `REVIEW → APPROVED` + snapshot membeku. */
export const useApproveReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiPost<{
        success: boolean;
        data: StudentReportDTO;
      }>(`/api/reports/${id}/approve`, {});
      return unwrap(response, "Gagal menyetujui rapor").data;
    },
    onSuccess: (_data, id) => {
      invalidateReportQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: reportKeys(id) });
    },
    onError: (error) => {
      errorHandlerFrontend(error);
    },
  });
};

/** POST publish — `APPROVED → PUBLISHED` (snapshot tidak dihitung ulang). */
export const usePublishReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiPost<{
        success: boolean;
        data: StudentReportDTO;
      }>(`/api/reports/${id}/publish`, {});
      return unwrap(response, "Gagal mempublikasikan rapor").data;
    },
    onSuccess: (_data, id) => {
      invalidateReportQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: reportKeys(id) });
    },
    onError: (error) => {
      errorHandlerFrontend(error);
    },
  });
};
