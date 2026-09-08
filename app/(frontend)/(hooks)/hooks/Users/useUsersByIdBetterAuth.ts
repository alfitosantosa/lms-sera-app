"use client";

// app/api/users/route.ts

import { UserDataTypes } from "@/app/(types)/types/userData-types";
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

export const useGetUserByIdBetterAuthProfile = (id: string) => {
  return useQuery<UserDataTypes | null>({
    queryKey: ["users-profile", id],
    queryFn: async () => {
      try {
        if (!id) {
          throw new Error("User ID is required");
        }
        const response = await apiGet<UserDataTypes>(`/api/userdata/betterauth/id/${id}`);
        return response?.data || null;
      } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if it's a 404 (user not found)
      if (error?.message?.includes("404") || error?.message?.includes("not found")) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!id && id.length > 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};
