import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { DEFAULT_EMPTY_PERMISSIONS } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const roles = await prisma.systemRole.findMany({ orderBy: { createdAt: "asc" } });
  return apiSuccess(roles);
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const body = await req.json();
  const { displayName, permissions } = body;
  if (!displayName) return apiError("Display name is required");

  const name = displayName.toLowerCase().replace(/[^a-z0-9]/g, "_");

  const role = await prisma.systemRole.create({
    data: {
      name,
      displayName,
      permissions: permissions || DEFAULT_EMPTY_PERMISSIONS,
      isSystem: false,
    },
  });

  return apiSuccess(role, 201);
}
