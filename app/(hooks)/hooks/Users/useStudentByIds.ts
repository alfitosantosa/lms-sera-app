// ===== 1. TANSTACK QUERY HOOKS =====
// hooks/useParentDashboard.ts

import { apiGet } from "@/lib/apiClients";
import { useQuery } from "@tanstack/react-query";

// ===== Types inferred from API responses =====
export interface StudentData {
  id: string;
  name: string;
  nisn?: string;
  avatarUrl?: string | null;
  status?: string;
  class?: {
    id: string;
    name: string;
  } | null;
  major?: {
    id: string;
    name: string;
  } | null;
}

export interface AttendanceData {
  id: string;
  studentId: string;
  scheduleId: string;
  status: string;
  notes?: string | null;
  date: string;
  createdAt: string;
  schedule?: {
    id: string;
    class?: { id: string; name: string } | null;
    subject?: { id: string; name: string; code: string } | null;
    teacher?: { id: string; name: string } | null;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room?: string | null;
  } | null;
  student?: {
    id: string;
    name: string;
    email?: string | null;
  } | null;
}

export interface ViolationData {
  id: string;
  studentId: string;
  violationTypeId: string;
  classId: string;
  description?: string | null;
  status: string;
  reportedBy: string;
  createdAt: string;
  date: string;
  resolutionDate?: string | null;
  resolutionNotes?: string | null;
  student?: {
    id: string;
    name: string;
    email?: string | null;
  } | null;
  violationType?: {
    id: string;
    name: string;
    points: number;
    category: string;
  } | null;
  class?: {
    id: string;
    name: string;
    grade?: number;
  } | null;
}

export interface PaymentSummary {
  totalPaid: number;
  totalDue: number;
  nextDueDate?: string | null;
}

export interface PaymentData {
  id: string;
  type: string;
  amount: number;
  dueDate?: string | null;
  paymentDate?: string | null;
  status: string;
  receiptNumber?: string | null;
}

// Get students by IDs (for parent's children)
export const useGetStudentsByIds = (studentIds: string[]) => {
  return useQuery({
    queryKey: ["students", studentIds],
    queryFn: async () => {
      if (!studentIds || studentIds.length === 0) {
        return [];
      }

      const response = await apiGet(`/api/students/by-ids`, {
        params: { ids: studentIds.join(",") },
      });
      return response.data as StudentData[];
    },
    enabled: !!studentIds && studentIds.length > 0,
  });
};

// Get attendance data for a student
export const useGetStudentAttendance = (studentId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["attendance", "student", studentId],
    queryFn: async () => {
      const response = await apiGet(`/api/attendance/student/${studentId}`);
      return response.data as AttendanceData[];
    },
    enabled: !!studentId && enabled,
  });
};

// Get violations for a student
export const useGetStudentViolations = (studentId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["violations", "student", studentId],
    queryFn: async () => {
      const response = await apiGet(`/api/violations/student/${studentId}`);
      return response.data as ViolationData[];
    },
    enabled: !!studentId && enabled,
  });
};

// Get payments for a student
// export const useGetStudentPayments = (studentId: string, enabled: boolean = true) => {
//   return useQuery({
//     queryKey: ["payments", "student", studentId],
//     queryFn: async () => {
//       const response = await axios.get(`/api/payments/student/${studentId}`);
//       return response.data as {
//         summary: PaymentSummary;
//         history: PaymentData[];
//       };
//     },
//     enabled: !!studentId && enabled,
//   });
// };
