"use client";
import { AcademicYearDataTypes, AcademicYearInputData, AcademicYearUpdateData } from "@/app/(types)";
import { CACHE_STRATEGIES } from "@/app/client/providers";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetAcademicYears = () => {
  return useQuery({
    queryKey: ["academicYears"],
    queryFn: async () => {
      try {
        const res = await apiGet<AcademicYearDataTypes[]>("/api/academicyear");
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
    // ✅ Academic years are static - cache for 1 hour (change only at semester boundaries)
    ...CACHE_STRATEGIES.static,
  });
};

export const useCreateAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AcademicYearInputData) => {
      const res = await apiPost<AcademicYearInputData>("/api/academicyear", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academicYears"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useUpdateAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AcademicYearUpdateData) => {
      const res = await apiPut<AcademicYearDataTypes>("/api/academicyear", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academicYears"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useDeleteAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiDelete<AcademicYearDataTypes>(`/api/academicyear`, {
        body: JSON.stringify({ id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academicYears"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
