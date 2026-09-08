"use client";
import { PaymentData, PaymentInput } from "@/app/(types)";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PaymentInput) => {
      const res = await apiPost<PaymentData>("/api/payment", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-by-id-major"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["unpaid-students"] });
      queryClient.invalidateQueries({ queryKey: ["payment-items-filter-date"] });
      queryClient.invalidateQueries({ queryKey: ["payments-by-date"] });
    },
  });
};

export const useCreatePaymentBulk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PaymentInput[]) => {
      const res = await apiPost("/api/payment/student/bulk", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PaymentInput & { id: string }) => {
      const res = await apiPut("/api/payment", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payments-by-date"] });
    },
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiDelete(`/api/payment/`, {
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payments-by-date"] });
    },
    onError: (error: unknown) => {
      console.error("Error deleting payment:", error);
      const errorMessage = error && typeof error === "object" && "response" in error ? (error as { response?: { data?: { message?: string } } }).response?.data?.message : undefined;
      throw new Error(errorMessage || "Failed to delete payment", { cause: error });
    },
  });
};

export const useGetPaymentById = (id: string) => {
  return useQuery({
    queryKey: ["payment", id],
    queryFn: async () => {
      const res = await apiGet<PaymentData>(`/api/payment/${id}`);
      return res.data;
    },
  });
};

export const useGetPaymentByIdMajor = (majorId: string) => {
  return useQuery({
    queryKey: ["payment-by-id-major", majorId],
    queryFn: async () => {
      const res = await apiGet<PaymentData[]>(`/api/payment/major/${majorId}`);
      return res.data;
    },
  });
};

export const useGetPaymentByStudentId = (studentId: string) => {
  return useQuery({
    queryKey: ["payment-by-id", "midtransTransaction", studentId],
    queryFn: async () => {
      const res = await apiGet<PaymentData[]>(`/api/payment/student/${studentId}`);
      return res.data;
    },
  });
};
