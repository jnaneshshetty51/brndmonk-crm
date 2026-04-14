import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  const brief = await prisma.contentBrief.findUnique({
    where: { id },
    include: {
      calendar: { include: { client: { select: { id: true, name: true } } } },
    },
  });

  if (!brief) return apiError("Brief not found", 404);
  return apiSuccess(brief);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.contentBrief.findUnique({ where: { id } });
  if (!existing) return apiError("Brief not found", 404);

  const versions = existing.versions as Array<{ version: number; createdAt: string; changes: string }>;

  if (body.changes) {
    versions.push({
      version: existing.currentVersion + 1,
      createdAt: new Date().toISOString(),
      changes: body.changes,
    });
  }

  const brief = await prisma.contentBrief.update({
    where: { id },
    data: {
      ideaTitle: body.ideaTitle ?? existing.ideaTitle,
      ideaDescription: body.ideaDescription ?? existing.ideaDescription,
      visualDescription: body.visualDescription ?? existing.visualDescription,
      script: body.script ?? existing.script,
      music: body.music ?? existing.music,
      hashtags: body.hashtags ?? existing.hashtags,
      cta: body.cta ?? existing.cta,
      moodBoardLinks: body.moodBoardLinks ?? existing.moodBoardLinks,
      specialRequirements: body.specialRequirements ?? existing.specialRequirements,
      status: body.status ?? existing.status,
      revisionNotes: body.revisionNotes ?? existing.revisionNotes,
      currentVersion: body.changes ? existing.currentVersion + 1 : existing.currentVersion,
      versions: body.changes ? (versions as unknown as import("@prisma/client").Prisma.InputJsonValue) : (existing.versions as unknown as import("@prisma/client").Prisma.InputJsonValue),
      lastRevisedAt: body.changes ? new Date() : existing.lastRevisedAt,
      approvalDeadline: body.approvalDeadline ? new Date(body.approvalDeadline) : existing.approvalDeadline,
      scheduledPostDate: body.scheduledPostDate !== undefined
        ? (body.scheduledPostDate ? new Date(body.scheduledPostDate) : null)
        : existing.scheduledPostDate,
      postTime: body.postTime !== undefined ? body.postTime : existing.postTime,
      phase: body.phase !== undefined ? body.phase : existing.phase,
      caption: body.caption !== undefined ? body.caption : existing.caption,
    },
  });

  return apiSuccess(brief);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  await prisma.contentBrief.delete({ where: { id } });
  return apiSuccess({ message: "Brief deleted" });
}
