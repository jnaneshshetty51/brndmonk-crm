import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const clients = await prisma.client.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { calendars: true, projects: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(clients);
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const body = await req.json();
  const { name, email, phone, contactPerson, timezone, services } = body;

  if (!name || !email) {
    return apiError("Name and email are required");
  }

  const client = await prisma.client.create({
    data: {
      name,
      email,
      phone,
      contactPerson,
      timezone,
      services: services || [],
    },
  });

  return apiSuccess(client, 201);
}
