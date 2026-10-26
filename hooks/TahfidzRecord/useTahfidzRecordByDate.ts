import { defaultDateRange, formatLocalDate } from "@/lib/dateRange";
import { apiGet } from "@/lib/http/apiClient";
import type { TahfidzPaginatedResponse } from "@/types/tahfidzrecord-types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const EMPTY_RESPONSE: TahfidzPaginatedResponse = {
  data: [],
  pagination: { page: 1, limit: 10, total: 0, pages: 0, hasMore: false },
  summary: {
    total: 0,
    students: 0,
    groups: 0,
    teachers: 0,
    surahs: 0,
    averageGrade: 0,
  },
  daily: [],
  byGrade: [],
  byGroup: [],
  filterOptions: { groups: [], teachers: [], surahs: [] },
};

export const useTahfidzRecordsByDate = ({
  fromdate,
  todate,
  branchId,
  groupId,
  teacherId,
  surahId,
  grade,
  search,
  page = 1,
  limit = 10,
}: {
  fromdate?: Date;
  todate?: Date;
  branchId?: string;
  groupId?: string;
  teacherId?: string;
  surahId?: string;
  grade?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const fallback = defaultDateRange();
  const range = {
    fromdate: fromdate ? formatLocalDate(fromdate) : fallback.fromdate,
    todate: todate ? formatLocalDate(todate) : fallback.todate,
  };

  return useQuery({
    queryKey: [
      "tahfidz-records-by-date",
      range.fromdate,
      range.todate,
      branchId,
      groupId,
      teacherId,
      surahId,
      grade,
      search,
      page,
      limit,
    ],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        fromdate: range.fromdate,
        todate: range.todate,
        page,
        limit,
      };
      if (branchId) params.branchId = branchId;
      if (groupId) params.groupId = groupId;
      if (teacherId) params.teacherId = teacherId;
      if (surahId) params.surahId = surahId;
      if (grade) params.grade = grade;
      if (search) params.search = search;

      const response = await apiGet<TahfidzPaginatedResponse>(
        "/api/tahfidzrecord/filterdate",
        { params },
      );
      return response.data ?? EMPTY_RESPONSE;
    },
    placeholderData: keepPreviousData,
  });
};
