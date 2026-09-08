/**
 * Teacher Attendance Types
 * Defines all TypeScript interfaces and types for the teacher attendance system
 */

export type AttendanceStatus =
  | "hadir"
  | "sakit"
  | "izin"
  | "alfa"
  | "terlambat";

export interface Teacher {
  id: string;
  name: string;
  email: string;
  employeeId?: string;
  avatarUrl?: string;
  position?: string;
  isActive: boolean;
}

export interface TeacherAttendanceRecord {
  id: string;
  teacherId: string;
  date: string; // ISO date format (YYYY-MM-DD)
  status: AttendanceStatus;
  checkinTime?: Date | string;
  checkoutTime?: Date | string;
  notes?: string;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  teacher?: Teacher;
  createdByUser?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateTeacherAttendanceInput {
  teacherId: string;
  date: string | Date;
  status: AttendanceStatus;
  notes?: string;
  createdBy: string;
  checkinTime?: Date | string;
}

export interface UpdateTeacherAttendanceInput {
  id: string;
  status?: AttendanceStatus;
  notes?: string;
  checkoutTime?: Date | string;
}

export interface BulkTeacherAttendanceInput {
  teacherIds: string[];
  date: string | Date;
  status: AttendanceStatus;
  notes?: string;
  createdBy: string;
  checkinTime?: Date | string;
}

export interface TeacherAttendanceResponse {
  id: string;
  teacherId: string;
  date: string;
  status: AttendanceStatus;
  checkinTime: string | null;
  checkoutTime: string | null;
  notes: string | null;
  teacher: Teacher;
  createdByUser: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStats {
  hadir: number;
  sakit: number;
  izin: number;
  alfa: number;
  terlambat: number;
}

export interface TeacherAttendanceStatistics {
  totalDays: number;
  presentDays: number;
  sickDays: number;
  leaveDays: number;
  absentDays: number;
  lateDays: number;
  presentPercentage: string | number;
}

export interface TeacherAttendanceReport {
  id: string;
  name: string;
  email: string;
  employeeId?: string;
  avatarUrl?: string;
  position?: string;
  attendances: TeacherAttendanceRecord[];
  statistics: TeacherAttendanceStatistics;
}

export interface AttendanceListQuery {
  date?: string;
  teacherId?: string;
}

export interface AttendanceReportQuery {
  startDate?: string;
  endDate?: string;
}

export interface AttendanceApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

export interface AttendanceErrorResponse {
  error: string;
  status: number;
}

export interface StatusConfig {
  label: string;
  bg: string;
  text: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface StatusConfigMap {
  hadir: StatusConfig;
  sakit: StatusConfig;
  izin: StatusConfig;
  alfa: StatusConfig;
  terlambat: StatusConfig;
}

// React Query Types
export interface UseTeacherAttendanceOptions {
  date?: string;
  teacherId?: string;
}

export interface UseTeacherAttendanceReportsOptions {
  startDate?: string;
  endDate?: string;
}

// Component Props Types
export interface CheckinTabProps {
  adminId?: string;
}

export interface ReportsTabProps {
  // Add props if needed in future
}

export interface AttendanceListItemProps {
  record: TeacherAttendanceRecord;
  config: StatusConfig;
}

export interface StatsCardProps {
  label: string;
  count: number;
  config: StatusConfig;
}

export interface ReportTableRowProps {
  teacher: TeacherAttendanceReport;
}

// Dialog/Form Types
export interface CheckinFormState {
  date: string;
  status: AttendanceStatus;
  notes: string;
  selectedTeacher: Teacher | null;
}

export interface ReportFilterState {
  startDate: string;
  endDate: string;
}

// API Request/Response Types
export interface CreateAttendanceRequest {
  teacherId: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  createdBy: string;
  checkinTime?: string;
}

export interface UpdateAttendanceRequest {
  id: string;
  status?: AttendanceStatus;
  notes?: string;
  checkoutTime?: string;
}

export interface GetAttendanceQuery {
  date?: string;
  teacherId?: string;
}

export interface GetReportsQuery {
  startDate?: string;
  endDate?: string;
}

// Pagination Types (for future use)
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Sort Types (for future use)
export type SortDirection = "asc" | "desc";

export interface SortParams {
  field: string;
  direction: SortDirection;
}

// Filter Types (for future use)
export interface AttendanceFilter {
  status?: AttendanceStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
  teacherId?: string;
  createdBy?: string;
}

// Utility Types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export type StatusLabel = Record<AttendanceStatus, string>;
export type StatusColor = Record<AttendanceStatus, string>;

// Export defaults for commonly used types
// export type { AttendanceStatus };
