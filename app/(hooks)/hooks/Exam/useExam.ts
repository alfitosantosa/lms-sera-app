"use client";

import {
  type ExamDetailDTO,
  type ExamInputPayload,
  type ExamListItemDTO,
  type ExamResultsDTO,
  type ExamUpdatePayload,
  type QuestionInputPayload,
  type SaveAnswerPayload,
  type StudentExamResultDTO,
  type StudentExamSessionDTO,
} from "@/app/(types)/types/exam-types";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type ExamFilters = {
  status?: string;
  classId?: string;
  subjectId?: string;
};

/** Guru/Admin: daftar ujian milik yayasan. */
export const useGetExams = (filters?: ExamFilters) => {
  return useQuery<ExamListItemDTO[]>({
    queryKey: ["exams", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.classId) params.append("classId", filters.classId);
      if (filters?.subjectId) params.append("subjectId", filters.subjectId);
      const url = params.toString() ? `/api/exam?${params}` : "/api/exam";
      const res = await apiGet<ExamListItemDTO[]>(url);
      return res.data ?? [];
    },
  });
};

/** Siswa: daftar ujian yang tersedia + attempt miliknya. */
export const useGetStudentExams = () => {
  return useQuery<ExamListItemDTO[]>({
    queryKey: ["exams", "student"],
    queryFn: async () => {
      const res = await apiGet<ExamListItemDTO[]>("/api/exam?scope=student");
      return res.data ?? [];
    },
  });
};

export const useGetExamById = (id: string) => {
  return useQuery<ExamDetailDTO | null>({
    queryKey: ["exam", id],
    queryFn: async () => {
      const res = await apiGet<ExamDetailDTO>(`/api/exam/${id}`);
      return res.data ?? null;
    },
    enabled: !!id,
  });
};

export const useCreateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ExamInputPayload) => {
      const res = await apiPost<ExamDetailDTO>("/api/exam", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });
};

export const useUpdateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: ExamUpdatePayload & { id: string }) => {
      const res = await apiPut<ExamDetailDTO>(`/api/exam/${id}`, payload);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["exam", variables.id] });
    },
  });
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiDelete(`/api/exam/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });
};

/** Ubah status ujian: "publish" -> PUBLISHED, "close" -> CLOSED. */
export const useChangeExamStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: "publish" | "close";
    }) => {
      const res = await apiPost<ExamDetailDTO>(`/api/exam/${id}/${action}`);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["exam", variables.id] });
    },
  });
};

export const useAddQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      examId,
      ...payload
    }: QuestionInputPayload & { examId: string }) => {
      const res = await apiPost(`/api/exam/${examId}/question`, payload);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["exam", variables.examId] });
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      examId,
      questionId,
      ...payload
    }: QuestionInputPayload & { examId: string; questionId: string }) => {
      const res = await apiPut(
        `/api/exam/${examId}/question/${questionId}`,
        payload,
      );
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["exam", variables.examId] });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      examId,
      questionId,
    }: {
      examId: string;
      questionId: string;
    }) => {
      const res = await apiDelete(`/api/exam/${examId}/question/${questionId}`);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["exam", variables.examId] });
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });
};

/** Guru/Admin: hasil seluruh siswa untuk satu ujian. */
export const useGetExamResults = (examId: string) => {
  return useQuery<ExamResultsDTO | null>({
    queryKey: ["exam", examId, "results"],
    queryFn: async () => {
      const res = await apiGet<ExamResultsDTO>(`/api/exam/${examId}/attempts`);
      return res.data ?? null;
    },
    enabled: !!examId,
  });
};

// ---------------------------------------------------------------
// Siswa
// ---------------------------------------------------------------

/** Mulai (atau lanjutkan) attempt; mengembalikan attempt id. */
export const useStartExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (examId: string) => {
      const res = await apiPost<{ id: string }>(`/api/exam/${examId}/start`);
      return res.data;
    },
    onSuccess: (_data, examId) => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["exam", examId, "session"] });
    },
  });
};

/** Soal ujian untuk dikerjakan (tanpa kunci jawaban) + jawaban tersimpan. */
export const useGetExamSession = (examId: string, enabled = true) => {
  return useQuery<StudentExamSessionDTO | null>({
    queryKey: ["exam", examId, "session"],
    queryFn: async () => {
      const res = await apiGet<StudentExamSessionDTO>(`/api/exam/${examId}/attempt`);
      return res.data ?? null;
    },
    enabled: !!examId && enabled,
    refetchOnWindowFocus: false,
  });
};

export const useSaveAnswer = () => {
  return useMutation({
    mutationFn: async ({
      examId,
      attemptId,
      questionId,
      selectedOptionId,
      answerText,
    }: SaveAnswerPayload) => {
      const res = await apiPost(
        `/api/exam/${examId}/attempt/${attemptId}/answer`,
        { questionId, selectedOptionId, answerText },
      );
      return res.data;
    },
  });
};

export const useSubmitExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      examId,
      attemptId,
    }: {
      examId: string;
      attemptId: string;
    }) => {
      const res = await apiPost<StudentExamResultDTO>(
        `/api/exam/${examId}/attempt/${attemptId}/submit`,
      );
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({
        queryKey: ["exam", variables.examId, "session"],
      });
      queryClient.invalidateQueries({
        queryKey: ["exam", variables.examId, "result"],
      });
    },
  });
};

export const useGetExamResult = (examId: string, attemptId: string) => {
  return useQuery<StudentExamResultDTO | null>({
    queryKey: ["exam", examId, "result", attemptId],
    queryFn: async () => {
      const res = await apiGet<StudentExamResultDTO>(
        `/api/exam/${examId}/attempt/${attemptId}/result`,
      );
      return res.data ?? null;
    },
    enabled: !!examId && !!attemptId,
  });
};
