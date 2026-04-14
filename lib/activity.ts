import { prisma } from "@/lib/db";

export async function logActivity({
  userId,
  userName,
  action,
  entity,
  entityId,
  entityName,
  details,
}: {
  userId?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  entityName?: string;
  details?: string;
}) {
  try {
    await prisma.activityLog.create({
      data: { userId, userName, action, entity, entityId, entityName, details },
    });
  } catch {
    // Never let logging break a request
  }
}
