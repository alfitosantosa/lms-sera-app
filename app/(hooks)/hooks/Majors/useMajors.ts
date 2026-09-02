import { MajorFormValues, majorTypes } from "@/app/(types)";
import { CACHE_STRATEGIES } from "@/app/client/providers";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Type for API response (matches what the API returns with _count)
export interface MajorData {
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

export const useGetMajors = () => {
  return useQuery({
    queryKey: ["majors"],
    queryFn: async () => {
      const res = await apiGet<MajorData[]>("/api/major");
      return res.data;
    },
    // ✅ Majors are static - cache for 1 hour (rarely change during a session)
    ...CACHE_STRATEGIES.static,
  });
};

export const useCreateMajor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: MajorFormValues) => {
      const res = await apiPost("/api/major", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["majors"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useUpdateMajor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: MajorFormValues & { id: string }) => {
      const res = await apiPut("/api/major", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["majors"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useDeleteMajor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiDelete(`/api/major`, {
        body: JSON.stringify({ id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["majors"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useGetMajorById = (id: string) => {
  return useQuery({
    queryKey: ["major", id],
    queryFn: async () => {
      try {
        const res = await apiGet<majorTypes>(`/api/major/${id}`);
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
  });
};
