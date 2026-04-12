import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return apiError("Email and password are required");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return apiError("Invalid credentials", 401);
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return apiError("Invalid credentials", 401);
    }

    if (user.status !== "active") {
      return apiError("Account is inactive", 403);
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = apiSuccess({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    });
    response.cookies.set("token", token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: "/" });
    return response;
  } catch (err) {
    console.error(err);
    return apiError("Internal server error", 500);
  }
}
