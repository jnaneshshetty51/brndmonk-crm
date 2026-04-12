import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const type = searchParams.get("type");

  const projects = await prisma.project.findMany({
    where: {
      ...(clientId ? { clientId } : {}),
      ...(type ? { type } : {}),
    },
    include: { client: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(projects);
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const body = await req.json();
  const { clientId, name, description, type, subType, features } = body;

  if (!clientId || !name || !type) {
    return apiError("Client, name, and type are required");
  }

  const project = await prisma.project.create({
    data: {
      clientId,
      name,
      description,
      type,
      subType,
      features: features || [],
      deliverables: [],
      credentials: [],
      integrations: [],
      clientFeedback: [],
    },
    include: { client: { select: { id: true, name: true } } },
  });

  return apiSuccess(project, 201);
}
