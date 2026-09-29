"use client";

import { type NotificationDTO } from "@/app/(types)";
import { apiGet, apiPatch } from "@/lib/apiClients";
import { errorHandlerFrontend } from "@/lib/errorHandlerFrontend";
import { type PaginationResponse } from "@/lib/pagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buildQuery, unwrap } from "./useDailyLogs";

export type NotificationListDTO = PaginationResponse<NotificationDTO> & {
  unreadCount: number;
};

export type NotificationFilters = {
  isRead?: boolean;
  page?: number;
  limit?: number;
  enabled?: boolean;
};

/**
 * GET /api/notifications — notifikasi milik aktor (identitas dari sesi, bukan
 * argumen) sehingga hook ini tidak punya jalan meminta notifikasi orang lain.
 */
export const useGetNotifications = ({
  enabled = true,
  ...filters
}: NotificationFilters = {}) => {
  return useQuery({
    queryKey: ["notifications", filters],
    enabled,
    queryFn: async (): Promise<NotificationListDTO> => {
      const query = buildQuery(filters);
      const url = query ? `/api/notifications?${query}` : "/api/notifications";
      const response = await apiGet<{ success: boolean } & NotificationListDTO>(
        url,
      );
      const { unreadCount, data, pagination } = unwrap(
        response,
        "Gagal memuat notifikasi",
      );
      return { unreadCount, data, pagination };
    },
    // Badge harus ikut berubah walau notifikasi datang dari aksi pengguna lain.
    refetchInterval: 60_000,
  });
};

/** PATCH /api/notifications — tandai satu notifikasi milik aktor sebagai dibaca. */
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiPatch<{ success: boolean }>(
        "/api/notifications",
        { id },
      );
      return unwrap(response, "Gagal menandai notifikasi").success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      errorHandlerFrontend(error);
    },
  });
};
