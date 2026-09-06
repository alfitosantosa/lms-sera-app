"use client";

import { FoundationFormData } from "@/app/(landing)/landing/register/foundation/page";
import { foundationTypes, FoundationWithCounts, FoundationCreateResponse, FoundationUpdateResponse } from "@/app/(types)/types/foundation-types";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClients";
import { errorHandlerFrontend } from "@/lib/errorHandlerFrontend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════════════════
// QUERY KEYS
// ═══════════════════════════════════════════════════════════════════════════

const FOUNDATION_QUERY_KEY = ["foundation"] as const;

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const invalidateFoundationQueries = (queryClient: any) => {
  queryClient.invalidateQueries({ queryKey: FOUNDATION_QUERY_KEY });
};

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export const useGetFoundation = () => {
  return useQuery({
    queryKey: FOUNDATION_QUERY_KEY,
    queryFn: async () => {
      const response = await apiGet<FoundationWithCounts[]>("/api/foundation");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateFoundation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FoundationFormData) => {
      const response = await apiPost<FoundationFormData>("/api/foundation", data);
      return response.data;
    },

    onSuccess: async (data, variables) => {
      // Invalidate foundation queries
      invalidateFoundationQueries(queryClient);

      // CRITICAL: Also invalidate user data cache to force refetch with updated foundationId
      queryClient.invalidateQueries({ queryKey: ["users-profile"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });

      // Wait for user cache to be cleared and potentially refetched
      // Use the userId from the submitted form data
      if (variables.userId) {
        await queryClient.refetchQueries({
          queryKey: ["users-profile", variables.userId],
        });
      }

      toast.success("Foundation created successfully!");
    },

    onError: (error) => {
      errorHandlerFrontend(error);
    },
  });
};

export const useUpdateFoundation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: foundationTypes) => {
      const response = await apiPut<FoundationUpdateResponse>("/api/foundation", data);
      return response.data;
    },

    onSuccess: () => {
      invalidateFoundationQueries(queryClient);
      toast.success("Foundation updated successfully!");
    },

    onError: (error) => {
      errorHandlerFrontend(error);
    },
  });
};

export const useDeleteFoundation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiDelete<FoundationCreateResponse>("/api/foundation", {
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    },

    onSuccess: () => {
      invalidateFoundationQueries(queryClient);
      toast.success("Foundation deleted successfully!");
    },

    onError: (error) => {
      errorHandlerFrontend(error);
    },
  });
};
