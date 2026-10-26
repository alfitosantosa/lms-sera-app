import { type Prisma } from "@/prisma/generated/client";

/**
 * Penulisan `AuditLog` modul pengembangan siswa.
 * Dipanggil DI DALAM `prisma.$transaction` supaya audit ikut ter-rollback
 * bila mutasi utamanya gagal.
 */
export type AuditEntry = {
  foundationId: string;
  /** `User.id` pemanggil (selalu ada, walau akun belum punya baris UserData). */
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
};

/** Prisma hanya menerima JsonValue; Date/objek Prisma diserialkan dulu. */
export function toJson(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined || value === null) return undefined;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function writeAudit(tx: Prisma.TransactionClient, entry: AuditEntry) {
  await tx.auditLog.create({
    data: {
      foundationId: entry.foundationId,
      actorId: entry.actorId,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      before: toJson(entry.before),
      after: toJson(entry.after),
    },
  });
}
