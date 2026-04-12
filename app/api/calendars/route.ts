import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  const calendars = await prisma.calendar.findMany({
    where: clientId ? { clientId } : {},
    include: {
      client: { select: { id: true, name: true } },
      _count: { select: { briefs: true, shoots: true, videos: true } },
    },
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
  });

  return apiSuccess(calendars);
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const body = await req.json();
  const { clientId, month, year, totalReels, totalPosts, totalCarousels, notes } = body;

  if (!clientId || !month || !year) {
    return apiError("Client, month, and year are required");
  }

  const calendar = await prisma.calendar.create({
    data: {
      clientId,
      month,
      year: parseInt(year),
      totalReels: parseInt(totalReels) || 0,
      totalPosts: parseInt(totalPosts) || 0,
      totalCarousels: parseInt(totalCarousels) || 0,
      notes,
    },
    include: {
      client: { select: { id: true, name: true } },
    },
  });

  return apiSuccess(calendar, 201);
}
