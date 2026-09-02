"use client";

import { apiGet } from "@/lib/apiClients";
import { useQuery } from "@tanstack/react-query";

export const useRolesByIdUser = (id: string) => {
  return useQuery({
    queryKey: ["class", id],
    queryFn: async () => {
      try {
        const res = await apiGet(`/api/roles/user/id/${id}`);
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
    enabled: !!id,
  });
};
