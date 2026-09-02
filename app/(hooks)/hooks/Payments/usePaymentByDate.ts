import { PaymentData } from "@/app/(types)";
import { apiGet } from "@/lib/apiClients";
import { useQuery } from "@tanstack/react-query";

export const usePaymentsByDate = ({ fromdate, todate, majorId }: { fromdate?: Date; todate?: Date; majorId?: string }) => {
  // Format tanggal ke YYYY-MM-DD menggunakan timezone lokal
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Normalisasi waktu: set fromdate ke awal hari (00:00:00.000) dan todate ke akhir hari (23:59:59.999)
  const normalizedFromDate = fromdate ? new Date(fromdate) : undefined;
  const normalizedToDate = todate ? new Date(todate) : undefined;

  if (normalizedFromDate) {
    normalizedFromDate.setHours(0, 0, 0, 0);
  }
  if (normalizedToDate) {
    normalizedToDate.setHours(23, 59, 59, 999);
  }

  const fromdateStr = normalizedFromDate ? formatLocalDate(normalizedFromDate) : undefined;
  const todateStr = normalizedToDate ? formatLocalDate(normalizedToDate) : undefined;

  return useQuery({
    queryKey: ["payments-by-date", fromdateStr, todateStr, majorId],
    queryFn: async () => {
      // Jika tidak ada date range, return empty array
      if (!normalizedFromDate || !normalizedToDate || !fromdateStr || !todateStr) {
        return [];
      }

      // Build params object, only include majorId if it exists
      const params: Record<string, string> = {
        fromdate: fromdateStr,
        todate: todateStr,
      };

      if (majorId) {
        params.majorId = majorId;
      }

      const response = await apiGet<PaymentData[]>("/api/payment/filterdate", { params });
      return response.data;
    },
    // ✅ FIX: Enable query when dates are available
    enabled: !!fromdateStr && !!todateStr,
    staleTime: 60_000, // 1 minute
    gcTime: 300_000, // 5 minutes
  });
};

export const usePaymentsDashboardByDate = ({ fromdate, todate, majorId }: { fromdate?: Date; todate?: Date; majorId?: string }) => {
  // Format tanggal ke YYYY-MM-DD menggunakan timezone lokal
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Normalisasi waktu: set fromdate ke awal hari (00:00:00.000) dan todate ke akhir hari (23:59:59.999)
  const normalizedFromDate = fromdate ? new Date(fromdate) : undefined;
  const normalizedToDate = todate ? new Date(todate) : undefined;

  if (normalizedFromDate) {
    normalizedFromDate.setHours(0, 0, 0, 0);
  }
  if (normalizedToDate) {
    normalizedToDate.setHours(23, 59, 59, 999);
  }

  const fromdateStr = normalizedFromDate ? formatLocalDate(normalizedFromDate) : undefined;
  const todateStr = normalizedToDate ? formatLocalDate(normalizedToDate) : undefined;

  return useQuery({
    queryKey: ["payments-dashboard-chart", fromdateStr, todateStr, majorId],
    queryFn: async () => {
      // Jika tidak ada date range, return empty dashboard data
      if (!normalizedFromDate || !normalizedToDate || !fromdateStr || !todateStr) {
        return {
          summary: { total: 0, sumTransaction: 0 },
          yearMonthly: [],
          byMajor: [],
          byMajorMonthly: [],
        };
      }

      // Build params object, only include majorId if it exists
      const params: Record<string, string> = {
        fromdate: fromdateStr,
        todate: todateStr,
      };

      if (majorId) {
        params.majorId = majorId;
      }

      const response = await apiGet("/api/payment/chart", { params });
      return response.data;
    },
    // Selalu enabled, tapi return empty dashboard data jika tidak ada date
    enabled: true,
  });
};
