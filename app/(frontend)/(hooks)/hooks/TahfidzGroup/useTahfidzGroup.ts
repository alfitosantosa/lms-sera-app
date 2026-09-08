"use client";
import { CreateTahfidzGroupInput, TahfidzGroupData, UpdateTahfidzGroupInput } from "@/app/(types)/types/tahfidzgroup-types";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetTahfidzGroup = () => {
  return useQuery<TahfidzGroupData[]>({
    queryKey: ["tahfidzgroup"],
    queryFn: async (): Promise<TahfidzGroupData[]> => {
      const res = await apiGet<TahfidzGroupData[]>("/api/tahfidzgroup");
      return res.data;
    },
  });
};

export const useCreateTahfidzGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTahfidzGroupInput) => {
      const res = await apiPost("/api/tahfidzgroup", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tahfidzgroup"] });
    },
  });
};

export const useUpdateTahfidzGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateTahfidzGroupInput) => {
      const res = await apiPut("/api/tahfidzgroup", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tahfidzgroup"] });
    },
  });
};

export const useDeleteTahfidzGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiDelete(`/api/tahfidzgroup/`, {
        body: JSON.stringify({ id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tahfidzgroup"] });
    },
  });
};
