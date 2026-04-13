import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;

  const shoot = await prisma.shoot.findUnique({
    where: { id },
    include: {
      briefs: { select: { id: true, ideaTitle: true } },
      client: true,
    },
  });

  if (!shoot) return apiError("Shoot not found", 404);
  if (!shoot.calendarId) return apiError("Shoot has no linked calendar", 400);

  // Create a video for each linked brief (or one if no briefs)
  const created = [];

  if (shoot.briefs.length === 0) {
    // Create a generic video
    const video = await prisma.video.create({
      data: {
        shootId: shoot.id,
        calendarId: shoot.calendarId,
        clientId: shoot.clientId,
        rawFootageLink: shoot.rawFootageLocation || undefined,
        rawFootageUploadedAt: shoot.rawFootageLocation ? new Date() : undefined,
        status: shoot.rawFootageLocation ? "in_editing" : "raw_footage_pending",
        editingStatus: "not_started",
      },
    });
    created.push(video);
  } else {
    for (const brief of shoot.briefs) {
      // Skip if a video for this brief already exists from this shoot
      const existing = await prisma.video.findFirst({
        where: { briefId: brief.id, shootId: shoot.id },
      });
      if (existing) continue;

      const video = await prisma.video.create({
        data: {
          briefId: brief.id,
          shootId: shoot.id,
          calendarId: shoot.calendarId,
          clientId: shoot.clientId,
          rawFootageLink: shoot.rawFootageLocation || undefined,
          rawFootageUploadedAt: shoot.rawFootageLocation ? new Date() : undefined,
          status: shoot.rawFootageLocation ? "in_editing" : "raw_footage_pending",
          editingStatus: "not_started",
        },
      });
      created.push(video);
    }
  }

  if (created.length === 0) {
    return apiSuccess({ message: "Videos already created for this shoot", count: 0 });
  }

  await prisma.notification.create({
    data: {
      clientId: shoot.clientId,
      type: "video_ready",
      message: `${created.length} video${created.length > 1 ? "s" : ""} added to editing pipeline from shoot "${shoot.shootName || "Unnamed"}"`,
    },
  });

  return apiSuccess({ message: `Created ${created.length} video(s)`, count: created.length });
}
