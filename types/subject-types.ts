// Subject Types
export interface SubjectTypes {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  branchId?: string | null;
  credits: number;
  isActive: boolean;
  // Relations
  branch?: BranchSubjectTypes | null;
  schedules?: ScheduleSubjectTypes[];
}

interface BranchSubjectTypes {
  id: string;
  code: string;
  name: string;
}

interface ScheduleSubjectTypes {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string | null;
}

// Input types
export interface SubjectInput {
  code: string;
  name: string;
  description?: string;
  branchId?: string;
  credits?: number;
  isActive?: boolean;
}
