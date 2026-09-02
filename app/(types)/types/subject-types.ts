// Subject Types
export interface SubjectTypes {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  majorId?: string | null;
  credits: number;
  isActive: boolean;
  // Relations
  major?: MajorSubjectTypes | null;
  schedules?: ScheduleSubjectTypes[];
}

interface MajorSubjectTypes {
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
  majorId?: string;
  credits?: number;
  isActive?: boolean;
}
