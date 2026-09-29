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
import { ElementType } from "react";

// Icon mapping
const iconMap: Record<string, ElementType> = {
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
        // { title: "Home", url: "/", icon: "home" },
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
          title: "Sekolah",
          url: "/dashboard/admin/master/branchs",
          icon: "academic",
        },
      ],
    },

    {
      title: "Akademik",
      items: [
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
              title: "Absensi",
              url: "/dashboard/admin/attendance",
            },
            {
              title: "Backup Absensi Admin",
              url: "/dashboard/admin/attendance/backup",
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
              url: "/dashboard/admin/recapattendance/class",
            },
            {
              title: "Per Murid",
              url: "/dashboard/admin/recapattendance",
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
      title: "Pengembangan",
      items: [
        {
          title: "Pengembangan Siswa",
          url: "/dashboard/admin/academic/development",
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
    {
      title: "Pengembangan Siswa",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard/teacher/development",
          icon: "academic",
        },
        {
          title: "Buku Catatan Harian",
          url: "/dashboard/teacher/development/logbook",
          icon: "file",
        },
        {
          title: "Kalender Logbook",
          url: "/dashboard/teacher/development/logbook/calendar",
          icon: "calendar",
        },
        {
          title: "Perkembangan Siswa",
          url: "/dashboard/teacher/development/students",
          icon: "chart",
        },
        {
          title: "Penilaian",
          url: "/dashboard/teacher/development/assessments",
          icon: "attendance",
        },
        {
          title: "Tugas & Nilai",
          url: "/dashboard/teacher/development/assignments",
          icon: "file",
        },
      ],
    },
  ],
  // =====================================================
  // SCHOOL ADMINISTRATOR (TU)
  // Reuses existing admin/treasurer pages with branch filtering
  // =====================================================
  schooladministrator: [
    {
      title: "Utama",
      items: [
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
      title: "Akademik",
      items: [
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
        {
          title: "Absensi",
          url: "/dashboard/attendance",
          icon: "attendance",
          items: [
            {
              title: "Absensi",
              url: "/dashboard/attendance",
            },
            {
              title: "Backup Absensi",
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
          title: "Ujian",
          url: "/dashboard/teacher/exam",
          icon: "file",
        },
        {
          title: "Pengembangan Siswa",
          url: "/dashboard/admin/academic/development",
          icon: "academic",
        },
      ],
    },

    {
      title: "Pelanggaran",
      items: [
        {
          title: "Tipe Pelanggaran",
          url: "/dashboard/admin/discipline/typeviolations",
          icon: "violation",
        },
        {
          title: "Data Pelanggaran",
          url: "/dashboard/admin/discipline/violations",
          icon: "violation",
        },
      ],
    },

    {
      title: "Informasi",
      items: [
        {
          title: "Informasi Siswa",
          url: "/dashboard/treasurer/studentinformation",
          icon: "users",
        },
      ],
    },
    {
      title: "Utilitas",
      items: [
        {
          title: "Upload Siswa",
          url: "/dashboard/admin/utility/upload/users",
          icon: "users",
        },
        {
          title: "Upload Schedule",
          url: "/dashboard/admin/utility/upload/schedules",
          icon: "calendar",
        },
      ],
    },
    {
      title: "Pengembangan Siswa",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard/teacher/development",
          icon: "academic",
        },
        {
          title: "Buku Catatan Harian",
          url: "/dashboard/teacher/development/logbook",
          icon: "file",
        },
        {
          title: "Kalender Logbook",
          url: "/dashboard/teacher/development/logbook/calendar",
          icon: "calendar",
        },
        {
          title: "Perkembangan Siswa",
          url: "/dashboard/teacher/development/students",
          icon: "chart",
        },
        {
          title: "Penilaian",
          url: "/dashboard/teacher/development/assessments",
          icon: "attendance",
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
        // { title: "Home", url: "/", icon: "home" },
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
        // { title: "Home", url: "/", icon: "home" },
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
          url: "/dashboard/teacher/attendance",
          icon: "attendance",
        },
        {
          title: "Kalender",
          url: "/dashboard/teacher/calender",
          icon: "calendar",
        },
        {
          title: "Ujian",
          url: "/dashboard/teacher/exam",
          icon: "file",
        },
      ],
    },

    {
      title: "Pelanggaran",
      items: [
        {
          title: "Data Pelanggaran",
          url: "/dashboard/teacher/violations",
          icon: "violation",
        },
      ],
    },
    {
      title: "Pengembangan Siswa",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard/teacher/development",
          icon: "academic",
        },
        {
          title: "Buku Catatan Harian",
          url: "/dashboard/teacher/development/logbook",
          icon: "file",
        },
        {
          title: "Kalender Logbook",
          url: "/dashboard/teacher/development/logbook/calendar",
          icon: "calendar",
        },
        {
          title: "Perkembangan Siswa",
          url: "/dashboard/teacher/development/students",
          icon: "chart",
        },
        {
          title: "Penilaian",
          url: "/dashboard/teacher/development/assessments",
          icon: "attendance",
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
          url: "/dashboard/student/calender",
          icon: "calendar",
        },
        {
          title: "Ujian",
          url: "/dashboard/student/exam",
          icon: "file",
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
          url: "/dashboard/student/violations",
          icon: "violation",
        },
      ],
    },

    {
      title: "Pengembangan Siswa",
      items: [
        {
          title: "Tugas Saya",
          url: "/dashboard/student/development/assignments",
          icon: "file",
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

  // =====================================================
  // NULL
  // =====================================================
  null: [
    {
      title: "Utama",
      items: [
        {
          title: "Profile",
          url: "/dashboard/profile",
          icon: "users",
        },
      ],
    },
  ],
};
