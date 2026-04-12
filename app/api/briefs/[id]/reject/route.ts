import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;
  const { feedback, action } = await req.json();

  const status = action === "revision" ? "revision_requested" : "rejected";

  const brief = await prisma.contentBrief.update({
    where: { id },
    data: { status, clientFeedback: feedback },
  });

  return apiSuccess(brief);
}
