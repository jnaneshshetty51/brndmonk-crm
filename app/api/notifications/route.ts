import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "20");

  const notifications = await prisma.notification.findMany({
    where: { ...(status ? { status } : {}) },
    include: { client: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return apiSuccess(notifications);
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const body = await req.json();
  const { clientId, teamMemberId, type, message, actionLink } = body;

  const notification = await prisma.notification.create({
    data: { clientId, teamMemberId, type, message, actionLink },
  });

  return apiSuccess(notification, 201);
}

export async function PATCH(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  // Mark all as read
  await prisma.notification.updateMany({
    where: { status: "unread" },
    data: { status: "read", readAt: new Date() },
  });

  return apiSuccess({ message: "All notifications marked as read" });
}
