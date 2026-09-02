"use client";
import { AccountBankInput, AccountBankTypes } from "@/app/(types)";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetAccountBank = () => {
  return useQuery({
    queryKey: ["accountbank"],
    queryFn: async () => {
      const res = await apiGet<AccountBankTypes[]>("/api/accountbank");
      return res.data;
    },
  });
};

export const useCreateAccountBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AccountBankInput) => {
      const res = await apiPost("/api/accountbank", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountbank"] });
    },
  });
};

export const useUpdateAccountBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AccountBankInput) => {
      const res = await apiPut("/api/accountbank", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountbank"] });
      queryClient.invalidateQueries({ queryKey: ["accountbank-by-id-major"] });
    },
  });
};

export const useDeleteAccountBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiDelete(`/api/accountbank/`, {
        body: JSON.stringify({ id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountbank"] });
    },
  });
};

export const useGetAccountBankByIdMajor = (majorId: string) => {
  return useQuery({
    queryKey: ["accountbank-by-id-major", majorId],
    queryFn: async () => {
      const res = await apiGet<AccountBankTypes[]>(`/api/accountbank/major/${majorId}`);
      return res.data;
    },
  });
};
