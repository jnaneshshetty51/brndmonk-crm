import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { logActivity } from "@/lib/activity";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true },
  });
  if (!invoice) return apiError("Invoice not found", 404);
  return apiSuccess(invoice);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);
  const { id } = await params;

  const body = await req.json();
  const { lineItems, subtotal, taxPercent, taxAmount, total, dueDate, notes, status } = body;

  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) return apiError("Invoice not found", 404);

  const updateData: Record<string, unknown> = {};
  if (lineItems !== undefined) updateData.lineItems = lineItems;
  if (subtotal !== undefined) updateData.subtotal = subtotal;
  if (taxPercent !== undefined) updateData.taxPercent = taxPercent;
  if (taxAmount !== undefined) updateData.taxAmount = taxAmount;
  if (total !== undefined) updateData.total = total;
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
  if (notes !== undefined) updateData.notes = notes;
  if (status !== undefined) {
    updateData.status = status;
    if (status === "sent" && !existing.sentAt) updateData.sentAt = new Date();
    if (status === "paid" && !existing.paidAt) updateData.paidAt = new Date();
  }

  const invoice = await prisma.invoice.update({
    where: { id },
    data: updateData,
    include: { client: { select: { id: true, name: true } } },
  });

  await logActivity({
    userId: user.userId,
    userName: user.name,
    action: status ? `marked as ${status}` : "updated",
    entity: "Invoice",
    entityId: invoice.id,
    entityName: invoice.invoiceNumber,
    details: status ? `Status → ${status}` : `Updated invoice for ${invoice.client.name}`,
  });

  return apiSuccess(invoice);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: { select: { name: true } } },
  });
  if (!invoice) return apiError("Invoice not found", 404);

  await prisma.invoice.delete({ where: { id } });

  await logActivity({
    userId: user.userId,
    userName: user.name,
    action: "deleted",
    entity: "Invoice",
    entityId: id,
    entityName: invoice.invoiceNumber,
    details: `For ${invoice.client.name}`,
  });

  return apiSuccess({ deleted: true });
}
