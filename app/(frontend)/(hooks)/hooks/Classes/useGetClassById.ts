"use client";

import { ClassDataTypes } from "@/app/(types)";
import { apiGet } from "@/lib/apiClients";
import { useQuery } from "@tanstack/react-query";

export const useGetClassById = (id: string) => {
  return useQuery({
    queryKey: ["class", id],
    queryFn: async () => {
      try {
        const res = await apiGet<ClassDataTypes[]>(`/api/class/${id}`);
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
    enabled: !!id,
  });
};

export const useGetClassByIdMajor = (id: string) => {
  return useQuery({
    queryKey: ["class", id],
    queryFn: async () => {
      try {
        const res = await apiGet<ClassDataTypes[]>(`/api/class/major/${id}`);
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
    enabled: !!id,
  });
};
