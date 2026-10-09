"use client";

import {
  type AssessmentPeriodDTO,
  type AssessmentPeriodInput,
  type AssessmentScaleDTO,
  type AssessmentScaleInput,
  type BootstrapResultDTO,
  type DevelopmentAreaDTO,
  type DevelopmentAreaInput,
  type DevelopmentIndicatorDTO,
  type DevelopmentIndicatorInput,
} from "@/app/(types)";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/apiClients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type ListBody<T> = { success: boolean; data: T[] };

async function fetchList<T>(url: string): Promise<T[]> {
  const response = await apiGet<ListBody<T>>(url);
  return response.data?.data ?? [];
}

// ─── Periode ──────────────────────────────────────────────────────────────────

export const useGetPeriods = (filters?: {
  academicYearId?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ["development-periods", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.academicYearId)
        params.append("academicYearId", filters.academicYearId);
      if (filters?.status) params.append("status", filters.status);
      const url = params.toString()
        ? `/api/development/periods?${params.toString()}`
        : "/api/development/periods";
      return fetchList<AssessmentPeriodDTO>(url);
    },
  });
};

export const useCreatePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AssessmentPeriodInput) => {
      const response = await apiPost<AssessmentPeriodDTO>(
        "/api/development/periods",
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["development-periods"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useUpdatePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: AssessmentPeriodInput;
    }) => {
      const response = await apiPatch<AssessmentPeriodDTO>(
        `/api/development/periods/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["development-periods"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useDeletePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiDelete(`/api/development/periods/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["development-periods"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

// ─── Area ─────────────────────────────────────────────────────────────────────

export const useGetAreas = (filters?: { isActive?: boolean }) => {
  return useQuery({
    queryKey: ["development-areas", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.isActive !== undefined)
        params.append("isActive", String(filters.isActive));
      const url = params.toString()
        ? `/api/development/areas?${params.toString()}`
        : "/api/development/areas";
      return fetchList<DevelopmentAreaDTO>(url);
    },
  });
};

export const useCreateArea = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: DevelopmentAreaInput) => {
      const response = await apiPost<DevelopmentAreaDTO>(
        "/api/development/areas",
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["development-areas"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

// ─── Indikator ────────────────────────────────────────────────────────────────

export const useGetIndicators = (filters?: {
  areaId?: string;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: ["development-indicators", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.areaId) params.append("areaId", filters.areaId);
      if (filters?.isActive !== undefined)
        params.append("isActive", String(filters.isActive));
      const url = params.toString()
        ? `/api/development/indicators?${params.toString()}`
        : "/api/development/indicators";
      return fetchList<DevelopmentIndicatorDTO>(url);
    },
  });
};

export const useCreateIndicator = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: DevelopmentIndicatorInput) => {
      const response = await apiPost<DevelopmentIndicatorDTO>(
        "/api/development/indicators",
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["development-indicators"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

// ─── Skala ────────────────────────────────────────────────────────────────────

export const useGetScales = (filters?: { isActive?: boolean }) => {
  return useQuery({
    queryKey: ["development-scales", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.isActive !== undefined)
        params.append("isActive", String(filters.isActive));
      const url = params.toString()
        ? `/api/development/scales?${params.toString()}`
        : "/api/development/scales";
      return fetchList<AssessmentScaleDTO>(url);
    },
  });
};

export const useCreateScale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AssessmentScaleInput) => {
      const response = await apiPost<AssessmentScaleDTO>(
        "/api/development/scales",
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["development-scales"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

// ─── Bootstrap ────────────────────────────────────────────────────────────────

export const useBootstrapDevelopment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiPost<{ created: BootstrapResultDTO }>(
        "/api/development/bootstrap",
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["development-areas"] });
      queryClient.invalidateQueries({ queryKey: ["development-indicators"] });
      queryClient.invalidateQueries({ queryKey: ["development-scales"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
