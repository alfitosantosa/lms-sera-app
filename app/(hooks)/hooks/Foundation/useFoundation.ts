"use client";

import { type FoundationFormData } from "@/app/(frontend)/(landing)/landing/register/foundation/page";
import {
  type foundationTypes,
  type FoundationWithCounts,
  type FoundationCreateResponse,
  type FoundationUpdateResponse,
  type FoundationAssignUserTypes,
} from "@/app/(types)/types/foundation-types";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/apiClients";
import { errorHandlerFrontend } from "@/lib/errorHandler/errorHandlerFrontend";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { validate } from "zod";

// ═══════════════════════════════════════════════════════════════════════════
// QUERY KEYS
// ═══════════════════════════════════════════════════════════════════════════

const FOUNDATION_QUERY_KEY = ["foundation"] as const;

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const invalidateFoundationQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: FOUNDATION_QUERY_KEY });
};

/**
 * Setelah user dibuat/dipindah ke sebuah yayasan, `foundationId` berubah di dua
 * query yang dipakai halaman profil: `["users-profile", userId]` (userData) dan
 * `["betterauth-by-id", userId]` (user + foundation). Keduanya fresh 5 menit,
 * jadi tanpa invalidasi halaman profil tetap menampilkan "Belum Terdaftar" dan
 * user memasukkan kode yayasan berulang. Refetch ditunggu agar redirect ke
 * profil sudah membawa data baru (tanpa kedipan state lama).
 */
const invalidateUserFoundationQueries = async (
  queryClient: QueryClient,
  userId?: string,
): Promise<void> => {
  queryClient.invalidateQueries({ queryKey: ["users-profile"] });
  queryClient.invalidateQueries({ queryKey: ["users"] });

  if (!userId) return;

  queryClient.invalidateQueries({ queryKey: ["betterauth-by-id", userId] });
  // `type: "all"`: saat join, query profil belum tentu punya observer (mis. halaman
  // register hanya memakai users-profile), jadi jangan hanya refetch yang aktif.
  await Promise.all([
    queryClient.refetchQueries({
      queryKey: ["users-profile", userId],
      type: "all",
    }),
    queryClient.refetchQueries({
      queryKey: ["betterauth-by-id", userId],
      type: "all",
    }),
  ]);
};

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export const useGetFoundation = () => {
  return useQuery({
    queryKey: FOUNDATION_QUERY_KEY,
    queryFn: async () => {
      const response = await apiGet<FoundationWithCounts[]>("/api/foundation");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateFoundation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FoundationFormData) => {
      const response = await apiPost<FoundationFormData>(
        "/api/foundation",
        data,
      );
      return response.data;
    },

    onSuccess: async (data, variables) => {
      // Invalidate foundation queries
      invalidateFoundationQueries(queryClient);

      // Profil di-redirect setelah ini: tunggu cache user ter-refresh dulu
      // supaya halaman tidak menampilkan "Belum Terdaftar".
      await invalidateUserFoundationQueries(queryClient, variables.userId);

      toast.success("Foundation created successfully!");
    },

    onError: (error) => {
      errorHandlerFrontend(error);
    },
  });
};

export const useUpdateFoundation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: foundationTypes) => {
      const response = await apiPut<FoundationUpdateResponse>(
        "/api/foundation",
        data,
      );
      return response.data;
    },

    onSuccess: () => {
      invalidateFoundationQueries(queryClient);
      toast.success("Foundation updated successfully!");
    },

    onError: (error) => {
      errorHandlerFrontend(error);
    },
  });
};

export const useDeleteFoundation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiDelete<FoundationCreateResponse>(
        "/api/foundation",
        {
          body: JSON.stringify({ id }),
          headers: { "Content-Type": "application/json" },
        },
      );
      return response.data;
    },

    onSuccess: () => {
      invalidateFoundationQueries(queryClient);
      toast.success("Foundation deleted successfully!");
    },

    onError: (error) => {
      errorHandlerFrontend(error);
    },
  });
};

export const useFoundationAssignUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FoundationAssignUserTypes) => {
      const response = await apiPost("/api/foundation/assign", data);
      return response.data;
    },
    onSuccess: async (_data, variables) => {
      toast.success("Berhasil Masuk Menggunakan Code Yayasan");
      // Refetch ditunggu: halaman profil baru membaca foundationId dari query ini.
      await invalidateUserFoundationQueries(queryClient, variables.userId);
    },
    onError: (error) => {
      errorHandlerFrontend(error);
    },
  });
};
