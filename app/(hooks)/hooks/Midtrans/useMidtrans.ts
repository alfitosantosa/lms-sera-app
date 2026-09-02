"use client";
import { apiGet, apiPost } from "@/lib/apiClients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateSnapMidtransTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiPost("/api/midtrans", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["midtransTransaction"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useCheckMidtransTransactionStatus = (orderId: string) => {
  return useQuery({
    queryKey: ["midtransTransactionStatus", orderId],
    queryFn: async () => {
      const res = await apiGet(`/api/midtrans/status/${orderId}`);
      return res.data;
    },
    enabled: !!orderId,
  });
};

export const useUpdateMidtransSuccessTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiPost("/api/payment/success", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-by-id"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useMidtransCheckStatusOderId = () => {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const res = await apiGet(`/api/midtrans/status/${orderId}`);
      return res.data;
    },
  });
};
