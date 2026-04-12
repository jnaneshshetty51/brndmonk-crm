import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
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

export async function DELETE() {
  const response = apiSuccess({ message: "Logged out" });
  response.cookies.set("token", "", { httpOnly: true, maxAge: 0, path: "/" });
  return response;
}
