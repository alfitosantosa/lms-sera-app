"use client";
import { userDataMajorTypes, UserDataTypes } from "@/app/(types)";
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

export const useGetStudentByIdMajor = (id: string) => {
  return useQuery({
    queryKey: ["students", id],
    queryFn: async () => {
      try {
        const res = await apiGet<UserDataTypes[]>(`/api/students/major/${id}`);
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
    enabled: !!id,
  });
};

export const useGetStudentByIdMajorActive = (id: string) => {
  return useQuery({
    queryKey: ["students", id, "active"],
    queryFn: async () => {
      try {
        const res = await apiGet<userDataMajorTypes[]>(`/api/students/major/${id}/active`);
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
    enabled: !!id,
  });
};
