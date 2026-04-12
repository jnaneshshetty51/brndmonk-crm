import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const department = searchParams.get("department");

  const members = await prisma.teamMember.findMany({
    where: { ...(department ? { department } : {}) },
    orderBy: { name: "asc" },
  });

  return apiSuccess(members);
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const body = await req.json();
  const { name, email, phone, role, department, skills } = body;

  if (!name || !email || !role || !department) {
    return apiError("Name, email, role, and department are required");
  }

  const member = await prisma.teamMember.create({
    data: { name, email, phone, role, department, skills: skills || [] },
  });

  return apiSuccess(member, 201);
}
