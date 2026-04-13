import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { sendCalendarToClient } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  const { id } = await params;

  const calendar = await prisma.calendar.findUnique({
    where: { id },
    include: {
      client: true,
      briefs: { select: { id: true } },
    },
  });

  if (!calendar) return apiError("Calendar not found", 404);
  if (!calendar.client.email) return apiError("Client has no email address", 400);

  if (!process.env.RESEND_API_KEY) {
    return apiError("Email not configured. Add RESEND_API_KEY to environment variables.", 503);
  }

  try {
    await sendCalendarToClient({
      clientEmail: calendar.client.email,
      clientName: calendar.client.name,
      calendarId: calendar.id,
      calendarMonth: calendar.month,
      calendarYear: calendar.year,
      briefCount: calendar.briefs.length,
    });

    await prisma.calendar.update({
      where: { id },
      data: { status: "sent_to_client", sentToClientAt: new Date() },
    });

    await prisma.notification.create({
      data: {
        clientId: calendar.clientId,
        type: "general",
        message: `Calendar sent to ${calendar.client.name} for ${calendar.month} ${calendar.year}`,
      },
    });

    return apiSuccess({ message: "Calendar sent to client" });
  } catch (err) {
    console.error("Email send error:", err);
    return apiError("Failed to send email", 500);
  }
}
