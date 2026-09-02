"use client";
import { UserDataTypes } from "@/app/(types)";
import { apiGet } from "@/lib/apiClients";
import { useQuery } from "@tanstack/react-query";

export const useGetStudents = () => {
  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      try {
        const res = await apiGet<UserDataTypes[]>("/api/students");
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
  });
};

export const useGetStudentByIdTahfidzGroup = (id: string) => {
  return useQuery({
    queryKey: ["students-by-tahfidz-group", id],
    queryFn: async () => {
      try {
        const res = await apiGet<UserDataTypes[]>(`/api/students/tahfidzgroup/${id}`);
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
  });
};
