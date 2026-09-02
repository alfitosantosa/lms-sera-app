"use client";
import { betterauthUser } from "@/app/(types)/types/betterauth-types";
import { apiGet } from "@/lib/apiClients";
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
