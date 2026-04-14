import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const entity = searchParams.get("entity");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const logs = await prisma.activityLog.findMany({
    where: { ...(entity ? { entity } : {}) },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 200),
  });

  return apiSuccess(logs);
}
