"use client";

import { ViolationTypes } from "@/app/(types)";
// app/api/violations/student/[id]/route.ts

import { apiGet } from "@/lib/apiClients";
import { useQuery } from "@tanstack/react-query";

export const useGetViolationsByIdTeacher = (id: string) => {
  return useQuery({
    queryKey: ["violations", id],
    queryFn: async () => {
      try {
        const res = await apiGet<ViolationTypes[]>(`/api/violations/teacher/${id}`);
        return res.data;
      } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch violations");
      }
    },
  });
};
