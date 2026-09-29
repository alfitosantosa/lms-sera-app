"use client";

import {
  type BulkDailyLogInput,
  type DailyLogDTO,
  type DailyLogInput,
  type DailyLogUpdateInput,
  type TimelineEntryDTO,
} from "@/app/(types)";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/apiClients";
import { errorHandlerFrontend } from "@/lib/errorHandlerFrontend";
import { type PaginationResponse } from "@/lib/pagination";
import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

/**
 * Semua mutasi log harian mengubah daftar log, progress kelas (jumlah log hari
 * ini), dan timeline siswa — satu tempat agar tidak ada layar yang tertinggal.
 */
function invalidateLogQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["daily-logs"] });
  queryClient.invalidateQueries({ queryKey: ["class-progress"] });
  queryClient.invalidateQueries({ queryKey: ["student-timeline"] });
}

export type DailyLogFilters = {
  classId?: string;
  studentId?: string;
  teacherId?: string;
  fromdate?: string;
  todate?: string;
  status?: string;
  page?: number;
  limit?: number;
  /** Bukan query param — menahan query sampai kelas dipilih. */
  enabled?: boolean;
};

export function buildQuery(filters?: Record<string, unknown>): string {
  const params = new URLSearchParams();
  Object.entries(filters ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });
  return params.toString();
}

// apiPost/apiPatch/apiDelete tidak melempar error pada status 4xx/5xx, jadi
// pesan error Bahasa Indonesia dari backend (mis. "Periode penilaian belum
// dibuka") harus diangkat manual di sini — bukan di setiap pemanggil.
export const unwrap = <T>(
  res: { status: number; data: T },
  fallback: string,
): T => {
  if (res.status >= 400) {
    const body = (res.data ?? {}) as { error?: string; message?: string };
    throw new Error(body.error || body.message || fallback);
  }
  return res.data;
};

export const useGetDailyLogs = ({
  enabled = true,
  ...filters
}: DailyLogFilters = {}) => {
  return useQuery({
    queryKey: ["daily-logs", filters],
    enabled,
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

export type DailyLogPage = {
  data: DailyLogDTO[];
  pagination: PaginationResponse<DailyLogDTO>["pagination"];
};

/**
 * Kumpulkan seluruh halaman sampai `hasMore` habis.
 * `fetchPage` disuntikkan supaya loop-nya bisa diuji tanpa sesi HTTP dan supaya
 * tidak ada pemanggil yang diam-diam berhenti di satu halaman.
 */
export async function collectAllPages(
  fetchPage: (page: number, limit: number) => Promise<DailyLogPage>,
  { limit = 100, maxPages = 20 }: { limit?: number; maxPages?: number } = {},
): Promise<{ logs: DailyLogDTO[]; total: number; truncated: boolean }> {
  const logs: DailyLogDTO[] = [];
  let total = 0;

  for (let page = 1; page <= maxPages; page++) {
    const result = await fetchPage(page, limit);
    logs.push(...result.data);
    total = result.pagination.total;
    if (!result.pagination.hasMore) return { logs, total, truncated: false };
  }

  return { logs, total, truncated: true };
}

/**
 * Seluruh log untuk satu filter (kalender butuh satu bulan penuh, bukan satu
 * halaman). `truncated` berarti batas `maxPages` tercapai — UI wajib
 * memberitahukannya, bukan menampilkan data sebagian tanpa keterangan.
 */
export async function fetchAllDailyLogs(
  filters: DailyLogFilters,
  options?: { limit?: number; maxPages?: number },
) {
  const { enabled: _enabled, page: _page, ...rest } = filters;

  return collectAllPages(async (page, limit) => {
    const query = buildQuery({ ...rest, page, limit });
    const response = await apiGet<
      { success: boolean; message?: string } & PaginationResponse<DailyLogDTO>
    >(`/api/daily-logs?${query}`);
    if (!response.data?.success) {
      throw new Error(response.data?.message ?? "Gagal memuat log harian");
    }
    return {
      data: response.data.data ?? [],
      pagination: response.data.pagination,
    };
  }, options);
}

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
      return unwrap(response, "Gagal menyimpan log harian").data;
    },
    onSuccess: () => {
      invalidateLogQueries(queryClient);
    },
    onError: (error) => {
      errorHandlerFrontend(error);
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
      return unwrap(response, "Gagal memperbarui log harian").data;
    },
    onSuccess: () => {
      invalidateLogQueries(queryClient);
    },
    onError: (error) => {
      errorHandlerFrontend(error);
    },
  });
};

export const useDeleteDailyLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiDelete(`/api/daily-logs/${id}`);
      return unwrap(response, "Gagal menghapus log harian");
    },
    onSuccess: () => {
      invalidateLogQueries(queryClient);
    },
    onError: (error) => {
      errorHandlerFrontend(error);
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
      return unwrap(response, "Gagal mengirim log harian").data;
    },
    onSuccess: () => {
      invalidateLogQueries(queryClient);
    },
    onError: (error) => {
      errorHandlerFrontend(error);
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
      return unwrap(response, "Gagal meninjau log harian").data;
    },
    onSuccess: () => {
      invalidateLogQueries(queryClient);
    },
    onError: (error) => {
      errorHandlerFrontend(error);
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
      return unwrap(response, "Gagal menyimpan log harian").count ?? 0;
    },
    onSuccess: () => {
      invalidateLogQueries(queryClient);
    },
    onError: (error) => {
      errorHandlerFrontend(error);
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
        message?: string;
        data: TimelineEntryDTO[];
      }>(url);
      if (!response.data?.success) {
        throw new Error(
          response.data?.message ?? "Gagal memuat timeline siswa",
        );
      }
      return response.data.data;
    },
  });
};
