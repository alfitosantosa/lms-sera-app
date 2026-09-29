"use client";

import { type DevelopmentMeDTO } from "@/app/(types)";
import { apiGet } from "@/lib/apiClients";
import { useQuery } from "@tanstack/react-query";
import { unwrap } from "./useDailyLogs";

/**
 * GET /api/development/me — ringkasan portal orang tua/siswa.
 *
 * Tidak ada parameter: identitas (anak mana / siswa mana) ditentukan backend
 * dari sesi, jadi hook ini tidak punya jalan untuk meminta data orang lain.
 */
export const useGetDevelopmentMe = (enabled = true) => {
  return useQuery({
    queryKey: ["development-me"],
    enabled,
    queryFn: async (): Promise<DevelopmentMeDTO> => {
      const response = await apiGet<{
        success: boolean;
        message?: string;
        data: DevelopmentMeDTO;
      }>("/api/development/me");
      return unwrap(response, "Gagal memuat ringkasan perkembangan").data;
    },
  });
};
