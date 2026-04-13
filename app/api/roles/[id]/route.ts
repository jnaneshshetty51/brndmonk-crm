import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  const role = await prisma.systemRole.findUnique({ where: { id } });
  if (!role) return apiError("Role not found", 404);
  return apiSuccess(role);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.systemRole.findUnique({ where: { id } });
  if (!existing) return apiError("Role not found", 404);

  const updateData: Record<string, unknown> = {};
  if (body.displayName) updateData.displayName = body.displayName;
  if (body.permissions) updateData.permissions = body.permissions;

  const role = await prisma.systemRole.update({ where: { id }, data: updateData });
  return apiSuccess(role);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  const role = await prisma.systemRole.findUnique({ where: { id } });
  if (!role) return apiError("Role not found", 404);
  if (role.isSystem) return apiError("Cannot delete a system role", 400);

  await prisma.systemRole.delete({ where: { id } });
  return apiSuccess({ message: "Role deleted" });
}
