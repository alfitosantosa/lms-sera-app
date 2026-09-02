"use client";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Type definitions
type TahfidzRecordCreate = {
  studentId: string;
  teacherId: string | null;
  surahQuranId: string;
  startVerse: number;
  endVerse: number;
  grade: string | null;
  notes: string | null;
  date: string;
};

type TahfidzRecordUpdate = TahfidzRecordCreate & {
  id: string;
};

type TahfidzRecordDelete = {
  id: string;
  studentId?: string;
};

export const useGetTahfidzRecords = (studentId: string) => {
  return useQuery({
    queryKey: ["tahfidzRecords", studentId],
    queryFn: async () => {
      const response = await apiGet(`/api/tahfidzrecord/${studentId}`);
      return response.data;
    },
  });
};

export const useCreateTahfidzRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TahfidzRecordCreate) => {
      const response = await apiPost("/api/tahfidzrecord", data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tahfidzRecords"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useUpdateTahfidzRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TahfidzRecordUpdate) => {
      const response = await apiPut(`/api/tahfidzrecord/`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tahfidzRecords"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useDeleteTahfidzRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TahfidzRecordDelete) => {
      const response = await apiDelete(`/api/tahfidzrecord`, {
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tahfidzRecords"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useGetTahfidzRecordByStudentId = (studentId: string) => {
  return useQuery({
    queryKey: ["tahfidzRecord", studentId],
    queryFn: async () => {
      const response = await apiGet(`/api/tahfidzrecord/${studentId}`);
      return response.data;
    },
  });
};

export const useGetTahfidzRecordByIdTeacher = (teacherId: string) => {
  return useQuery({
    queryKey: ["tahfidzRecordByTeacher", teacherId],
    queryFn: async () => {
      const response = await apiGet(`/api/tahfidzrecord/teacher/${teacherId}`);
      return response.data;
    },
  });
};
