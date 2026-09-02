"use client";
import { PaymentTypeInput, PaymentTypeTypes } from "@/app/(types)";
import { CACHE_STRATEGIES } from "@/app/client/providers";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetPaymentTypes = () => {
  return useQuery({
    queryKey: ["paymentTypes"],
    queryFn: async () => {
      const res = await apiGet<PaymentTypeTypes[]>("/api/paymenttype");
      return res.data;
    },
    // ✅ Payment types are static - cache for 1 hour
    ...CACHE_STRATEGIES.static,
  });
};

export const useCreatePaymentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PaymentTypeInput) => {
      const res = await apiPost("/api/paymenttype", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentTypes"] });
    },
  });
};

export const useUpdatePaymentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PaymentTypeInput) => {
      const res = await apiPut("/api/paymenttype", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentTypes"] });
    },
  });
};

export const useDeletePaymentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiDelete(`/api/paymenttype/`, {
        body: JSON.stringify({ id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentType"] });
    },
  });
};

export const useGetPaymentTypeById = (id: string) => {
  return useQuery({
    queryKey: ["paymentType", id],
    queryFn: async () => {
      const res = await apiGet(`/api/paymenttype/${id}`);
      return res.data;
    },
  });
};

export const useGetPaymentTypeByIdMajor = (id: string) => {
  return useQuery({
    queryKey: ["paymentType", id],
    queryFn: async () => {
      const res = await apiGet<PaymentTypeTypes[]>(`/api/paymenttype/major/${id}`);
      return res.data;
    },
  });
};
