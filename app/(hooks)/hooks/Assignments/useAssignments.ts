"use client";

import {
  type AssignmentDTO,
  type AssignmentGradeInput,
  type AssignmentInput,
  type AssignmentSubmissionDTO,
  type AssignmentSubmissionInput,
  type AssignmentUpdateInput,
  type GradeTypeDTO,
  type GradeTypeInput,
} from "@/app/(types)";
import {
  buildQuery,
  unwrap,
} from "@/app/(hooks)/hooks/Development/useDailyLogs";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/apiClients";
import { errorHandlerFrontend } from "@/lib/errorHandlerFrontend";
import { type PaginationResponse } from "@/lib/pagination";
import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

/**
 * Mutasi tugas mengubah daftar tugas, daftar pengumpulan, dan timeline siswa
 * (evidence LINK muncul di sana) — satu tempat agar tidak ada layar tertinggal.
 */
function invalidateAssignmentQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["assignments"] });
  queryClient.invalidateQueries({ queryKey: ["assignment-submissions"] });
  queryClient.invalidateQueries({ queryKey: ["student-timeline"] });
  queryClient.invalidateQueries({ queryKey: ["development-me"] });
}

export type AssignmentFilters = {
  classId?: string;
  subjectId?: string;
  teacherId?: string;
  isPublished?: boolean;
  isActive?: boolean;
  page?: number;
  limit?: number;
  /** Bukan query param — menahan query sampai datanya siap. */
  enabled?: boolean;
};

export const useGetAssignments = ({
  enabled = true,
  ...filters
}: AssignmentFilters = {}) => {
  return useQuery({
    queryKey: ["assignments", filters],
    enabled,
    queryFn: async () => {
      const query = buildQuery(filters);
      const response = await apiGet<
        {
          success: boolean;
          message?: string;
        } & PaginationResponse<AssignmentDTO>
      >(query ? `/api/assignments?${query}` : "/api/assignments");
      if (!response.data?.success) {
        throw new Error(response.data?.message ?? "Gagal memuat daftar tugas");
      }
      return response.data;
    },
  });
};

export const useGetAssignment = (id?: string) => {
  return useQuery({
    queryKey: ["assignments", "detail", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await apiGet<{ success: boolean; data: AssignmentDTO }>(
        `/api/assignments/${id}`,
      );
      return response.data?.data ?? null;
    },
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AssignmentInput) => {
      const response = await apiPost<{ success: boolean; data: AssignmentDTO }>(
        "/api/assignments",
        data,
      );
      return unwrap(response, "Gagal menyimpan tugas").data;
    },
    onSuccess: () => invalidateAssignmentQueries(queryClient),
    onError: (error) => errorHandlerFrontend(error),
  });
};

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: AssignmentUpdateInput;
    }) => {
      const response = await apiPatch<{
        success: boolean;
        data: AssignmentDTO;
      }>(`/api/assignments/${id}`, data);
      return unwrap(response, "Gagal memperbarui tugas").data;
    },
    onSuccess: () => invalidateAssignmentQueries(queryClient),
    onError: (error) => errorHandlerFrontend(error),
  });
};

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiDelete(`/api/assignments/${id}`);
      return unwrap(response, "Gagal menghapus tugas");
    },
    onSuccess: () => invalidateAssignmentQueries(queryClient),
    onError: (error) => errorHandlerFrontend(error),
  });
};

export const useGetSubmissions = (assignmentId?: string) => {
  return useQuery({
    queryKey: ["assignment-submissions", assignmentId],
    enabled: Boolean(assignmentId),
    queryFn: async () => {
      const response = await apiGet<{
        success: boolean;
        message?: string;
        data: AssignmentSubmissionDTO[];
      }>(`/api/assignments/${assignmentId}/submission`);
      if (!response.data?.success) {
        throw new Error(
          response.data?.message ?? "Gagal memuat pengumpulan tugas",
        );
      }
      return response.data.data ?? [];
    },
  });
};

export const useCreateSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assignmentId,
      data,
    }: {
      assignmentId: string;
      data: AssignmentSubmissionInput;
    }) => {
      const response = await apiPost<{
        success: boolean;
        data: AssignmentSubmissionDTO;
      }>(`/api/assignments/${assignmentId}/submission`, data);
      return unwrap(response, "Gagal mengirim tugas").data;
    },
    onSuccess: () => invalidateAssignmentQueries(queryClient),
    onError: (error) => errorHandlerFrontend(error),
  });
};

export const useGradeSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assignmentId,
      submissionId,
      data,
    }: {
      assignmentId: string;
      submissionId: string;
      data: AssignmentGradeInput;
    }) => {
      const response = await apiPatch<{
        success: boolean;
        data: { submission: AssignmentSubmissionDTO };
      }>(
        `/api/assignments/${assignmentId}/submission/${submissionId}/grade`,
        data,
      );
      return unwrap(response, "Gagal menyimpan nilai").data;
    },
    onSuccess: () => invalidateAssignmentQueries(queryClient),
    onError: (error) => errorHandlerFrontend(error),
  });
};

export const useGetGradeTypes = ({ enabled = true } = {}) => {
  return useQuery({
    queryKey: ["grade-types"],
    enabled,
    queryFn: async () => {
      const fetchTypes = async () => {
        const response = await apiGet<{
          success: boolean;
          message?: string;
          data: GradeTypeDTO[];
        }>("/api/grade-types");
        if (!response.data?.success) {
          throw new Error(
            response.data?.message ?? "Gagal memuat jenis penilaian",
          );
        }
        return response.data.data ?? [];
      };

      const types = await fetchTypes();
      if (types.length > 0) return types;

      // Daftar kosong → seed default lewat endpoint eksplisit (GET tidak boleh
      // menulis), lalu muat ulang supaya form penilaian tidak pernah mati.
      await apiPost("/api/grade-types/bootstrap");
      return fetchTypes();
    },
  });
};

export const useCreateGradeType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: GradeTypeInput) => {
      const response = await apiPost<{ success: boolean; data: GradeTypeDTO }>(
        "/api/grade-types",
        data,
      );
      return unwrap(response, "Gagal menyimpan jenis penilaian").data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grade-types"] });
    },
    onError: (error) => errorHandlerFrontend(error),
  });
};
