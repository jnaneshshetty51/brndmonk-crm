import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const calendarId = searchParams.get("calendarId");
  const status = searchParams.get("status");

  const briefs = await prisma.contentBrief.findMany({
    where: {
      ...(calendarId ? { calendarId } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      calendar: { include: { client: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });

  return apiSuccess(briefs);
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const body = await req.json();
  const {
    calendarId, briefNumber, contentType, ideaTitle, ideaDescription,
    visualDescription, script, music, hashtags, cta, moodBoardLinks,
    specialRequirements, approvalDeadline,
  } = body;

  if (!calendarId || !contentType || !ideaTitle) {
    return apiError("Missing required fields");
  }

  // Auto-generate briefNumber if not provided
  let finalBriefNumber = briefNumber;
  if (!finalBriefNumber) {
    const count = await prisma.contentBrief.count({ where: { calendarId } });
    finalBriefNumber = String(count + 1);
  }

  const brief = await prisma.contentBrief.create({
    data: {
      calendarId,
      briefNumber: finalBriefNumber,
      contentType,
      ideaTitle,
      ideaDescription,
      visualDescription,
      script,
      music,
      hashtags,
      cta,
      moodBoardLinks,
      specialRequirements,
      approvalDeadline: approvalDeadline ? new Date(approvalDeadline) : null,
      versions: [{ version: 1, createdAt: new Date().toISOString(), changes: "Initial brief" }],
    },
  });

  return apiSuccess(brief, 201);
}
