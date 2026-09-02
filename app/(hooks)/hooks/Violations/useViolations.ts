import { ViolationInput, ViolationTypes } from "@/app/(types)";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetViolations = () => {
  return useQuery({
    queryKey: ["violations"],
    queryFn: async () => {
      try {
        const response = await apiGet<ViolationTypes[]>("/api/violations");
        return response.data;
      } catch (error) {
        console.error(error);
      }
    },
  });
};

export const useCreateViolation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ViolationInput) => {
      const response = await apiPost("/api/violations", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["violations"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useUpdateViolation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ViolationInput) => {
      const response = await apiPut("/api/violations", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["violations"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useDeleteViolation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiDelete("/api/violations", {
        body: JSON.stringify({ id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["violations"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
