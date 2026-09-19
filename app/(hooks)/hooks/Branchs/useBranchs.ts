import {
  BranchFormValues,
  branchTypes,
} from "@/app/(types)/types/branchs-types";
import { CACHE_STRATEGIES } from "@/app/client/providers";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Type for API response (matches what the API returns with _count)
export interface BranchData {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  description: string | null;
  isActive: boolean;
  adminName: string;
  signatureUrl: string;
  _count: {
    classes: number;
    students: number;
    subjects: number;
    paymenttype: number;
  };
}

export const useGetBranchs = () => {
  return useQuery({
    queryKey: ["branchs"],
    queryFn: async () => {
      const res = await apiGet<BranchData[]>("/api/branch");
      return res.data;
    },
    ...CACHE_STRATEGIES.static,
  });
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BranchFormValues) => {
      const res = await apiPost("/api/branch", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branchs"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BranchFormValues & { id: string }) => {
      const res = await apiPut("/api/branch", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branchs"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiDelete(`/api/branch`, {
        body: JSON.stringify({ id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branchs"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useGetBranchById = (id: string) => {
  return useQuery({
    queryKey: ["branch", id],
    queryFn: async () => {
      try {
        const res = await apiGet<branchTypes>(`/api/branch/${id}`);
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
  });
};
