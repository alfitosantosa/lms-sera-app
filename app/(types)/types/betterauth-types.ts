// {
//     "id": "KbdBcCqunCPVLM8ALBOuxv2RiiUd6CmA",
//     "name": "109_Almas Imani",
//     "email": "almas.himani@gmail.com",
//     "emailVerified": true,
//     "image": "https://lh3.googleusercontent.com/a/ACg8ocIzBp9VXpgMNVpxlaHgAWuld-XiZn6XNgxOQQ1k-WHuM3zea-G6=s96-c",
//     "createdAt": "2026-06-10T03:46:57.266Z",
//     "updatedAt": "2026-06-10T03:46:57.266Z",
//     "banExpires": null,
//     "banReason": null,
//     "banned": false,
//     "role": "user",
//     "userData": {
//         "id": "cmq7j2jav000501n7yvookcgl",
//         "userId": "KbdBcCqunCPVLM8ALBOuxv2RiiUd6CmA",
//         "academicYearId": null,
//         "address": null,
//         "avatarUrl": null,
//         "birthDate": null,
//         "birthPlace": null,
//         "classId": null,
//         "employeeId": null,
//         "endDate": null,
//         "enrollmentDate": null,
//         "gender": null,
//         "graduationDate": null,
//         "majorId": "cmplf2rcv000701psk9y8gkbv",
//         "nik": null,
//         "nisn": null,
//         "parentPhone": null,
//         "position": null,
//         "relation": null,
//         "roleId": "cmoy74icq0001p4icz4y2670j",
//         "startDate": null,
//         "status": "active",
//         "studentIds": [],
//         "email": "almas.himani@gmail.com",
//         "name": "Almas Imani",
//         "isActive": true,
//         "createdAt": "2026-06-10T03:47:25.111Z",
//         "updatedAt": "2026-06-10T03:47:25.111Z",
//         "tahfidzGroupId": null,
//         "role": {
//             "id": "cmoy74icq0001p4icz4y2670j",
//             "name": "Bendahara",
//             "description": "",
//             "permissions": [
//                 "/dashboard/bendahara/users",
//                 "/dashboard/bendahara/paymenttype",
//                 "/dashboard/bendahara/class",
//                 "/dashboard/bendahara/payment",
//                 "/dashboard/bendahara/billing",
//                 "/dashboard/bendahara/billing/upload",
//                 "/dashboard/bendahara/users/upload",
//                 "/dashboard/bendahara/studentinformation",
//                 "/dashboard/payments/chart",
//                 "/dashboard/billing/chart",
//                 "/dashboard/accountbank/chart"
//             ],
//             "isActive": true
//         }
//     }
// },

export type betterauthUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string;
  createdAt: string;
  updatedAt: string;
  banExpires: string | null;
  banReason: string | null;
  banned: boolean;
  role: string;
  userData: {
    id: string;
    userId: string;
    academicYearId: string | null;
    address: string | null;
    avatarUrl: string | null;
    birthDate: string | null;
    birthPlace: string | null;
    classId: string | null;
    employeeId: string | null;
    endDate: string | null;
    enrollmentDate: string | null;
    gender: string | null;
    graduationDate: string | null;
    majorId: string;
    nik: string | null;
    nisn: string | null;
    parentPhone: string | null;
    position: string | null;
    relation: string | null;
    roleId: string;
    startDate: string | null;
    status: string;
    studentIds: string[];
    email: string;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    tahfidzGroupId: string | null;
    role: {
      id: string;
      name: string;
      description: string;
      permissions: string[];
      isActive: boolean;
    };
  };
};
export type permissionType = {
  permission: string;
  hasPermission: boolean;
};
