import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      calendars: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { briefs: true } } },
      },
      projects: { orderBy: { createdAt: "desc" } },
      _count: { select: { shoots: true, videos: true } },
    },
  });

  if (!client) return apiError("Client not found", 404);
  return apiSuccess(client);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  const body = await req.json();

  const client = await prisma.client.update({
    where: { id },
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      contactPerson: body.contactPerson,
      timezone: body.timezone,
      status: body.status,
      services: body.services,
    },
  });

  return apiSuccess(client);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  await prisma.client.delete({ where: { id } });
  return apiSuccess({ message: "Client deleted" });
}
