import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  const video = await prisma.video.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true } },
      brief: true,
      shoot: { select: { id: true, shootDate: true, location: true } },
    },
  });

  if (!video) return apiError("Video not found", 404);
  return apiSuccess(video);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.video.findUnique({ where: { id } });
  if (!existing) return apiError("Video not found", 404);

  const versions = existing.versions as Array<{ version: number; link: string; uploadedAt: string; feedback?: string }>;

  if (body.finalVideoLink && body.finalVideoLink !== existing.finalVideoLink) {
    const newVersion = existing.finalVideoVersion + (versions.length > 0 ? 1 : 0);
    versions.push({ version: newVersion, link: body.finalVideoLink, uploadedAt: new Date().toISOString() });
  }

  const updateData: Record<string, unknown> = {};
  const fields = ["rawFootageLink", "finalVideoLink", "editorId", "editingStatus",
    "clientApprovalStatus", "clientFeedback", "status", "scheduledPostDate",
    "scheduledPostPlatform", "scheduledPostCaption"];
  fields.forEach((f) => { if (body[f] !== undefined) updateData[f] = body[f]; });

  if (body.finalVideoLink && body.finalVideoLink !== existing.finalVideoLink) {
    updateData.versions = versions;
    updateData.finalVideoVersion = versions.length;
  }
  if (body.status === "pending_client_approval") updateData.sentToClientAt = new Date();
  if (body.clientApprovalStatus === "approved") updateData.clientApprovedAt = new Date();
  if (body.status === "posted") updateData.postedAt = new Date();

  const video = await prisma.video.update({ where: { id }, data: updateData });
  return apiSuccess(video);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  await prisma.video.delete({ where: { id } });
  return apiSuccess({ message: "Video deleted" });
}
