"use client";
import { UserDataTypes } from "@/app/(types)";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClients";
import { useQuery } from "@tanstack/react-query";

export const useGetTeachers = () => {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const res = await apiGet<UserDataTypes[]>("/api/teachers");
      return res.data;
    },
  });
};

export const useCreateTeacher = () => {
  return async (data: any) => {
    try {
      const res = await apiPost("/api/teachers", data);
      return res.data;
    } catch (error) {
      console.error(error);
    }
  };
};

export const useUpdateTeacher = () => {
  return async (data: any) => {
    try {
      const res = await apiPut("/api/teachers", data);
      return res.data;
    } catch (error) {
      console.error(error);
    }
  };
};

export const useDeleteTeacher = () => {
  return async (id: string) => {
    try {
      const res = await apiDelete(`/api/teachers?id=${id}`);
      return res.data;
    } catch (error) {
      console.error(error);
    }
  };
};
