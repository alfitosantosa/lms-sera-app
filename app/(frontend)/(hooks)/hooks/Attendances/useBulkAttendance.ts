import { apiPost, apiPut } from "@/lib/apiClients";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateAttendanceBulk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiPost("/api/attendance/bulk", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
};

export const useUpdateAttendanceBulk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiPut(`/api/attendance/bulk`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
};

// export const useDeleteAttendanceBulk = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (data: any) => {
//       const response = await apiDelete(`/api/attendance/bulk`, data);
//       return response.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["attendance"] });
//     },
//   });
// };

// [
//   model Attendance {
//     id         String   @id @default(cuid())
//     studentId  String
//     scheduleId String
//     status     String
//     notes      String?
//     createdAt  DateTime @default(now())
//     date       DateTime
//     schedule   Schedule @relation(fields: [scheduleId], references: [id])
//     student    User     @relation("StudentAttendance", fields: [studentId], references: [id])
//     @@unique([studentId, scheduleId, date])
//     @@map("attendances")
//   }
// ];
