"use client";
import { type betterauthUser } from "@/app/(types)/types/betterauth-types";
import { apiGet, apiPost } from "@/lib/apiClients";
import { useQuery } from "@tanstack/react-query";

export const useGetBetterAuth = () => {
  return useQuery({
    queryKey: ["betterauth"],
    queryFn: async () => {
      try {
        const res = await apiGet<betterauthUser[]>("/api/betterauth/users");
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
  });
};

export const useGetBetterAuthById = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["betterauth-by-id", userId],
    queryFn: async () => {
      try {
        const res = await apiPost<betterauthUser>("/api/betterauth/users", {
          userId,
        });
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
    enabled: !!userId, // Only fetch when userId is available
  });
};
