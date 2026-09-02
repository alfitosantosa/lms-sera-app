// hooks/AccountBank/useAccountBankDashboard.ts
"use client";

import { apiGet } from "@/lib/apiClients";
import { useQuery } from "@tanstack/react-query";

type AccountBankDashboardParams = {
  fromdate?: Date;
  todate?: Date;
  majorId?: string;
  accountBankId?: string;
};

const formatLocalDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const useAccountBankDashboard = ({ fromdate, todate, majorId, accountBankId }: AccountBankDashboardParams) => {
  // Normalize ke awal/akhir hari
  const normalizedFrom = fromdate ? new Date(fromdate) : undefined;
  const normalizedTo = todate ? new Date(todate) : undefined;
  if (normalizedFrom) normalizedFrom.setHours(0, 0, 0, 0);
  if (normalizedTo) normalizedTo.setHours(23, 59, 59, 999);

  const fromdateStr = normalizedFrom ? formatLocalDate(normalizedFrom) : undefined;
  const todateStr = normalizedTo ? formatLocalDate(normalizedTo) : undefined;

  return useQuery({
    queryKey: ["accountbank-dashboard", fromdateStr, todateStr, majorId, accountBankId],
    queryFn: async () => {
      if (!fromdateStr || !todateStr) return null;

      const params: Record<string, string> = {
        fromdate: fromdateStr,
        todate: todateStr,
      };

      if (majorId) params.majorId = majorId;
      if (accountBankId) params.accountBankId = accountBankId;

      const response = await apiGet("/api/accountbank/chart", { params });
      return response.data;
    },
    enabled: !!fromdateStr && !!todateStr,
    staleTime: 60_000, // data dianggap fresh selama 60 detik
    gcTime: 300_000, // cache disimpan 5 menit setelah tidak dipakai
  });
};
