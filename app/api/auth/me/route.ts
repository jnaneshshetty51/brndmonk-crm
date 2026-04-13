import { NextRequest } from "next/server";
import { getUserFromRequest, hashPassword, comparePassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) return apiError("Unauthorized", 401);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true, status: true },
  });

  if (!user) return apiError("User not found", 404);
  return apiSuccess(user);
}

export async function PUT(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) return apiError("Unauthorized", 401);

  const body = await req.json();
  const { name, email, currentPassword, newPassword } = body;

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) return apiError("User not found", 404);

  const updateData: Record<string, string> = {};

  if (name) updateData.name = name;
  if (email) updateData.email = email;

  if (newPassword) {
    if (!currentPassword) return apiError("Current password required", 400);
    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) return apiError("Current password is incorrect", 400);
    updateData.password = await hashPassword(newPassword);
  }

  const updated = await prisma.user.update({
    where: { id: payload.userId },
    data: updateData,
    select: { id: true, email: true, name: true, role: true, status: true },
  });

  return apiSuccess(updated);
}

export async function DELETE() {
  const response = apiSuccess({ message: "Logged out" });
  response.cookies.set("token", "", { httpOnly: true, maxAge: 0, path: "/" });
  return response;
}
