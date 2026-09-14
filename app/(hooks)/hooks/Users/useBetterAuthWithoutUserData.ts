"use client";
import { BetterAuthUser } from "@/components/dialog/DialogUser";
import { apiGet } from "@/lib/apiClients";
import { useQuery } from "@tanstack/react-query";

export const useGetBetterAuthWithoutUserData = (foundationId?: string) => {
  return useQuery<BetterAuthUser[]>({
    queryKey: ["betterauth", "users", "withoutUserData", foundationId],
    queryFn: async () => {
      try {
        const res = await apiGet<BetterAuthUser[]>("/api/betterauth/users/withoutuserdata", {
          params: foundationId ? { foundationId } : undefined,
        });
        return res.data ?? [];
      } catch (error) {
        console.error(error);
        return [];
      }
    },
  });
};
