"use client";

import { apiPost } from "@/lib/apiClients";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useBulkCreateSchedulesData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiPost("/api/schedules/bulk/create", data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
    onError: (error: any) => {
      console.error("Error creating bulk schedules:", error);
      // You can add more specific error handling here if needed
    },
  });
};
