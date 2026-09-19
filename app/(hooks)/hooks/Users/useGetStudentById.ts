"use client";
import { type userDataBranchTypes, type UserDataTypes } from "@/app/(types)";
import { apiGet } from "@/lib/apiClients";
import { useQuery } from "@tanstack/react-query";

export const useGetStudentById = (id: string) => {
  return useQuery({
    queryKey: ["students", id],
    queryFn: async () => {
      try {
        const res = await apiGet<UserDataTypes>(`/api/students/${id}`);
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
    enabled: !!id,
  });
};

export const useGetStudentByIdBranch = (id: string) => {
  return useQuery({
    queryKey: ["students", id],
    queryFn: async () => {
      try {
        const res = await apiGet<UserDataTypes[]>(`/api/students/branch/${id}`);
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
    enabled: !!id,
  });
};

export const useGetStudentByIdBranchActive = (id: string) => {
  return useQuery({
    queryKey: ["students", id, "active"],
    queryFn: async () => {
      try {
        const res = await apiGet<userDataBranchTypes[]>(
          `/api/students/branch/${id}/active`,
        );
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
    enabled: !!id,
  });
};
