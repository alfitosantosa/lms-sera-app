"use client";

// app/api/users/teacher/[id]

import { apiGet } from "@/lib/apiClients";
import { useQuery } from "@tanstack/react-query";

export const useGetUserByIdTeacher = (id: string) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      try {
        const res = await apiGet(`/api/users/id/${id}`);
        return res.data;
      } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch user");
      }
    },
    enabled: !!id, // Only run query if id exists
  });
};
