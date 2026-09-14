"use client";
import { RoleDataTypes, RoleUpdateData, RolesInputData } from "@/app/(types)";
import { CACHE_STRATEGIES } from "@/app/client/providers";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await apiGet<RoleDataTypes[]>("/api/roles");
      return res.data;
    },
    // ✅ Roles are static - cache for 1 hour
    ...CACHE_STRATEGIES.static,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RolesInputData) => {
      const res = await apiPost("/api/roles", data);

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RoleUpdateData) => {
      const res = await apiPut("/api/roles", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiDelete("/api/roles", {
        body: JSON.stringify({ id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
