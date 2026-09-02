"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

const isDev = process.env.NODE_ENV === "development";

/**
 * Cache strategies berdasarkan volatilitas data.
 * Gunakan di level hook: useQuery({ ...CACHE_STRATEGIES.static, ... })
 */
export const CACHE_STRATEGIES = {
  // Data statis yang jarang berubah (majors, roles, academic years, subjects)
  static: {
    staleTime: isDev ? 0 : 1000 * 60 * 60, // 1 jam
    gcTime: 1000 * 60 * 60 * 2, // 2 jam
  },
  // Data dinamis dengan update moderat (payments, schedules, attendance)
  dynamic: {
    staleTime: 5 * 60 * 1000, // 5 menit
    gcTime: 30 * 60 * 1000, // 30 menit
  },
  // Data real-time yang sering berubah (live attendance, scores)
  realtime: {
    staleTime: 30 * 1000, // 30 detik
    gcTime: 5 * 60 * 1000, // 5 menit
  },
} as const;

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default: strategi dynamic (5 menit fresh)
            ...CACHE_STRATEGIES.dynamic,
            // Kurangi retry dari 2 -> 1 untuk gagal lebih cepat
            retry: 1,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Matikan refetch on focus untuk mengurangi request tidak perlu
            refetchOnWindowFocus: false,
            // Revalidate jika stale, tapi tetap tampilkan cached data dulu
            refetchOnMount: true,
            refetchIntervalInBackground: false,
          },
          mutations: {
            retry: 1,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
