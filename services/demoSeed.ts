import { randomUUID } from "node:crypto";

import { prisma } from "@/services/prisma";

const PREFIX = "TEST_";
const COUNT = 10;
const TAHFIDZ_COUNT = COUNT / 2; // 5 data tahfizh, 5 data reguler
const SCHOOL_COUNT = 3;
const SCHOOL_CODES = Array.from(
  { length: SCHOOL_COUNT },
  (_, i) => `${PREFIX}SEKOLAH_${String(i + 1).padStart(2, "0")}`,
);

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const SUPPORTED_SURAH = [
  { name: "الفاتحة", nameLatin: "Al-Fatihah", verseCount: 7, revelationPlace: "Makkiyah" },
  { name: "البقرة", nameLatin: "Al-Baqarah", verseCount: 286, revelationPlace: "Madaniyah" },
  { name: "آل عمران", nameLatin: "Ali 'Imran", verseCount: 200, revelationPlace: "Madaniyah" },
  { name: "النساء", nameLatin: "An-Nisa", verseCount: 176, revelationPlace: "Madaniyah" },
  { name: "المائدة", nameLatin: "Al-Ma'idah", verseCount: 120, revelationPlace: "Madaniyah" },
  { name: "الأنعام", nameLatin: "Al-An'am", verseCount: 165, revelationPlace: "Makkiyah" },
  { name: "الأعراف", nameLatin: "Al-A'raf", verseCount: 206, revelationPlace: "Makkiyah" },
  { name: "الأنفال", nameLatin: "Al-Anfal", verseCount: 75, revelationPlace: "Madaniyah" },
  { name: "التوبة", nameLatin: "At-Taubah", verseCount: 129, revelationPlace: "Madaniyah" },
  { name: "يونس", nameLatin: "Yunus", verseCount: 109, revelationPlace: "Makkiyah" },
];

const STATUSES = ["present", "present", "late", "absent", "excused", "sick"];
const GRADES = ["A", "B", "A", "B", "C", "A", "B", "A", "C", "A"];
const SKU_TYPES = ["SPP", "Kegiatan", "Seragam", "Catering", "Lainnya"];

const pad = (value: number) => String(value).padStart(2, "0");

/** Tanggal demo pada bulan berjalan, tidak pernah melewati hari ini. */
function demoDate(dayOffset: number, hour = 0): Date {
  const now = new Date();
  const day = Math.min(dayOffset + 1, Math.max(1, now.getUTCDate()));
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), day, hour));
}

export type DemoSeedResult = {
  seeded: boolean;
  counts?: Record<string, number>;
};

/**
 * Isi data demo untuk yayasan baru. Semua nama data memakai awalan `TEST_`
 * supaya mudah dicari dan dihapus. Idempoten: bila cabang demo sudah ada,
 * seed dilewati.
 */
export async function seedDemoFoundation({
  foundationId,
  adminUserDataId,
}: {
  foundationId: string;
  adminUserDataId: string;
}): Promise<DemoSeedResult> {
  const existing = await prisma.branch.findFirst({
    where: { foundationId, code: SCHOOL_CODES[0] },
    select: { id: true },
  });
  if (existing) return { seeded: false };

  const roles = await prisma.role.findMany({
    where: { foundationId },
    select: { id: true, name: true },
  });
  const roleId = (name: string) => {
    const role = roles.find((item) => item.name === name);
    if (!role) throw new Error(`Role ${name} tidak ditemukan untuk yayasan`);
    return role.id;
  };

  const now = new Date();
  const year = String(now.getFullYear());
  const month = MONTHS[now.getMonth()];
  const academicYearId = randomUUID();
  const branchIds = SCHOOL_CODES.map(() => randomUUID());
  const classIds = Array.from({ length: COUNT }, () => randomUUID());
  const teacherIds = Array.from({ length: COUNT }, () => randomUUID());
  const studentIds = Array.from({ length: COUNT }, () => randomUUID());
  const subjectIds = Array.from({ length: COUNT }, () => randomUUID());
  const scheduleIds = Array.from({ length: COUNT }, () => randomUUID());
  const groupIds = Array.from({ length: TAHFIDZ_COUNT }, () => randomUUID());
  const paymentTypeIds = Array.from({ length: COUNT }, () => randomUUID());
  const paymentIds = Array.from({ length: COUNT }, () => randomUUID());
  const accountBankIds = Array.from({ length: COUNT }, () => randomUUID());
  const treasurerId = randomUUID();

  await prisma.$transaction(async (tx) => {
    await tx.academicYear.create({
      data: {
        id: academicYearId,
        year: `${PREFIX}${year}/${Number(year) + 1}`,
        startDate: demoDate(0),
        endDate: new Date(Date.UTC(Number(year) + 1, 5, 30)),
        foundationId,
      },
    });

    await tx.branch.createMany({
      data: branchIds.map((id, i) => ({
        id,
        code: SCHOOL_CODES[i],
        name: `${PREFIX}Sekolah_${pad(i + 1)}`,
        description: "Data demo",
        address: `Jl. ${PREFIX}Demo No. ${i + 1}`,
        phone: `08120000${pad(i + 1)}`,
        adminName: `${PREFIX}Kepala_${pad(i + 1)}`,
        foundationId,
      })),
    });

    await tx.class.createMany({
      data: classIds.map((id, i) => ({
        id,
        name: `${PREFIX}Kelas_${pad(i + 1)}`,
        grade: 7,
        branchId: branchIds[i % SCHOOL_COUNT],
        academicYearId,
        capacity: 30,
      })),
    });

    await tx.userData.createMany({
      data: [
        ...teacherIds.map((id, i) => ({
          id,
          name: `${PREFIX}Guru_${pad(i + 1)}`,
          email: `test.guru${i + 1}@example.com`,
          employeeId: `${PREFIX}EMP_${pad(i + 1)}`,
          foundationId,
          branchId: branchIds[i % SCHOOL_COUNT],
          roleId: roleId("Teacher"),
        })),
        {
          id: treasurerId,
          name: `${PREFIX}Bendahara`,
          email: "test.bendahara@example.com",
          employeeId: `${PREFIX}EMP_BENDAHARA`,
          foundationId,
          branchId: branchIds[0],
          roleId: roleId("Treasurer"),
        },
      ],
    });

    await tx.tahfidzGroup.createMany({
      data: groupIds.map((id, i) => ({
        id,
        name: `${PREFIX}Halaqah_${pad(i + 1)}`,
        grade: 7,
        branchId: branchIds[i % SCHOOL_COUNT],
        capacity: 30,
      })),
    });

    await tx.userData.createMany({
      data: studentIds.map((id, i) => ({
        id,
        name: `${PREFIX}Murid_${pad(i + 1)}`,
        email: `test.murid${i + 1}@example.com`,
        nisn: `${PREFIX}NISN_${pad(i + 1)}`,
        foundationId,
        branchId: branchIds[i % SCHOOL_COUNT],
        classId: classIds[i],
        academicYearId,
        tahfidzGroupId: i < TAHFIDZ_COUNT ? groupIds[i] : null,
        roleId: roleId("Student"),
        enrollmentDate: demoDate(0),
      })),
    });

    await tx.subject.createMany({
      data: subjectIds.map((id, i) => ({
        id,
        code: `${PREFIX}MPL_${pad(i + 1)}`,
        name: `${PREFIX}Mapel_${pad(i + 1)}`,
        description: "Data demo",
        branchId: branchIds[i % SCHOOL_COUNT],
        credits: 2,
      })),
    });

    await tx.schedule.createMany({
      data: scheduleIds.map((id, i) => ({
        id,
        classId: classIds[i],
        subjectId: subjectIds[i],
        teacherId: teacherIds[i],
        academicYearId,
        // 5 jadwal tahfidz, 5 jadwal reguler.
        tahfidzGroupId: i < TAHFIDZ_COUNT ? groupIds[i] : null,
        dayOfWeek: (i % 5) + 1,
        startTime: `${pad(7 + (i % 3))}:00`,
        endTime: `${pad(8 + (i % 3))}:30`,
        room: `${PREFIX}Ruang_${pad(i + 1)}`,
      })),
    });

    await tx.attendance.createMany({
      data: scheduleIds.map((scheduleId, i) => ({
        studentId: studentIds[i],
        scheduleId,
        status: STATUSES[i % STATUSES.length],
        date: demoDate(i),
        notes: `${PREFIX}Absensi_${pad(i + 1)}`,
      })),
    });

    await tx.teacherAttendance.createMany({
      data: teacherIds.map((teacherId, i) => ({
        teacherId,
        date: demoDate(i),
        status: i % 4 === 0 ? "terlambat" : "hadir",
        checkinTime: demoDate(i, 7),
        checkoutTime: demoDate(i, 14),
        notes: `${PREFIX}AbsensiGuru_${pad(i + 1)}`,
        createdBy: adminUserDataId,
      })),
    });

    await tx.calendarEvent.createMany({
      data: scheduleIds.map((_, i) => ({
        title: `${PREFIX}Agenda_${pad(i + 1)}`,
        description: "Data demo",
        eventDate: demoDate(i),
        eventType: i % 2 === 0 ? "akademik" : "kegiatan",
        academicYearId,
        foundationId,
        isPublished: true,
      })),
    });

    await tx.paymentType.createMany({
      data: paymentTypeIds.map((id, i) => {
        const amount = 150000 + i * 50000;
        return {
          id,
          name: `${PREFIX}Tagihan_${pad(i + 1)}`,
          description: "Data demo",
          amount,
          isMonthly: i % 2 === 0,
          isActive: true,
          isFixedAmount: true,
          isFixedQuantity: false,
          quantity: 1,
          subtotal: amount,
          owner: "Yayasan",
          branchId: branchIds[i % SCHOOL_COUNT],
          skuType: SKU_TYPES[i % SKU_TYPES.length],
        };
      }),
    });

    await tx.accountBank.createMany({
      data: accountBankIds.map((id, i) => ({
        id,
        accountName: `${PREFIX}Rekening_${pad(i + 1)}`,
        accountBank: ["BCA", "BNI", "Mandiri", "BRI"][i % 4],
        accountNumber: `TEST${900000 + i}`,
        branchId: branchIds[i % SCHOOL_COUNT],
      })),
    });

    await tx.payment.createMany({
      data: paymentIds.map((id, i) => ({
        id,
        studentId: studentIds[i],
        amount: 150000 + i * 50000,
        dueDate: demoDate(9),
        status: "paid",
        notes: `${PREFIX}Transaksi_${pad(i + 1)}`,
        paymentDate: demoDate(i),
        receiptNumber: `${PREFIX}KWT_${foundationId.slice(-6)}_${year}_${pad(i + 1)}`,
        accountBankId: accountBankIds[i],
        branchId: branchIds[i % SCHOOL_COUNT],
        month,
        bendaharaId: treasurerId,
        bankRef: `${PREFIX}REF_${pad(i + 1)}`,
        transferDate: demoDate(i),
      })),
    });

    const itemRows = paymentTypeIds.flatMap((paymentTypeId, i) => {
      const amount = 150000 + i * 50000;
      const common = {
        studentId: studentIds[i],
        paymentTypeId,
        quantity: 1,
        amount,
        subtotal: amount,
        month,
        year,
        skuType: SKU_TYPES[i % SKU_TYPES.length],
        createdAt: demoDate(i),
      };
      return [
        {
          ...common,
          name: `${PREFIX}ItemLunas_${pad(i + 1)}`,
          isPaid: true,
          paymentId: paymentIds[i],
        },
        {
          ...common,
          name: `${PREFIX}ItemTunggakan_${pad(i + 1)}`,
          isPaid: false,
        },
      ];
    });
    await tx.paymentItems.createMany({ data: itemRows });

    const surahs: { id: string }[] = [];
    for (const surah of SUPPORTED_SURAH) {
      const found = await tx.surahQuran.findFirst({
        where: { nameLatin: surah.nameLatin },
        select: { id: true },
      });
      surahs.push(
        found ?? (await tx.surahQuran.create({ data: surah, select: { id: true } })),
      );
    }

    await tx.tahfidzRecord.createMany({
      data: scheduleIds.slice(0, TAHFIDZ_COUNT).map((_, i) => ({
        studentId: studentIds[i],
        teacherId: teacherIds[i],
        surahQuranId: surahs[i].id,
        startVerse: 1,
        endVerse: Math.min(5 + i, SUPPORTED_SURAH[i].verseCount),
        grade: GRADES[i],
        date: demoDate(i),
        notes: `${PREFIX}Setoran_${pad(i + 1)}`,
      })),
    });
  });

  return {
    seeded: true,
    counts: {
      branches: SCHOOL_COUNT,
      classes: COUNT,
      teachers: COUNT,
      students: COUNT,
      subjects: COUNT,
      schedules: COUNT,
      attendance: COUNT,
      teacherAttendance: COUNT,
      calendarEvents: COUNT,
      tahfidzGroups: TAHFIDZ_COUNT,
      tahfidzRecords: TAHFIDZ_COUNT,
      paymentTypes: COUNT,
      payments: COUNT,
      paymentItems: COUNT * 2,
      accountBanks: COUNT,
    },
  };
}
