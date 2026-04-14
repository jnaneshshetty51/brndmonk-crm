import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 2) return apiSuccess({ clients: [], projects: [], shoots: [], invoices: [] });

  const mode = "insensitive" as const;

  const [clients, projects, shoots, invoices] = await Promise.all([
    prisma.client.findMany({
      where: {
        OR: [
          { name: { contains: q, mode } },
          { email: { contains: q, mode } },
          { contactPerson: { contains: q, mode } },
        ],
      },
      select: { id: true, name: true, email: true, status: true },
      take: 5,
    }),
    prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: q, mode } },
          { description: { contains: q, mode } },
        ],
      },
      select: { id: true, name: true, status: true, client: { select: { name: true } } },
      take: 5,
    }),
    prisma.shoot.findMany({
      where: {
        OR: [
          { shootName: { contains: q, mode } },
          { location: { contains: q, mode } },
        ],
      },
      select: { id: true, shootName: true, status: true, shootDate: true, client: { select: { name: true } } },
      take: 5,
    }),
    prisma.invoice.findMany({
      where: {
        OR: [
          { invoiceNumber: { contains: q, mode } },
          { client: { name: { contains: q, mode } } },
        ],
      },
      select: { id: true, invoiceNumber: true, total: true, status: true, client: { select: { name: true } } },
      take: 5,
    }),
  ]);

  return apiSuccess({ clients, projects, shoots, invoices });
}
