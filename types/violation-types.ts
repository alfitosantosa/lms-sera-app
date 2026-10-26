// Violation Types
export interface ViolationTypes {
  id: string;
  studentId: string;
  violationTypeId: string;
  classId: string;
  description?: string | null;
  status: string;
  reportedBy: string;
  createdAt?: Date | string;
  date: Date | string;
  resolutionDate?: Date | string | null;
  resolutionNotes?: string | null;
  // Relations
  student?: StudentViolationTypes;
  violationType?: ViolationTypeDetailTypes;
  class?: ClassViolationTypes;
}

export type ViolationTypeTypes = {
  id: string;
  name: string;
  description: string;
  points: number;
  category: string;
  academicYearId: string;
  // Relations
  academicYear?: AcademicYearViolationTypes;
  violations?: ViolationTypes[];
};

interface StudentViolationTypes {
  id: string;
  name: string;
  nisn?: string | null;
  email?: string | null;
  class?: {
    id: string;
    name: string;
  } | null;
}

interface ViolationTypeDetailTypes {
  id: string;
  name: string;
  description: string;
  points: number;
  category: string;
}

interface ClassViolationTypes {
  id: string;
  name: string;
  grade: number;
}

interface AcademicYearViolationTypes {
  id: string;
  year: string;
  isActive: boolean;
}

// Input types
export interface ViolationInput {
  studentId: string;
  violationTypeId: string;
  classId: string;
  description?: string;
  status?: string;
  reportedBy: string;
  date: Date | string;
}

export interface ViolationTypeInput {
  name: string;
  description: string;
  points: number;
  category: string;
  academicYearId: string;
}
