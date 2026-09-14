"use client";
import { SubjectTypes, SubjectInput } from "@/app/(types)/types/subject-types";
import { CACHE_STRATEGIES } from "@/app/client/providers";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetSubjects = () => {
  return useQuery<SubjectTypes[]>({
    queryKey: ["subjects"],
    queryFn: async (): Promise<SubjectTypes[]> => {
      const response = await apiGet<SubjectTypes[]>("/api/subjects");
      return response.data;
    },
    // ✅ Subjects are static - cache for 1 hour
    ...CACHE_STRATEGIES.static,
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SubjectInput) => {
      const response = await apiPost("/api/subjects", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SubjectInput & { id: string }) => {
      const response = await apiPut(`/api/subjects/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiDelete(`/api/subjects`, {
        body: JSON.stringify({ id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
