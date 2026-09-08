"use client";
import { BetterAuthUser } from "@/components/dialog/DialogUser";
import { apiGet } from "@/lib/apiClients";
import { useQuery } from "@tanstack/react-query";

export const useGetBetterAuthWithoutUserData = () => {
  return useQuery({
    queryKey: ["betterauth", "users", "withoutUserData"],
    queryFn: async () => {
      try {
        const res = await apiGet<BetterAuthUser[]>("/api/betterauth/users/withoutuserdata");
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
  });
};
