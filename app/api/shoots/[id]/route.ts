import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  const shoot = await prisma.shoot.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true } },
      calendar: { select: { id: true, month: true, year: true } },
    },
  });

  if (!shoot) return apiError("Shoot not found", 404);
  return apiSuccess(shoot);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  const body = await req.json();

  const updateData: Record<string, unknown> = {};
  const fields = [
    "location", "shootName", "equipmentNeeded", "specialInstructions",
    "rawFootageLocation", "notesPostShoot", "status",
  ];
  fields.forEach((f) => { if (body[f] !== undefined) updateData[f] = body[f]; });
  if (body.shootDate) updateData.shootDate = new Date(body.shootDate);
  if (body.duration) updateData.duration = parseInt(body.duration);
  if (body.assignedMembers) updateData.assignedMembers = body.assignedMembers;
  if (body.briefIds) updateData.briefIds = body.briefIds;
  if (body.status === "in_progress") updateData.startedAt = new Date();
  if (body.status === "completed") updateData.completedAt = new Date();

  const shoot = await prisma.shoot.update({ where: { id }, data: updateData });
  return apiSuccess(shoot);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  await prisma.shoot.delete({ where: { id } });
  return apiSuccess({ message: "Shoot deleted" });
}
