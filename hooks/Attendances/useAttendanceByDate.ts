import { defaultDateRange, formatLocalDate } from "@/lib/dateRange";
import { apiGet } from "@/lib/http/apiClient";
import type { AttendancePaginatedResponse } from "@/types/attendance-types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const EMPTY_RESPONSE: AttendancePaginatedResponse = {
  data: [],
  pagination: { page: 1, limit: 10, total: 0, pages: 0, hasMore: false },
  summary: {
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    sick: 0,
    attendanceRate: 0,
  },
  daily: [],
  byClass: [],
  filterOptions: { classes: [], subjects: [] },
};

export const useAttendanceByDate = ({
  fromdate,
  todate,
  branchId,
  status,
  classId,
  subjectId,
  search,
  page = 1,
  limit = 10,
}: {
  fromdate?: Date;
  todate?: Date;
  branchId?: string;
  status?: string;
  classId?: string;
  subjectId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  // Default: tanggal 1 bulan berjalan s/d hari ini.
  const fallback = defaultDateRange();
  const range = {
    fromdate: fromdate ? formatLocalDate(fromdate) : fallback.fromdate,
    todate: todate ? formatLocalDate(todate) : fallback.todate,
  };

  return useQuery({
    queryKey: [
      "attendances-by-date",
      range.fromdate,
      range.todate,
      branchId,
      status,
      classId,
      subjectId,
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
      if (status) params.status = status;
      if (classId) params.classId = classId;
      if (subjectId) params.subjectId = subjectId;
      if (search) params.search = search;

      const response = await apiGet<AttendancePaginatedResponse>(
        "/api/attendance/filterdate",
        { params },
      );
      return response.data ?? EMPTY_RESPONSE;
    },
    placeholderData: keepPreviousData,
  });
};
