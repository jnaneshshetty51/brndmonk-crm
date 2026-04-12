import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  const calendar = await prisma.calendar.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true } },
      briefs: { orderBy: { createdAt: "asc" } },
      shoots: { orderBy: { shootDate: "asc" } },
      videos: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!calendar) return apiError("Calendar not found", 404);
  return apiSuccess(calendar);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  const body = await req.json();

  const updateData: Record<string, unknown> = {};
  if (body.status !== undefined) updateData.status = body.status;
  if (body.notes !== undefined) updateData.notes = body.notes;
  if (body.totalReels !== undefined) updateData.totalReels = parseInt(body.totalReels);
  if (body.totalPosts !== undefined) updateData.totalPosts = parseInt(body.totalPosts);
  if (body.totalCarousels !== undefined) updateData.totalCarousels = parseInt(body.totalCarousels);
  if (body.status === "sent_to_client") updateData.sentToClientAt = new Date();
  if (body.status === "approved") updateData.fullyApprovedAt = new Date();
  if (body.status === "completed") updateData.completedAt = new Date();

  const calendar = await prisma.calendar.update({ where: { id }, data: updateData });
  return apiSuccess(calendar);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  await prisma.calendar.delete({ where: { id } });
  return apiSuccess({ message: "Calendar deleted" });
}
