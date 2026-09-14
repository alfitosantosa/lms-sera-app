"use client";
import { apiPost } from "@/lib/apiClients";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdatePaymentTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiPost("/api/payment/transaction", data);
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
