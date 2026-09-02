"use client";
import { ClassDataTypes } from "@/app/(types)";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Add explicit return type to the hook
// export const useGetItems = () => {
//   return useQuery<ItemType[]>({  // ← Generic type here
//     queryKey: ["items"],
//     queryFn: async (): Promise<ItemType[]> => {  // ← Return type here
//       const res = await apiGet<ItemType[]>("/api/items");  // ← Generic here too
//       return res.data;
//     },
//   });
// };

export const useGetClasses = () => {
  return useQuery<ClassDataTypes[]>({
    queryKey: ["classes"],
    queryFn: async () => {
      const res = await apiGet<ClassDataTypes[]>("/api/class");
      return res.data;
    },
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiPost("/api/class", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: (error: any) => {
      console.error("Error creating class:", error);
      throw new Error(error?.response?.data?.message || "Failed to create class");
    },
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiPut("/api/class", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: (error: any) => {
      console.error("Error updating class:", error);
      throw new Error(error?.response?.data?.message || "Failed to update class");
    },
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiDelete(`/api/class/`, {
        body: JSON.stringify({ id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: (error: any) => {
      console.error("Error deleting class:", error);
      throw new Error(error?.response?.data?.message || "Failed to delete class");
    },
  });
};
