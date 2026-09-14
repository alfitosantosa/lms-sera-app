import {
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  ClipboardCheck,
  CreditCard,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Upload,
  Users,
} from "lucide-react";

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  home: Home,
  dashboard: LayoutDashboard,
  users: Users,
  academic: GraduationCap,
  calendar: Calendar,
  attendance: ClipboardCheck,
  violation: AlertTriangle,
  payment: CreditCard,
  upload: Upload,
  bot: MessageSquare,
  chart: BarChart3,
  bank: Building2,
  file: FileText,
  settings: Settings,
};

// Menu structure with grouping
type MenuItem = {
  title: string;
  url: string;
  icon?: keyof typeof iconMap;
  items?: MenuItem[];
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

export const menuGroups: Record<string, MenuGroup[]> = {
  // =====================================================
  // ADMIN
  // =====================================================
  admin: [
    {
      title: "Utama",
      items: [
        { title: "Home", url: "/", icon: "home" },
        {
          title: "Profile",
          url: "/dashboard/profile",
          icon: "users",
        },
      ],
    },

    {
      title: "Master Data",
      items: [
        {
          title: "BetterAuth",
          url: "/dashboard/admin/master/betterauth",
          icon: "settings",
        },
        {
          title: "Roles",
          url: "/dashboard/admin/master/roles",
          icon: "settings",
        },
        {
          title: "Users",
          url: "/dashboard/admin/master/users",
          icon: "users",
        },
        {
          title: "Tahun Ajaran",
          url: "/dashboard/admin/master/academicyear",
          icon: "academic",
        },
        {
          title: "Branch",
          url: "/dashboard/admin/master/majors",
          icon: "academic",
        },
        {
          title: "Kelas",
          url: "/dashboard/admin/master/classes",
          icon: "academic",
          items: [
            {
              title: "Kelas",
              url: "/dashboard/admin/master/classes",
            },
            {
              title: "Grup Tahfidz",
              url: "/dashboard/admin/master/classes/tahfidz",
            },
          ],
        },
      ],
    },

    {
      title: "Akademik",
      items: [
        {
          title: "Mata Pelajaran",
          url: "/dashboard/admin/master/subjects",
          icon: "academic",
        },
        {
          title: "Jadwal",
          url: "/dashboard/admin/academic/schedules",
          icon: "calendar",
        },
        {
          title: "Absensi",
          url: "/dashboard/attendance",
          icon: "attendance",
          items: [
            {
              title: "Backup Absensi Admin",
              url: "/dashboard/admin/attendance",
            },
          ],
        },
        {
          title: "Rekap Absensi",
          url: "/dashboard/recapattendance",
          icon: "attendance",
          items: [
            {
              title: "Per Kelas",
              url: "/dashboard/recapattendance/class",
            },
          ],
        },
        {
          title: "Jadwal Khusus",
          url: "/dashboard/admin/academic/specialschedule",
          icon: "calendar",
        },
        {
          title: "Setoran Tahfidz",
          url: "/dashboard/admin/academic/tahfidzrecord",
          icon: "academic",
        },
      ],
    },

    {
      title: "Pelanggaran",
      items: [
        {
          title: "Jenis Pelanggaran",
          url: "/dashboard/admin/discipline/typeviolations",
          icon: "violation",
        },
        {
          title: "Data Pelanggaran",
          url: "/dashboard/violations",
          icon: "violation",
        },
      ],
    },

    {
      title: "Keuangan",
      items: [
        {
          title: "Jenis Tagihan",
          url: "/dashboard/admin/finance/paymenttypes",
          icon: "payment",
        },
        {
          title: "Tagihan",
          url: "/dashboard/admin/finance/billing",
          icon: "file",
        },
        {
          title: "Transaksi",
          url: "/dashboard/admin/finance/payments",
          icon: "payment",
        },
        {
          title: "Account Bank",
          url: "/dashboard/admin/finance/accountbank",
          icon: "bank",
        },
        {
          title: "Informasi Siswa",
          url: "/dashboard/admin/finance/studentinformation",
          icon: "users",
        },
      ],
    },

    {
      title: "Dashboard",
      items: [
        {
          title: "Dashboard Absensi",
          url: "/dashboard",
          icon: "chart",
        },
        {
          title: "Dashboard Transaksi",
          url: "/dashboard/admin/finance/payments/chart",
          icon: "chart",
        },
        {
          title: "Dashboard Tagihan",
          url: "/dashboard/admin/finance/billing/chart",
          icon: "chart",
        },
        {
          title: "Dashboard Saldo",
          url: "/dashboard/admin/finance/accountbank/chart",
          icon: "chart",
        },
      ],
    },

    {
      title: "Utilitas",
      items: [
        {
          title: "Upload Users",
          url: "/dashboard/admin/utility/upload/users",
          icon: "upload",
        },
        {
          title: "Upload Jadwal",
          url: "/dashboard/admin/utility/upload/schedules",
          icon: "upload",
        },
        {
          title: "Botwa",
          url: "/dashboard/admin/utility/botwa",
          icon: "bot",
        },
      ],
    },
  ],

  // =====================================================
  // TREASURER
  // =====================================================
  treasurer: [
    {
      title: "Utama",
      items: [
        { title: "Home", url: "/", icon: "home" },
        {
          title: "Profile",
          url: "/dashboard/profile",
          icon: "users",
        },
      ],
    },

    {
      title: "Dashboard",
      items: [
        {
          title: "Dashboard Transaksi",
          url: "/dashboard/admin/finance/payments/chart",
          icon: "chart",
        },
        {
          title: "Dashboard Tagihan",
          url: "/dashboard/admin/finance/billing/chart",
          icon: "chart",
        },
        {
          title: "Dashboard Saldo",
          url: "/dashboard/admin/finance/accountbank/chart",
          icon: "chart",
        },
      ],
    },

    {
      title: "Keuangan",
      items: [
        {
          title: "Jenis Tagihan",
          url: "/dashboard/treasurer/paymenttype",
          icon: "payment",
        },
        {
          title: "Data Tagihan",
          url: "/dashboard/treasurer/billing",
          icon: "file",
        },
        {
          title: "Data Transaksi",
          url: "/dashboard/treasurer/payment",
          icon: "payment",
        },
        {
          title: "Data Kelas",
          url: "/dashboard/treasurer/class",
          icon: "academic",
        },
        {
          title: "Data Siswa",
          url: "/dashboard/treasurer/users",
          icon: "users",
        },
        {
          title: "Informasi Siswa",
          url: "/dashboard/treasurer/studentinformation",
          icon: "users",
        },
      ],
    },

    {
      title: "Upload Data",
      items: [
        {
          title: "Upload Tagihan",
          url: "/dashboard/treasurer/billing/upload",
          icon: "upload",
        },
        {
          title: "Upload Siswa",
          url: "/dashboard/treasurer/users/upload",
          icon: "upload",
        },
      ],
    },
  ],

  // =====================================================
  // TEACHER
  // =====================================================
  teacher: [
    {
      title: "Utama",
      items: [
        { title: "Home", url: "/", icon: "home" },
        { title: "Dashboard", url: "/dashboard", icon: "dashboard" },
        {
          title: "Profile",
          url: "/dashboard/profile",
          icon: "users",
        },
      ],
    },

    {
      title: "Akademik",
      items: [
        {
          title: "Jadwal Saya",
          url: "/dashboard/teacher/schedule",
          icon: "calendar",
        },
        {
          title: "Absensi Kepala Sekolah",
          url: "/dashboard/attendance/teacher",
          icon: "attendance",
        },
        {
          title: "Kalender",
          url: "/dashboard/calender/teacher",
          icon: "calendar",
          items: [
            {
              title: "List Kalender",
              url: "/dashboard/calender/list/teacher",
            },
          ],
        },
      ],
    },

    {
      title: "Pelanggaran",
      items: [
        {
          title: "Data Pelanggaran",
          url: "/dashboard/violations/teacher",
          icon: "violation",
        },
      ],
    },
  ],

  // =====================================================
  // STUDENT
  // =====================================================
  student: [
    {
      title: "Utama",
      items: [
        { title: "Home", url: "/", icon: "home" },
        { title: "Dashboard", url: "/dashboard", icon: "dashboard" },
        {
          title: "Profile",
          url: "/dashboard/profile",
          icon: "users",
        },
      ],
    },

    {
      title: "Akademik",
      items: [
        {
          title: "Jadwal",
          url: "/dashboard/student/schedule",
          icon: "calendar",
        },
        {
          title: "Absensi",
          url: "/dashboard/student/attendance",
          icon: "attendance",
        },
        {
          title: "Setoran Tahfidz",
          url: "/dashboard/student/tahfidzrecord",
          icon: "academic",
        },
        {
          title: "Kalender",
          url: "/dashboard/calender/student",
          icon: "calendar",
          items: [
            {
              title: "List Kalender",
              url: "/dashboard/calender/list/student",
            },
          ],
        },
      ],
    },

    {
      title: "Keuangan",
      items: [
        {
          title: "Pembayaran",
          url: "/dashboard/student/payment",
          icon: "payment",
        },
      ],
    },

    {
      title: "Pelanggaran",
      items: [
        {
          title: "Data Pelanggaran",
          url: "/dashboard/violations/student",
          icon: "violation",
        },
      ],
    },
  ],

  // =====================================================
  // PARENT
  // =====================================================
  parent: [
    {
      title: "Utama",
      items: [
        { title: "Home", url: "/", icon: "home" },
        { title: "Dashboard", url: "/dashboard", icon: "dashboard" },
        {
          title: "Profile",
          url: "/dashboard/profile",
          icon: "users",
        },
      ],
    },

    {
      title: "Informasi Anak",
      items: [
        {
          title: "Portal Orang Tua",
          url: "/dashboard/parent",
          icon: "users",
        },
      ],
    },
  ],
};
