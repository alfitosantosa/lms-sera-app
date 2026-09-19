import { type attendanceTypes } from "./attendance-types";
import { type foundationTypes } from "./foundation-types";
import { type branchTypes } from "./branchs-types";
import { type PaymentTypes } from "./payment-types";
import { type RoleDataTypes } from "./roles-types";
import { type ViolationTypes } from "./violation-types";

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
  branchId?: string | null;
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
  foundationId?: string | null;
  foundation?: foundationTypes | null;
  user?: UserTypes | null;
  academicYear?: AcademicYearTypes | null;
  class?: ClassTypes | null;
  branch?: BranchTypes | null;
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

type ClassTypes = {
  id: string;
  name: string;
  grade: number;
};

interface BranchTypes {
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
//     branchId: id,
//     status: "active",
//     role: {
//       name: "Student",
//     },
//   },
//   include: {
//     role: true,
//     academicYear: true,
//     class: true,
//     branch: true,
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

export type userDataBranchTypes = {
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
  branchId?: string | null;
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
  branch?: branchTypes | null;
  attendances?: attendanceTypes[] | null;
  payments?: PaymentTypes[] | null;
  violations?: ViolationTypes[] | null;
  _count: {
    attendances: number;
    payments: number;
    violations: number;
  };
};
