import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { client: { select: { id: true, name: true, email: true } } },
  });

  if (!project) return apiError("Project not found", 404);
  return apiSuccess(project);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  const body = await req.json();

  const updateData: Record<string, unknown> = {};
  const fields = [
    "name", "description", "subType", "status", "progressPercentage",
    "projectManagerId", "designerId", "deploymentLink", "maintenanceStatus",
  ];
  fields.forEach((f) => { if (body[f] !== undefined) updateData[f] = body[f]; });

  const arrayFields = ["features", "devTeamIds", "deliverables", "credentials", "integrations", "clientFeedback"];
  arrayFields.forEach((f) => { if (body[f] !== undefined) updateData[f] = body[f]; });

  const dateFields = ["discoveryDeadline", "designDeadline", "devDeadline", "testingDeadline", "deploymentDeadline", "deploymentDate", "maintenanceEndDate"];
  dateFields.forEach((f) => { if (body[f]) updateData[f] = new Date(body[f]); });

  const project = await prisma.project.update({ where: { id }, data: updateData });
  return apiSuccess(project);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  await prisma.project.delete({ where: { id } });
  return apiSuccess({ message: "Project deleted" });
}
