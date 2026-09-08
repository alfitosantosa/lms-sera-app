import { apiGet } from "@/lib/apiClients";
import { PaymentItemsTypes } from "@/app/(types)";
import { useQuery } from "@tanstack/react-query";

export const usePaymentsItemsByDate = ({ fromdate, todate, majorId, status, isPaid, skuType }: { fromdate?: Date; todate?: Date; majorId?: string; status?: string; isPaid?: boolean; skuType?: string }) => {
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
    queryKey: ["payments-items-by-date", fromdateStr, todateStr, majorId, status, isPaid, skuType],
    queryFn: async () => {
      // Build params object, only include if exists
      const params: Record<string, string> = {};

      // Jika ada date range, tambahkan ke params
      if (normalizedFromDate && normalizedToDate && fromdateStr && todateStr) {
        params.fromdate = fromdateStr;
        params.todate = todateStr;
      }

      if (majorId) {
        params.majorId = majorId;
      }
      if (status) {
        params.status = status;
      }
      if (skuType) {
        params.skuType = skuType;
      }
      if (isPaid !== undefined) {
        params.isPaid = String(isPaid);
      }

      const response = await apiGet<PaymentItemsTypes[]>("/api/payment/items/filterdate", { params });
      return response.data;
    },
    // Selalu enabled
    enabled: true,
  });
};

export const usePaymentsItemsDashboardByDate = ({ fromdate, todate, majorId, status, isPaid, skuType }: { fromdate?: Date; todate?: Date; majorId?: string; status?: string; isPaid?: boolean; skuType?: string }) => {
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
    queryKey: ["payments-items-by-date", fromdateStr, todateStr, majorId, status, isPaid, skuType],
    queryFn: async () => {
      // Build params object, only include if exists
      const params: Record<string, string> = {};

      // Jika ada date range, tambahkan ke params
      if (normalizedFromDate && normalizedToDate && fromdateStr && todateStr) {
        params.fromdate = fromdateStr;
        params.todate = todateStr;
      }

      if (majorId) {
        params.majorId = majorId;
      }
      if (status) {
        params.status = status;
      }
      if (skuType) {
        params.skuType = skuType;
      }
      if (isPaid !== undefined) {
        params.isPaid = String(isPaid);
      }

      const response = await apiGet("/api/payment/items/chart", { params });
      return response.data;
    },
    // Selalu enabled
    enabled: true,
  });
};
