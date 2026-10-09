import { type attendanceTypes } from "@/app/(types)/types/attendance-types";
import { apiGet } from "@/lib/api/apiClients";
import { useQuery } from "@tanstack/react-query";

export const useAttendanceByDate = ({
  fromdate,
  todate,
  branchId,
}: {
  fromdate?: Date;
  todate?: Date;
  branchId?: string;
}) => {
  return useQuery({
    queryKey: ["attendances-by-date", fromdate, todate, branchId],
    queryFn: async () => {
      if (!fromdate || !todate) return [];

      // Format tanggal ke YYYY-MM-DD menggunakan timezone lokal
      const formatLocalDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const params: Record<string, string> = {
        fromdate: formatLocalDate(fromdate),
        todate: formatLocalDate(todate),
      };

      // Add branchId if provided
      if (branchId) {
        params.branchId = branchId;
      }

      const response = await apiGet<attendanceTypes[]>(
        "/api/attendance/filterdate",
        { params },
      );
      return response.data;
    },
    enabled: !!fromdate && !!todate, // Hanya fetch jika ada tanggal
  });
};
