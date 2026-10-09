import { prisma } from "@/lib/api/prisma";

/**
 * Seed default modul pengembangan siswa (Bahasa Indonesia).
 * Ini SATU-SATUNYA tempat kode skala BB/MB/BSH/BSB boleh ditulis;
 * seluruh kode lain membaca baris `AssessmentScale` dari database.
 */

export type DefaultArea = {
  name: string;
  description: string;
  order: number;
};

export type DefaultIndicator = {
  code: string;
  name: string;
  order: number;
};

export type DefaultScale = {
  code: string;
  label: string;
  description: string;
  value: number;
  color: string;
  order: number;
};

export const DEFAULT_AREAS: DefaultArea[] = [
  {
    name: "Nilai Agama dan Moral",
    description: "Perkembangan nilai agama dan moral anak",
    order: 1,
  },
  {
    name: "Fisik dan Motorik",
    description: "Perkembangan motorik kasar dan halus serta kesehatan",
    order: 2,
  },
  {
    name: "Kognitif",
    description: "Perkembangan kemampuan berpikir dan memecahkan masalah",
    order: 3,
  },
  {
    name: "Bahasa",
    description: "Perkembangan kemampuan berbahasa dan berkomunikasi",
    order: 4,
  },
  {
    name: "Sosial Emosional",
    description: "Perkembangan sosial, emosi, dan kemandirian sosial",
    order: 5,
  },
  {
    name: "Seni dan Kreativitas",
    description: "Perkembangan seni, imajinasi, dan kreativitas",
    order: 6,
  },
  {
    name: "Kemandirian",
    description: "Perkembangan kemandirian dan tanggung jawab anak",
    order: 7,
  },
];

/** Indikator default per nama area (kunci = `DEFAULT_AREAS[].name`). */
export const DEFAULT_INDICATORS: Record<string, DefaultIndicator[]> = {
  "Nilai Agama dan Moral": [
    {
      code: "NAM-1",
      name: "Mengenal dan menyebutkan ciptaan Tuhan",
      order: 1,
    },
    {
      code: "NAM-2",
      name: "Membiasakan berdoa sebelum dan sesudah kegiatan",
      order: 2,
    },
    {
      code: "NAM-3",
      name: "Menunjukkan sikap jujur dan sopan",
      order: 3,
    },
  ],
  "Fisik dan Motorik": [
    {
      code: "FM-1",
      name: "Melakukan gerak motorik kasar (berlari, melompat, keseimbangan)",
      order: 1,
    },
    {
      code: "FM-2",
      name: "Melakukan gerak motorik halus (menggunting, menempel)",
      order: 2,
    },
    {
      code: "FM-3",
      name: "Menjaga kesehatan dan kebersihan diri",
      order: 3,
    },
  ],
  Kognitif: [
    {
      code: "KOG-1",
      name: "Mengenal warna, bentuk, dan ukuran",
      order: 1,
    },
    {
      code: "KOG-2",
      name: "Mengurutkan dan mengelompokkan benda",
      order: 2,
    },
    {
      code: "KOG-3",
      name: "Memecahkan masalah sederhana",
      order: 3,
    },
  ],
  Bahasa: [
    {
      code: "BHS-1",
      name: "Menyimak dan memahami cerita",
      order: 1,
    },
    {
      code: "BHS-2",
      name: "Menceritakan pengalaman dengan runtut",
      order: 2,
    },
    {
      code: "BHS-3",
      name: "Mengenal huruf dan menulis namanya",
      order: 3,
    },
  ],
  "Sosial Emosional": [
    {
      code: "SOS-1",
      name: "Bekerja sama dalam kelompok",
      order: 1,
    },
    {
      code: "SOS-2",
      name: "Mengendalikan emosi dan sabar menunggu giliran",
      order: 2,
    },
    {
      code: "SOS-3",
      name: "Menunjukkan empati kepada teman",
      order: 3,
    },
  ],
  "Seni dan Kreativitas": [
    {
      code: "SEN-1",
      name: "Menyanyi dan bergerak mengikuti irama",
      order: 1,
    },
    {
      code: "SEN-2",
      name: "Menggambar dan mewarnai dengan bebas",
      order: 2,
    },
    {
      code: "SEN-3",
      name: "Membuat karya dari bahan di sekitar",
      order: 3,
    },
  ],
  Kemandirian: [
    {
      code: "KMD-1",
      name: "Mengurus diri sendiri (berpakaian, makan, mandi)",
      order: 1,
    },
    {
      code: "KMD-2",
      name: "Merapikan alat setelah digunakan",
      order: 2,
    },
    {
      code: "KMD-3",
      name: "Menyelesaikan tugas sampai selesai",
      order: 3,
    },
  ],
};

export const DEFAULT_SCALES: DefaultScale[] = [
  {
    code: "BB",
    label: "Belum Berkembang",
    description: "Anak belum menunjukkan kemampuan yang diharapkan",
    value: 1,
    color: "#ef4444",
    order: 1,
  },
  {
    code: "MB",
    label: "Mulai Berkembang",
    description: "Anak mulai menunjukkan kemampuan yang diharapkan",
    value: 2,
    color: "#f59e0b",
    order: 2,
  },
  {
    code: "BSH",
    label: "Berkembang Sesuai Harapan",
    description: "Anak berkembang sesuai harapan pada usianya",
    value: 3,
    color: "#3b82f6",
    order: 3,
  },
  {
    code: "BSB",
    label: "Berkembang Sangat Baik",
    description: "Anak berkembang sangat baik melampaui harapan",
    value: 4,
    color: "#22c55e",
    order: 4,
  },
];

export type BootstrapResult = {
  areas: number;
  indicators: number;
  scales: number;
};

/**
 * Isi default area + indikator + skala untuk satu yayasan.
 * Idempotent: aman dipanggil berulang (upsert berdasarkan unique constraint).
 */
export async function bootstrapDevelopment(
  foundationId: string,
): Promise<BootstrapResult> {
  return prisma.$transaction(async (tx) => {
    const areaIdByName = new Map<string, string>();

    for (const area of DEFAULT_AREAS) {
      const row = await tx.developmentArea.upsert({
        where: { foundationId_name: { foundationId, name: area.name } },
        create: {
          foundationId,
          name: area.name,
          description: area.description,
          order: area.order,
        },
        update: { description: area.description, order: area.order },
        select: { id: true },
      });
      areaIdByName.set(area.name, row.id);
    }

    let indicators = 0;
    for (const [areaName, list] of Object.entries(DEFAULT_INDICATORS)) {
      const developmentAreaId = areaIdByName.get(areaName);
      if (!developmentAreaId) continue;
      for (const indicator of list) {
        await tx.developmentIndicator.upsert({
          where: {
            developmentAreaId_name: { developmentAreaId, name: indicator.name },
          },
          create: {
            developmentAreaId,
            code: indicator.code,
            name: indicator.name,
            order: indicator.order,
          },
          update: { code: indicator.code, order: indicator.order },
        });
        indicators += 1;
      }
    }

    let scales = 0;
    for (const scale of DEFAULT_SCALES) {
      await tx.assessmentScale.upsert({
        where: { foundationId_code: { foundationId, code: scale.code } },
        create: {
          foundationId,
          code: scale.code,
          label: scale.label,
          description: scale.description,
          value: scale.value,
          color: scale.color,
          order: scale.order,
        },
        update: {
          label: scale.label,
          description: scale.description,
          value: scale.value,
          color: scale.color,
          order: scale.order,
        },
      });
      scales += 1;
    }

    return { areas: DEFAULT_AREAS.length, indicators, scales };
  });
}

export type DefaultGradeType = {
  code: string;
  name: string;
  description: string;
  weight: number;
  order: number;
};

/**
 * Jenis penilaian default. `GradeType` tidak punya `foundationId` (global,
 * dipakai bersama `GradeConfiguration`), jadi seed ini berlaku global.
 */
export const DEFAULT_GRADE_TYPES: DefaultGradeType[] = [
  {
    code: "TUGAS",
    name: "Tugas",
    description: "Nilai tugas harian",
    weight: 0,
    order: 1,
  },
];

/**
 * Pastikan jenis penilaian default ada (idempotent, upsert per `code`) supaya
 * form penilaian tugas tidak pernah kosong. Seperti `bootstrapDevelopment`,
 * aman dipanggil berulang.
 */
export async function bootstrapGradeTypes(): Promise<number> {
  return prisma.$transaction(async (tx) => {
    for (const type of DEFAULT_GRADE_TYPES) {
      await tx.gradeType.upsert({
        where: { code: type.code },
        create: {
          code: type.code,
          name: type.name,
          description: type.description,
          weight: type.weight,
          order: type.order,
        },
        update: { name: type.name, description: type.description },
      });
    }
    return DEFAULT_GRADE_TYPES.length;
  });
}
