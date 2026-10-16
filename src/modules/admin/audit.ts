import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { Prisma } from "@prisma/client";

export async function logAudit(params: {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  meta?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId ?? null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ?? null,
        meta: (params.meta as Prisma.InputJsonValue) ?? undefined,
      },
    });
  } catch (e) {
    logger.error("audit_log_failed", { err: String(e) });
  }
}
