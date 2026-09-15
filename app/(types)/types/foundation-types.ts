// model Foundation {
// id             String @id @unique @default(cuid())
// name           String
// imageUrl       String
// foundationCode String @unique
// address        String
// phone          String
// academicYear   AcademicYear[]
// announcements  Announcement[]
// calendarEvent  CalendarEvent[]
// dashboardContent DashboardContent[]
// major          Major[]
// role           Role[]
// user           User[]
// userData       UserData[]
// }

export type foundationTypes = {
  id: string;
  name: string;
  imageUrl: string;
  foundationCode: string;
  address: string;
  phone: string;
  userData?: object[];
  major?: object[];
  user?: object[];
  academicYear?: object[];
  announcements?: object[];
  calendarEvent?: object[];
  dashboardContent?: object[];
  role?: object[];
};

// Response type for GET /api/foundation (with counts)
export type FoundationWithCounts = foundationTypes & {
  _count?: {
    user: number;
    major: number;
    userData: number;
  };
};

// Response type for POST /api/foundation (returns created foundation)
export type FoundationCreateResponse = {
  foundation: any;
  id: string;
  name: string;
  imageUrl: string;
  foundationCode: string;
  address: string;
  phone: string;
};

// Response type for PUT /api/foundation (returns updated foundation)
export type FoundationUpdateResponse = FoundationCreateResponse;

// Response type for DELETE /api/foundation (returns deleted foundation)
export type FoundationDeleteResponse = FoundationCreateResponse;

// Response type for POST /api/foundation/assign
export type FoundationAssignResponse = {
  id: any;
  idUser: string;
  idFoundation: string;
  userName: string;
  userEmail: string;
  // Add other fields based on your actual response
};

export type FoundationAssignUserTypes = {
  userId: string;
  foundationCode: string;
};
