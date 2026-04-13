import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const calendarId = searchParams.get("calendarId");
  const status = searchParams.get("status");
  const limit = searchParams.get("limit");

  const videos = await prisma.video.findMany({
    where: {
      ...(clientId ? { clientId } : {}),
      ...(calendarId ? { calendarId } : {}),
      ...(status ? { status } : {}),
    },
    ...(limit ? { take: parseInt(limit) } : {}),
    include: {
      client: { select: { id: true, name: true } },
      brief: { select: { id: true, ideaTitle: true, contentType: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(videos);
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const body = await req.json();
  const { briefId, shootId, calendarId, clientId, rawFootageLink, editorId } = body;

  if (!calendarId || !clientId) {
    return apiError("Calendar and client are required");
  }

  const video = await prisma.video.create({
    data: {
      briefId: briefId || null,
      shootId: shootId || null,
      calendarId,
      clientId,
      rawFootageLink,
      rawFootageUploadedAt: rawFootageLink ? new Date() : null,
      editorId,
      versions: [],
    },
  });

  return apiSuccess(video, 201);
}
