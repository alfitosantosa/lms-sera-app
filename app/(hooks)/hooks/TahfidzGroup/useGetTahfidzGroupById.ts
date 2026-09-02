"use client";
import { tahfidzGroupTypes } from "@/app/(types)";
import { apiGet } from "@/lib/apiClients";
import { useQuery } from "@tanstack/react-query";

export const useGetTahfidzGroupById = (id: string) => {
  return useQuery({
    queryKey: ["tahfidzgroup", id],
    queryFn: async () => {
      try {
        const res = await apiGet<tahfidzGroupTypes>(`/api/tahfidzgroup/id/${id}`);
        return res.data;
      } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch tahfidz group");
      }
    },
    enabled: !!id,
  });
};
