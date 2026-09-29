import { sendWhatsAppMessage } from "@/lib/botwa";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { writeAudit } from "./audit";

/**
 * Notifikasi modul pengembangan siswa (Phase 9).
 *
 * Dua kanal: baris `Notification` in-app (kanal andal — selalu ditulis dan
 * ditunggu) dan WhatsApp lewat `lib/botwa` (best-effort, dilepas ke latar).
 * WhatsApp **tidak pernah** menggagalkan pemanggil: kegagalannya dicatat
 * sebagai `AuditLog` (`notification.whatsapp.failed`) lalu ditelan. Fungsi di
 * file ini juga tidak pernah melempar — pemanggilnya (`publishReport`,
 * `submitDailyLog`, `gradeSubmission`) harus tetap sukses walau seluruh kanal
 * notifikasi mati.
 */

const CATEGORY = "development";

/** Halaman tujuan per audiens; `link` in-app selalu relatif. */
const PATH = {
  parent: "/dashboard/parent/development",
  student: "/dashboard/student/development",
} as const;

type Audience = keyof typeof PATH;

type Recipient = { id: string; phone: string | null; audience: Audience };

/** Basis URL opsional untuk teks WhatsApp (link in-app tetap relatif). */
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/+$/, "");

function formatDate(date: Date): string {
  return format(date, "d MMMM yyyy", { locale: localeId });
}

/** Orang tua = baris `user_data` yayasan yang sama yang memuat siswa di `studentIds`. */
async function parentRecipients(
  studentId: string,
  foundationId: string,
): Promise<Recipient[]> {
  const rows = await prisma.userData.findMany({
    where: { foundationId, studentIds: { has: studentId } },
    select: { id: true, parentPhone: true },
  });
  return rows.map((row) => ({
    id: row.id,
    phone: row.parentPhone,
    audience: "parent" as const,
  }));
}

type Delivery = {
  foundationId: string;
  /**
   * `User.id` pemilik peristiwa (bukan `UserData.id` — kontrak `AuditLog`
   * sama seperti ~21 call site `writeAudit` lainnya). `null` = tidak bisa
   * diresolusi; audit kegagalan dilewati daripada salah kunci.
   */
  actorId: string | null;
  entity: string;
  entityId: string;
  title: string;
  template: (link: string) => string;
  recipients: Recipient[];
};

/**
 * WhatsApp best-effort untuk semua penerima ber-nomor. Selalu berjalan di
 * latar (dipanggil dengan `void`), tidak pernah melempar, dan mencatat tiap
 * kegagalan ke `AuditLog` sebelum melanjutkan ke penerima berikutnya.
 */
async function sendWhatsAppMessages(
  input: Delivery,
  messages: { recipient: Recipient; link: string; message: string }[],
): Promise<void> {
  for (const { recipient, link, message } of messages) {
    if (recipient.audience !== "parent" || !recipient.phone?.trim()) continue;

    try {
      const result = await sendWhatsAppMessage(
        recipient.phone,
        APP_URL ? input.template(`${APP_URL}${link}`) : message,
      );
      if (result.success) continue;

      if (!input.actorId) {
        console.error(
          "notify: WhatsApp gagal dan User.id pelaku tidak dapat diresolusi — audit dilewati",
        );
        continue;
      }

      await writeAudit(prisma, {
        foundationId: input.foundationId,
        actorId: input.actorId,
        action: "notification.whatsapp.failed",
        entity: input.entity,
        entityId: input.entityId,
        after: {
          recipientId: recipient.id,
          phone: recipient.phone,
          error: result.error,
        },
      });
    } catch (error) {
      // Termasuk kegagalan menulis audit itu sendiri — notifikasi WA tidak
      // boleh menggagalkan apa pun di luar dirinya.
      console.error("notify: gagal mengirim WhatsApp", error);
    }
  }
}

/**
 * Tulis notifikasi in-app untuk semua penerima (ditunggu — kanal andal), lalu
 * lepas WhatsApp ke latar supaya pemanggil yang transaksinya sudah commit tidak
 * menunggu jaringan.
 */
async function deliver(input: Delivery): Promise<void> {
  const messages = input.recipients.map((recipient) => {
    const link = PATH[recipient.audience];
    return { recipient, link, message: input.template(link) };
  });

  for (const { recipient, link, message } of messages) {
    await prisma.notification.create({
      data: {
        userId: recipient.id,
        title: input.title,
        message,
        type: "development",
        category: CATEGORY,
        link,
        data: { entity: input.entity, entityId: input.entityId },
      },
    });
  }

  void sendWhatsAppMessages(input, messages).catch((error) => {
    console.error("notify: kanal WhatsApp gagal", error);
  });
}

/**
 * Rapor `PUBLISHED` → orang tua. Dipanggil setelah transaksi publish commit.
 */
export async function notifyReportPublished(reportId: string): Promise<void> {
  try {
    const report = await prisma.studentReport.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        foundationId: true,
        studentId: true,
        publishedAt: true,
        createdById: true,
        approvedBy: { select: { userId: true } },
        student: { select: { name: true } },
        period: { select: { name: true } },
      },
    });
    if (!report) return;

    const recipients = await parentRecipients(
      report.studentId,
      report.foundationId,
    );
    if (recipients.length === 0) return;

    const studentName = report.student.name;
    const date = formatDate(report.publishedAt ?? new Date());
    const period = report.period.name;

    await deliver({
      foundationId: report.foundationId,
      // `createdById` sudah `User.id`; `approvedBy.userId` juga (nullable).
      actorId: report.approvedBy?.userId ?? report.createdById,
      entity: "StudentReport",
      entityId: report.id,
      title: `Rapor ${studentName} telah dipublikasikan`,
      template: (link) =>
        `Rapor ${studentName} telah dipublikasikan.\n\nPeriode: ${period}\nTanggal: ${date}\n\nLihat rapor: ${link}`,
      recipients,
    });
  } catch (error) {
    console.error("notifyReportPublished gagal:", error);
  }
}

/**
 * Log harian `parentVisible` → orang tua. Dipanggil setelah `submitDailyLog`
 * commit (log tidak punya status "published"; `parentVisible` adalah titik
 * orang tua boleh melihatnya), dan **tidak** dari `reviewDailyLog` supaya satu
 * log tidak pernah dinotifikasi dua kali.
 */
export async function notifyDailyLogCreated(dailyLogId: string): Promise<void> {
  try {
    const log = await prisma.dailyLog.findUnique({
      where: { id: dailyLogId },
      select: {
        id: true,
        foundationId: true,
        studentId: true,
        date: true,
        activity: true,
        achievement: true,
        parentVisible: true,
        student: { select: { name: true } },
        teacher: { select: { userId: true } },
        observations: {
          select: { scale: { select: { code: true } } },
        },
      },
    });
    if (!log || !log.parentVisible) return;

    const recipients = await parentRecipients(log.studentId, log.foundationId);
    if (recipients.length === 0) return;

    const studentName = log.student.name;
    const capaian =
      log.achievement?.trim() ||
      log.observations
        .map((observation) => observation.scale?.code)
        .filter((code): code is string => Boolean(code))
        .join(", ");

    await deliver({
      foundationId: log.foundationId,
      actorId: log.teacher.userId,
      entity: "DailyLog",
      entityId: log.id,
      title: `Perkembangan ${studentName} telah diperbarui`,
      template: (link) => {
        const lines = [
          `Perkembangan ${studentName} telah diperbarui.`,
          "",
          `Tanggal: ${formatDate(log.date)}`,
          `Aktivitas: ${log.activity}`,
        ];
        if (capaian) lines.push(`Capaian: ${capaian}`);
        lines.push("", `Lihat perkembangan: ${link}`);
        return lines.join("\n");
      },
      recipients,
    });
  } catch (error) {
    console.error("notifyDailyLogCreated gagal:", error);
  }
}

/**
 * Tugas dinilai → siswa (halaman siswa) dan orang tua (halaman orang tua).
 * Dipanggil setelah transaksi penilaian commit.
 */
export async function notifyAssignmentGraded(
  submissionId: string,
): Promise<void> {
  try {
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        studentId: true,
        score: true,
        feedback: true,
        gradedAt: true,
        gradedBy: true,
        student: { select: { name: true, foundationId: true } },
        assignment: {
          select: { title: true, teacher: { select: { userId: true } } },
        },
      },
    });
    if (!submission) return;

    const foundationId = submission.student.foundationId;
    if (!foundationId) return;

    // `gradedBy` menyimpan `UserData.id`; audit butuh `User.id`-nya.
    const grader = submission.gradedBy
      ? await prisma.userData.findUnique({
          where: { id: submission.gradedBy },
          select: { userId: true },
        })
      : null;

    const parents = await parentRecipients(submission.studentId, foundationId);
    const recipients: Recipient[] = [
      {
        id: submission.studentId,
        phone: null,
        audience: "student",
      },
      ...parents,
    ];

    const studentName = submission.student.name;
    const title = submission.assignment.title;
    const score = submission.score === null ? "-" : String(submission.score);
    const gradeDate = formatDate(submission.gradedAt ?? new Date());

    await deliver({
      foundationId,
      actorId: grader?.userId ?? submission.assignment.teacher.userId,
      entity: "AssignmentSubmission",
      entityId: submission.id,
      title: `Tugas ${title} telah dinilai`,
      template: (link) => {
        const lines = [
          `Tugas ${title} untuk ${studentName} telah dinilai.`,
          "",
          `Tanggal: ${gradeDate}`,
          `Nilai: ${score}`,
        ];
        if (submission.feedback?.trim())
          lines.push(`Catatan: ${submission.feedback}`);
        lines.push("", `Lihat tugas: ${link}`);
        return lines.join("\n");
      },
      recipients,
    });
  } catch (error) {
    console.error("notifyAssignmentGraded gagal:", error);
  }
}
