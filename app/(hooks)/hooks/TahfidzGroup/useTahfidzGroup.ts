"use client";
import {
  type CreateTahfidzGroupInput,
  type TahfidzGroupData,
  type UpdateTahfidzGroupInput,
} from "@/app/(types)/types/tahfidzgroup-types";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// apiPost/apiPut/apiDelete tidak melempar error pada status 4xx/5xx,
// jadi pesan error dari backend (mis. validasi Sekolah 400/403) harus diangkat manual.
const unwrap = <T,>(res: { status: number; data: T }, fallback: string): T => {
  if (res.status >= 400) {
    const body = (res.data ?? {}) as { error?: string; message?: string };
    throw new Error(body.error || body.message || fallback);
  }
  return res.data;
};

export const useGetTahfidzGroup = (filters?: { branchId?: string }) => {
  return useQuery<TahfidzGroupData[]>({
    queryKey: ["tahfidzgroup", filters],
    queryFn: async (): Promise<TahfidzGroupData[]> => {
      const params = new URLSearchParams();

      if (filters?.branchId) {
        params.append("branchId", filters.branchId);
      }

      const url = params.toString()
        ? `/api/tahfidzgroup?${params.toString()}`
        : "/api/tahfidzgroup";
      const res = await apiGet<TahfidzGroupData[]>(url);
      return res.data;
    },
  });
};

export const useCreateTahfidzGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTahfidzGroupInput) => {
      const res = await apiPost("/api/tahfidzgroup", data);
      return unwrap(res, "Gagal membuat kelompok tahfidz");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tahfidzgroup"] });
    },
  });
};

export const useUpdateTahfidzGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateTahfidzGroupInput) => {
      const res = await apiPut("/api/tahfidzgroup", data);
      return unwrap(res, "Gagal memperbarui kelompok tahfidz");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tahfidzgroup"] });
    },
  });
};

export const useDeleteTahfidzGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiDelete(`/api/tahfidzgroup/`, {
        body: JSON.stringify({ id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return unwrap(response, "Gagal menghapus kelompok tahfidz");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tahfidzgroup"] });
    },
  });
};
