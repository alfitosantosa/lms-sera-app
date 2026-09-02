// model TahfidzGroup {
//   id                  String               @id @default(cuid())
//   name                String
//   grade               Int
//   capacity            Int                  @default(40)
//   isActive            Boolean              @default(true)
//   schedules           Schedule[]           @relation("TahfidzGroupSchedule")
//   students            UserData[]           @relation("UserTahfidzGroup")

//   @@unique([name])
//   @@index([grade])
//   @@map("tahfidz_groups")
// }
import { ScheduleTypes } from "./schedule-types";
import { UserDataTypes } from "./userData";

export interface tahfidzGroupTypes {
  id: string;
  name: string;
  grade: number;
  capacity: number;
  isActive: boolean;
  schedules: ScheduleTypes[];
  students: UserDataTypes[];
}

// Type for API response with _count
export interface TahfidzGroupData {
  id: string;
  name: string;
  grade: number;
  capacity: number;
  isActive: boolean;
  _count?: {
    students: number;
  };
}

// Input type for create operation
export interface CreateTahfidzGroupInput {
  name: string;
  grade: number;
  capacity: number;
}

// Input type for update operation
export interface UpdateTahfidzGroupInput {
  id: string;
  name: string;
  grade: number;
  capacity: number;
}

// Type for grade values (typically 10, 11, or 12 for high school)
export type TahfidzGrade = number;

// Type for unique grades array (used in filters)
export type TahfidzGradesArray = number[];
