import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role } = await req.json();

    if (!email || !password || !name) {
      return apiError("Email, password, and name are required");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError("User with this email already exists");
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, role: role || "admin" },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = apiSuccess({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token }, 201);
    response.cookies.set("token", token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: "/" });
    return response;
  } catch (err) {
    console.error(err);
    return apiError("Internal server error", 500);
  }
}
