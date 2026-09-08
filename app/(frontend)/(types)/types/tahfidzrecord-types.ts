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
