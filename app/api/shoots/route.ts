import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const status = searchParams.get("status");

  const shoots = await prisma.shoot.findMany({
    where: {
      ...(clientId ? { clientId } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      client: { select: { id: true, name: true } },
      calendar: { select: { id: true, month: true, year: true } },
    },
    orderBy: { shootDate: "asc" },
  });

  return apiSuccess(shoots);
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const body = await req.json();
  const {
    clientId, calendarId, shootDate, duration, location, shootName,
    briefIds, assignedMembers, equipmentNeeded, specialInstructions,
  } = body;

  if (!clientId || !shootDate) {
    return apiError("Client and shoot date are required");
  }

  const shoot = await prisma.shoot.create({
    data: {
      clientId,
      calendarId: calendarId || null,
      shootDate: new Date(shootDate),
      duration: duration ? parseInt(duration) : null,
      location,
      shootName,
      briefIds: briefIds || [],
      assignedMembers: assignedMembers || [],
      equipmentNeeded,
      specialInstructions,
    },
    include: {
      client: { select: { id: true, name: true } },
    },
  });

  return apiSuccess(shoot, 201);
}
