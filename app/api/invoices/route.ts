import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { logActivity } from "@/lib/activity";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const status = searchParams.get("status");

  const invoices = await prisma.invoice.findMany({
    where: {
      ...(clientId ? { clientId } : {}),
      ...(status ? { status } : {}),
    },
    include: { client: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(invoices);
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const body = await req.json();
  const { clientId, lineItems, subtotal, taxPercent, taxAmount, total, dueDate, notes } = body;

  if (!clientId || !lineItems?.length) return apiError("Client and line items required", 400);

  const count = await prisma.invoice.count();
  const invoiceNumber = `INV-${String(count + 1).padStart(4, "0")}`;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      clientId,
      lineItems,
      subtotal: subtotal ?? 0,
      taxPercent: taxPercent ?? 0,
      taxAmount: taxAmount ?? 0,
      total: total ?? 0,
      dueDate: dueDate ? new Date(dueDate) : null,
      notes,
    },
    include: { client: { select: { id: true, name: true } } },
  });

  await logActivity({
    userId: user.userId,
    userName: user.name,
    action: "created",
    entity: "Invoice",
    entityId: invoice.id,
    entityName: invoice.invoiceNumber,
    details: `For ${invoice.client.name} — ₹${total}`,
  });

  return apiSuccess(invoice, 201);
}
