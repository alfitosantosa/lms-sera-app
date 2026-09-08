"use client";

import { ClassDataTypes } from "@/app/(types)";
import { apiGet } from "@/lib/apiClients";
import { useQuery } from "@tanstack/react-query";

export const useClassByIdUser = (id: string) => {
  return useQuery({
    queryKey: ["class", id],
    queryFn: async () => {
      try {
        const res = await apiGet<ClassDataTypes>(`/api/class/user/${id}`);
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
    enabled: !!id,
  });
};
