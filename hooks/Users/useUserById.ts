"use client";

import { type UserDataTypes } from "@/types";
// app/api/users/route.ts

import { apiGet } from "@/lib/http/apiClient";
import { useQuery } from "@tanstack/react-query";

export const useGetUserById = (id: string) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      try {
        const res = await apiGet<UserDataTypes[]>(`/api/userdata/id/${id}`);
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
    enabled: !!id,
  });
};
