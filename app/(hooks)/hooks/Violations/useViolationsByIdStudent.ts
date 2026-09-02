"use client";

import { ViolationTypes } from "@/app/(types)";
// app/api/violations/student/[id]/route.ts

import { apiGet } from "@/lib/apiClients";
import { useQuery } from "@tanstack/react-query";

export const useGetViolationsByIdStudent = (id: string) => {
  return useQuery({
    queryKey: ["violations", id],
    queryFn: async () => {
      try {
        const res = await apiGet<ViolationTypes[]>(`/api/violations/student/${id}`);
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
  });
};
