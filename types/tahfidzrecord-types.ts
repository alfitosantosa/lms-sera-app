// Tahfidz Record Types
export interface TahfidzRecordTypes {
  id: string;
  startVerse?: number | null;
  endVerse?: number | null;
  grade?: string | null;
  date: Date | string;
  notes?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  studentId?: string | null;
  teacherId?: string | null;
  surahQuranId?: string | null;
  // Relations
  student?: StudentTahfidzTypes | null;
  teacher?: TeacherTahfidzTypes | null;
  surah?: SurahQuranTypes | null;
}

export interface SurahQuranTypes {
  id: string;
  name: string;
  nameLatin: string;
  verseCount: number;
  revelationPlace: string;
}

interface StudentTahfidzTypes {
  id: string;
  name: string;
  nisn?: string | null;
  class?: {
    id: string;
    name: string;
  } | null;
  tahfidzGroup?: {
    id: string;
    name: string;
  } | null;
}

interface TeacherTahfidzTypes {
  id: string;
  name: string;
  employeeId?: string | null;
}

// Input types
export interface TahfidzRecordInput {
  startVerse?: number;
  endVerse?: number;
  grade?: string;
  date: Date | string;
  notes?: string;
  studentId: string;
  teacherId: string;
  surahQuranId: string;
}

export type TahfidzSummary = {
  total: number;
  students: number;
  groups: number;
  teachers: number;
  surahs: number;
  averageGrade: number;
};

export type TahfidzDailyPoint = TahfidzSummary & {
  date: string;
  gradeCounts: Record<string, number>;
};

export type TahfidzByGrade = {
  grade: string;
  total: number;
  percentage: number;
};

export type TahfidzByGroup = {
  groupId: string | null;
  groupName: string;
  total: number;
  students: number;
  averageGrade: number;
};

export type TahfidzFilterOptions = {
  groups: { id: string; name: string }[];
  teachers: { id: string; name: string }[];
  surahs: { id: string; nameLatin: string }[];
};

export type TahfidzPaginatedResponse = {
  data: TahfidzRecordTypes[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
  summary: TahfidzSummary;
  daily: TahfidzDailyPoint[];
  byGrade: TahfidzByGrade[];
  byGroup: TahfidzByGroup[];
  filterOptions: TahfidzFilterOptions;
};
