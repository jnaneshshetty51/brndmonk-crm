import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  const member = await prisma.teamMember.findUnique({ where: { id } });
  if (!member) return apiError("Team member not found", 404);
  return apiSuccess(member);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  const body = await req.json();

  const member = await prisma.teamMember.update({
    where: { id },
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: body.role,
      department: body.department,
      skills: body.skills,
      status: body.status,
    },
  });

  return apiSuccess(member);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  await prisma.teamMember.delete({ where: { id } });
  return apiSuccess({ message: "Team member deleted" });
}
