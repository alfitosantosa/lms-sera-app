import { AlertTriangle, BarChart3, Building2, Calendar, ClipboardCheck, CreditCard, FileText, GraduationCap, Home, LayoutDashboard, MessageSquare, Settings, Upload, Users } from "lucide-react";

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
        { title: "Dashboard", url: "/dashboard", icon: "dashboard" },
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
          url: "/dashboard/betterauth",
          icon: "settings",
        },
        {
          title: "Roles",
          url: "/dashboard/roles",
          icon: "settings",
        },
        {
          title: "Users",
          url: "/dashboard/users",
          icon: "users",
        },
        {
          title: "Tahun Ajaran",
          url: "/dashboard/academicyear",
          icon: "academic",
        },
        {
          title: "Branch",
          url: "/dashboard/majors",
          icon: "academic",
        },
        {
          title: "Kelas",
          url: "/dashboard/classes",
          icon: "academic",
          items: [
            {
              title: "Tahfidz Group",
              url: "/dashboard/classes/tahfidz",
            },
          ],
        },
        {
          title: "Mata Pelajaran",
          url: "/dashboard/subjects",
          icon: "academic",
        },
      ],
    },

    {
      title: "Akademik",
      items: [
        {
          title: "Jadwal",
          url: "/dashboard/schedules",
          icon: "calendar",
        },
        {
          title: "Jadwal Khusus",
          url: "/dashboard/specialschedule",
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
          title: "Setoran Tahfidz",
          url: "/dashboard/tahfidzrecord",
          icon: "academic",
        },
        {
          title: "Kalender",
          url: "/dashboard/calender",
          icon: "calendar",
          items: [
            {
              title: "Guru",
              url: "/dashboard/calender/teacher",
            },
            {
              title: "Siswa",
              url: "/dashboard/calender/student",
            },
            {
              title: "List Guru",
              url: "/dashboard/calender/list/teacher",
            },
            {
              title: "List Siswa",
              url: "/dashboard/calender/list/student",
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
      ],
    },

    {
      title: "Pelanggaran",
      items: [
        {
          title: "Jenis Pelanggaran",
          url: "/dashboard/typeviolations",
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
          url: "/dashboard/paymenttypes",
          icon: "payment",
        },
        {
          title: "Tagihan",
          url: "/dashboard/billing",
          icon: "file",
        },
        {
          title: "Transaksi",
          url: "/dashboard/payments",
          icon: "payment",
        },
        {
          title: "Account Bank",
          url: "/dashboard/accountbank",
          icon: "bank",
        },
        {
          title: "Informasi Siswa",
          url: "/dashboard/studentinformation",
          icon: "users",
        },
      ],
    },

    {
      title: "Dashboard",
      items: [
        {
          title: "Dashboard Transaksi",
          url: "/dashboard/payments/chart",
          icon: "chart",
        },
        {
          title: "Dashboard Tagihan",
          url: "/dashboard/billing/chart",
          icon: "chart",
        },
        {
          title: "Dashboard Saldo",
          url: "/dashboard/accountbank/chart",
          icon: "chart",
        },
      ],
    },

    {
      title: "Utilitas",
      items: [
        {
          title: "Upload Users",
          url: "/dashboard/upload/users",
          icon: "upload",
        },
        {
          title: "Upload Jadwal",
          url: "/dashboard/upload/schedules",
          icon: "upload",
        },
        {
          title: "Botwa",
          url: "/dashboard/botwa",
          icon: "bot",
        },
      ],
    },
  ],

  // =====================================================
  // BENDAHARA
  // =====================================================
  bendahara: [
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
      title: "Dashboard",
      items: [
        {
          title: "Dashboard Transaksi",
          url: "/dashboard/payments/chart",
          icon: "chart",
        },
        {
          title: "Dashboard Tagihan",
          url: "/dashboard/billing/chart",
          icon: "chart",
        },
        {
          title: "Dashboard Saldo",
          url: "/dashboard/accountbank/chart",
          icon: "chart",
        },
      ],
    },

    {
      title: "Keuangan",
      items: [
        {
          title: "Data Transaksi",
          url: "/dashboard/bendahara/payment",
          icon: "payment",
        },
        {
          title: "Data Tagihan",
          url: "/dashboard/bendahara/billing",
          icon: "file",
        },
        {
          title: "Jenis Tagihan",
          url: "/dashboard/bendahara/paymenttype",
          icon: "payment",
        },
        {
          title: "Data Siswa",
          url: "/dashboard/bendahara/users",
          icon: "users",
        },
        {
          title: "Data Kelas",
          url: "/dashboard/bendahara/class",
          icon: "academic",
        },
        {
          title: "Informasi Siswa",
          url: "/dashboard/bendahara/studentinformation",
          icon: "users",
        },
      ],
    },

    {
      title: "Upload Data",
      items: [
        {
          title: "Upload Tagihan",
          url: "/dashboard/bendahara/billing/upload",
          icon: "upload",
        },
        {
          title: "Upload Siswa",
          url: "/dashboard/bendahara/users/upload",
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
