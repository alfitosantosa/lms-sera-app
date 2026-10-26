/**
 * Registry modul opsional per yayasan — satu sumber kebenaran untuk menu,
 * route guard, dan gate API. Core SIAKAD tidak dipetakan (selalu aktif).
 */

export type ModuleKey =
  | "keuangan"
  | "absensi"
  | "pelanggaran"
  | "pembelajaran"
  | "tahfidz";

export const ALL_MODULES: ModuleKey[] = [
  "keuangan",
  "absensi",
  "pelanggaran",
  "pembelajaran",
  "tahfidz",
];

type ModuleDefinition = {
  label: string;
  description: string;
  pagePrefixes: string[];
  apiPrefixes: string[];
};

export const MODULES: Record<ModuleKey, ModuleDefinition> = {
  keuangan: {
    label: "Keuangan",
    description: "Tagihan, pembayaran, bank, dan kuitansi SPP.",
    pagePrefixes: [
      "/dashboard/admin/finance",
      "/dashboard/treasurer",
      "/dashboard/student/payment",
    ],
    apiPrefixes: [
      "/api/payment",
      "/api/paymenttype",
      "/api/accountbank",
      "/api/midtrans",
    ],
  },
  absensi: {
    label: "Absensi",
    description: "Presensi siswa per jadwal dan presensi guru.",
    pagePrefixes: [
      "/dashboard/admin/attendance",
      "/dashboard/admin/recapattendance",
      "/dashboard/teacher/attendance",
      "/dashboard/student/attendance",
    ],
    apiPrefixes: [
      "/api/attendance",
      "/api/teacherattendance",
      "/api/students/by-ids/attendance",
    ],
  },
  pelanggaran: {
    label: "Pelanggaran",
    description: "Poin dan tindak lanjut pelanggaran siswa.",
    pagePrefixes: [
      "/dashboard/admin/discipline",
      "/dashboard/teacher/violations",
      "/dashboard/student/violations",
    ],
    apiPrefixes: [
      "/api/violations",
      "/api/typeviolations",
      "/api/students/by-ids/violations",
    ],
  },
  pembelajaran: {
    label: "Pembelajaran",
    description: "Tugas, ujian, jurnal, dan rapor perkembangan.",
    pagePrefixes: [
      "/dashboard/admin/academic/development",
      "/dashboard/teacher/development",
      "/dashboard/teacher/exam",
      "/dashboard/student/development",
      "/dashboard/student/exam",
      "/dashboard/parent/development",
      "/dashboard/reports",
    ],
    apiPrefixes: [
      "/api/assignments",
      "/api/exam",
      "/api/development",
      "/api/assessments",
      "/api/daily-logs",
      "/api/grade-types",
      "/api/reports",
    ],
  },
  tahfidz: {
    label: "Tahfidz",
    description: "Setoran hafalan, surah, dan rekap per kelas.",
    pagePrefixes: [
      "/dashboard/admin/master/classes/tahfidz",
      "/dashboard/admin/academic/tahfidzrecord",
      "/dashboard/teacher/attendance/tahfidz",
      "/dashboard/teacher/tahfidzrecord",
      "/dashboard/student/tahfidzrecord",
    ],
    apiPrefixes: [
      "/api/tahfidzgroup",
      "/api/tahfidzrecord",
      "/api/students/tahfidzgroup",
    ],
  },
};

/** Subset default saat foundation baru dibuat atau kolom belum diisi. */
export const DEFAULT_MODULES: ModuleKey[] = ALL_MODULES;

type RouteEntry = { prefix: string; module: ModuleKey };

function buildEntries(kind: "pagePrefixes" | "apiPrefixes"): RouteEntry[] {
  return Object.entries(MODULES)
    .flatMap(([module, definition]) =>
      definition[kind].map((prefix) => ({ prefix, module: module as ModuleKey })),
    )
    .sort((a, b) => b.prefix.length - a.prefix.length);
}

const PAGE_ENTRIES = buildEntries("pagePrefixes");
const API_ENTRIES = buildEntries("apiPrefixes");

function matchPrefix(pathname: string, entries: RouteEntry[]): ModuleKey | null {
  for (const entry of entries) {
    if (pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`)) {
      return entry.module;
    }
  }
  return null;
}

/** Modul pemilik sebuah path dashboard, atau null untuk core. */
export function moduleForPath(pathname: string): ModuleKey | null {
  return matchPrefix(pathname, PAGE_ENTRIES);
}

/** Modul pemilik sebuah path API, atau null untuk core. */
export function moduleForApiPath(pathname: string): ModuleKey | null {
  return matchPrefix(pathname, API_ENTRIES);
}

export function moduleLabel(module: ModuleKey): string {
  return MODULES[module].label;
}

export function isModuleKey(value: unknown): value is ModuleKey {
  return (
    typeof value === "string" && ALL_MODULES.includes(value as ModuleKey)
  );
}

/** `undefined` → default semua; array (termasuk kosong) → hanya key valid. */
export function normalizeModules(stored?: string[] | null): ModuleKey[] {
  if (!stored) return [...DEFAULT_MODULES];
  return stored.filter(isModuleKey);
}

/**
 * `undefined`/`null` → default semua modul (kompatibel dengan klien lama).
 * Array berisi key valid → subset (array kosong berarti core saja).
 * Bentuk lain atau key tak dikenal → `null` (pemanggil membalas 400).
 */
export function parseModules(value: unknown): ModuleKey[] | null {
  if (value === undefined || value === null) return [...DEFAULT_MODULES];
  if (!Array.isArray(value)) return null;

  const keys = new Set<ModuleKey>();
  for (const item of value) {
    if (!isModuleKey(item)) return null;
    keys.add(item);
  }
  return [...keys];
}
