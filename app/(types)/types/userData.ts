import { attendanceTypes } from "./attendance-types";
import { majorTypes } from "./majors-types";
import { PaymentTypes } from "./payment-types";
import { RoleDataTypes } from "./roles-types";
import { ViolationTypes } from "./violation-types";

// User Data Types
export type UserDataTypes = {
  id: string;
  userId?: string | null;
  academicYearId?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  birthDate?: Date | string | null;
  birthPlace?: string | null;
  classId?: string | null;
  employeeId?: string | null;
  endDate?: Date | string | null;
  enrollmentDate?: Date | string | null;
  gender?: string | null;
  graduationDate?: Date | string | null;
  majorId?: string | null;
  nik?: string | null;
  nisn?: string | null;
  parentPhone?: string | null;
  position?: string | null;
  relation?: string | null;
  roleId?: string | null;
  startDate?: Date | string | null;
  status?: string;
  studentIds?: string[];
  email?: string | null;
  name: string;
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  tahfidzGroupId?: string | null;
  user?: UserTypes | null;
  academicYear?: AcademicYearTypes | null;
  class?: ClassTypes | null;
  major?: MajorTypes | null;
  role?: RoleDataTypes | null;
  tahfidzGroup?: TahfidzGroupTypes | null;
};

export interface UserTypes {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  banExpires?: Date | string | null;
  banReason?: string | null;
  banned?: boolean | null;
  role?: string | null;
  userData?: UserDataTypes | null;
}

// Relations imports (to avoid circular dependencies, these are minimal)
interface AcademicYearTypes {
  id: string;
  year: string;
  startDate: Date | string;
  endDate: Date | string;
  isActive: boolean;
}

interface ClassTypes {
  id: string;
  name: string;
  grade: number;
}

interface MajorTypes {
  id: string;
  code: string;
  name: string;
}

interface TahfidzGroupTypes {
  id: string;
  name: string;
  grade: number;
}

//   where: {
//     majorId: id,
//     status: "active",
//     role: {
//       name: "Student",
//     },
//   },
//   include: {
//     role: true,
//     academicYear: true,
//     class: true,
//     major: true,
//     attendances: true,
//     payments: true,
//     violations: true,
//     _count: {
//       select: {
//         attendances: true,
//         payments: true,
//         violations: true,
//       },
//     },
//   },
// });

export type userDataMajorTypes = {
  id: string;
  userId?: string | null;
  academicYearId?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  birthDate?: Date | string | null;
  birthPlace?: string | null;
  classId?: string | null;
  employeeId?: string | null;
  endDate?: Date | string | null;
  enrollmentDate?: Date | string | null;
  gender?: string | null;
  graduationDate?: Date | string | null;
  majorId?: string | null;
  nik?: string | null;
  nisn?: string | null;
  parentPhone?: string | null;
  position?: string | null;
  relation?: string | null;
  roleId?: string | null;
  startDate?: Date | string | null;
  status?: string;
  studentIds?: string[];
  email?: string | null;
  name: string;
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  tahfidzGroupId?: string | null;
  role?: RoleDataTypes | null;
  academicYear?: AcademicYearTypes | null;
  class?: ClassTypes | null;
  major?: majorTypes | null;
  attendances?: attendanceTypes[] | null;
  payments?: PaymentTypes[] | null;
  violations?: ViolationTypes[] | null;
  _count: {
    attendances: number;
    payments: number;
    violations: number;
  };
};
