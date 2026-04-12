import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    totalClients,
    activeClients,
    totalBriefs,
    approvedBriefs,
    pendingBriefs,
    rejectedBriefs,
    upcomingShoots,
    videosAwaitingApproval,
    activeProjects,
    unreadNotifications,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { status: "active" } }),
    prisma.contentBrief.count(),
    prisma.contentBrief.count({ where: { status: "approved" } }),
    prisma.contentBrief.count({ where: { status: { in: ["draft", "sent_to_client", "revision_requested"] } } }),
    prisma.contentBrief.count({ where: { status: "rejected" } }),
    prisma.shoot.findMany({
      where: { shootDate: { gte: now, lte: nextWeek }, status: "scheduled" },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { shootDate: "asc" },
      take: 5,
    }),
    prisma.video.count({ where: { status: { in: ["ready_for_approval", "pending_client_approval"] } } }),
    prisma.project.count({ where: { status: { notIn: ["maintenance", "completed"] } } }),
    prisma.notification.count({ where: { status: "unread" } }),
  ]);

  return apiSuccess({
    stats: {
      totalClients,
      activeClients,
      totalBriefs,
      approvedBriefs,
      pendingBriefs,
      rejectedBriefs,
      videosAwaitingApproval,
      activeProjects,
      unreadNotifications,
    },
    upcomingShoots,
  });
}
