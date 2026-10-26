"use client";

import { type ClassDataTypes } from "@/types";
import { apiGet } from "@/lib/http/apiClient";
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

export const useGetClassByIdBranch = (id: string) => {
  return useQuery({
    queryKey: ["class", id],
    queryFn: async () => {
      try {
        const res = await apiGet<ClassDataTypes[]>(`/api/class/branch/${id}`);
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
    enabled: !!id,
  });
};
