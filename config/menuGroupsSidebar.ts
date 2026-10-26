import {
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  ClipboardCheck,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Upload,
  Users,
} from "lucide-react";
import { type ElementType } from "react";

// Icon mapping
const iconMap: Record<string, ElementType> = {
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

// Menu structure with grouping. Urutan grup sama untuk semua role:
// Utama → Master Data → Akademik (core SIAKAD) → modul domain → Dashboard → Utilitas.
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

const MENU_PROFILE: MenuItem = {
  title: "Profil",
  url: "/dashboard/profile",
  icon: "users",
};

const MENU_MODULES: MenuItem = {
  title: "Modul Yayasan",
  url: "/dashboard/modules",
  icon: "settings",
};

const groupUtama = (withModules = false): MenuGroup => ({
  title: "Utama",
  items: withModules ? [MENU_PROFILE, MENU_MODULES] : [MENU_PROFILE],
});

const groupMasterData: MenuGroup = {
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
};

/** Core SIAKAD: kelas, mata pelajaran, dan jadwal. Tidak dimiliki modul opsional. */
const groupAkademik: MenuGroup = {
  title: "Akademik",
  items: [
    {
      title: "Kelas",
      url: "/dashboard/admin/master/classes",
      icon: "academic",
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
      title: "Jadwal Khusus",
      url: "/dashboard/admin/academic/specialschedule",
      icon: "calendar",
    },
  ],
};

/** Modul absensi: presensi siswa dan rekapnya, terpisah dari core SIAKAD. */
const groupAbsensiAdmin: MenuGroup = {
  title: "Absensi",
  items: [
    {
      title: "Absensi Siswa",
      url: "/dashboard/admin/attendance",
      icon: "attendance",
      items: [
        {
          title: "Absensi",
          url: "/dashboard/admin/attendance",
        },
        {
          title: "Backup Absensi",
          url: "/dashboard/admin/attendance/backup",
        },
      ],
    },
    {
      title: "Rekap Absensi",
      url: "/dashboard/admin/recapattendance",
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
  ],
};

/** Modul tahfidz: grup hafalan dan setoran, terpisah dari core SIAKAD. */
const groupTahfidzAdmin: MenuGroup = {
  title: "Tahfidz",
  items: [
    {
      title: "Dashboard Tahfizh",
      url: "/dashboard/tahfidz",
      icon: "dashboard",
    },
    {
      title: "Grup Tahfidz",
      url: "/dashboard/admin/master/classes/tahfidz",
      icon: "academic",
    },
    {
      title: "Setoran Tahfidz",
      url: "/dashboard/admin/academic/tahfidzrecord",
      icon: "academic",
    },
  ],
};

/** Menu operasional pembelajaran guru, dipakai juga oleh admin sebagai pemantauan. */
const MENU_PEMBELAJARAN_GURU: MenuItem[] = [
  {
    title: "Dashboard Pengembangan",
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
  {
    title: "Rapor",
    url: "/dashboard/teacher/development/reports",
    icon: "file",
  },
];

const groupPembelajaran = (withConfig = false): MenuGroup => ({
  title: "Pembelajaran",
  items: [
    ...(withConfig
      ? [
          {
            title: "Konfigurasi Pengembangan",
            url: "/dashboard/admin/academic/development",
            icon: "academic" as const,
          },
        ]
      : []),
    {
      title: "Ujian",
      url: "/dashboard/teacher/exam",
      icon: "file",
    },
    ...MENU_PEMBELAJARAN_GURU,
  ],
});

const groupPelanggaran: MenuGroup = {
  title: "Pelanggaran",
  items: [
    {
      title: "Jenis Pelanggaran",
      url: "/dashboard/admin/discipline/typeviolations",
      icon: "violation",
    },
    {
      title: "Data Pelanggaran",
      url: "/dashboard/admin/discipline/violations",
      icon: "violation",
    },
  ],
};

const groupKeuanganAdmin: MenuGroup = {
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
};

const groupDashboard: MenuGroup = {
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
};

export const menuGroups: Record<string, MenuGroup[]> = {
  // =====================================================
  // ADMIN
  // =====================================================
  admin: [
    groupUtama(true),
    groupMasterData,
    groupAkademik,
    groupAbsensiAdmin,
    groupTahfidzAdmin,
    groupPembelajaran(true),
    groupPelanggaran,
    groupKeuanganAdmin,
    groupDashboard,
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
  // SCHOOL ADMINISTRATOR (TU)
  // Reuses existing admin/treasurer pages with branch filtering
  // =====================================================
  schooladministrator: [
    groupUtama(true),
    groupAkademik,
    groupAbsensiAdmin,
    groupTahfidzAdmin,
    groupPembelajaran(true),
    groupPelanggaran,
    {
      title: "Keuangan",
      items: [
        {
          title: "Informasi Siswa",
          url: "/dashboard/treasurer/studentinformation",
          icon: "users",
        },
      ],
    },
    groupDashboard,
    {
      title: "Utilitas",
      items: [
        {
          title: "Upload Siswa",
          url: "/dashboard/admin/utility/upload/users",
          icon: "upload",
        },
        {
          title: "Upload Jadwal",
          url: "/dashboard/admin/utility/upload/schedules",
          icon: "upload",
        },
      ],
    },
  ],
  // =====================================================
  // TREASURER
  // =====================================================
  treasurer: [
    groupUtama(),
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
          title: "Informasi Siswa",
          url: "/dashboard/treasurer/studentinformation",
          icon: "users",
        },
      ],
    },
    {
      title: "Data Pendukung",
      items: [
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
    groupDashboard,
  ],

  // =====================================================
  // TEACHER
  // =====================================================
  teacher: [
    {
      title: "Utama",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: "dashboard" },
        MENU_PROFILE,
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
          title: "Kalender",
          url: "/dashboard/teacher/calender",
          icon: "calendar",
        },
      ],
    },
    {
      title: "Absensi",
      items: [
        {
          title: "Absensi Guru",
          url: "/dashboard/teacher/attendance",
          icon: "attendance",
        },
      ],
    },
    groupPembelajaran(),
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
  ],
  // =====================================================
  // STUDENT
  // =====================================================
  student: [
    groupUtama(),
    {
      title: "Akademik",
      items: [
        {
          title: "Jadwal",
          url: "/dashboard/student/schedule",
          icon: "calendar",
        },
        {
          title: "Kalender",
          url: "/dashboard/student/calender",
          icon: "calendar",
        },
      ],
    },
    {
      title: "Absensi",
      items: [
        {
          title: "Absensi Saya",
          url: "/dashboard/student/attendance",
          icon: "attendance",
        },
      ],
    },
    {
      title: "Tahfidz",
      items: [
        {
          title: "Setoran Tahfidz",
          url: "/dashboard/student/tahfidzrecord",
          icon: "academic",
        },
      ],
    },
    {
      title: "Pembelajaran",
      items: [
        {
          title: "Ujian",
          url: "/dashboard/student/exam",
          icon: "file",
        },
        {
          title: "Tugas Saya",
          url: "/dashboard/student/development/assignments",
          icon: "file",
        },
        {
          title: "Perkembangan Saya",
          url: "/dashboard/student/development",
          icon: "chart",
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
      title: "Keuangan",
      items: [
        {
          title: "Pembayaran",
          url: "/dashboard/student/payment",
          icon: "payment",
        },
      ],
    },
  ],

  // =====================================================
  // PARENT
  // =====================================================
  parent: [
    groupUtama(),
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
    {
      title: "Pembelajaran",
      items: [
        {
          title: "Perkembangan Anak",
          url: "/dashboard/parent/development",
          icon: "chart",
        },
        {
          title: "Rapor Anak",
          url: "/dashboard/parent/development/report",
          icon: "file",
        },
      ],
    },
  ],

  // =====================================================
  // NULL
  // =====================================================
  null: [groupUtama()],
};
