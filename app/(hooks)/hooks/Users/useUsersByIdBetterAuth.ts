"use client";

// app/api/users/route.ts

import { UserDataTypes } from "@/app/(types)/types/userData";
import { apiGet } from "@/lib/apiClients";
import { useQuery } from "@tanstack/react-query";

export const useGetUserByIdBetterAuth = (id: string) => {
  return useQuery<UserDataTypes | null>({
    queryKey: ["users", id],
    queryFn: async () => {
      const response = await apiGet<UserDataTypes>(`/api/userdata/betterauth/id/${id}`);
      return response?.data || null;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!id,
  });
};
