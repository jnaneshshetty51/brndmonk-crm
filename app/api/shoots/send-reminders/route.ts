import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { sendShootReminder } from "@/lib/email";

// Call this endpoint manually or via a cron job to send reminders
export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);

  if (!process.env.RESEND_API_KEY) {
    return apiError("Email not configured. Add RESEND_API_KEY to environment.", 503);
  }

  const now = new Date();
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);
  const in23h = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const in90m = new Date(now.getTime() + 90 * 60 * 1000);
  const in30m = new Date(now.getTime() + 30 * 60 * 1000);

  // Shoots ~24h away that haven't had 24h reminder sent
  const shoots24h = await prisma.shoot.findMany({
    where: {
      status: "scheduled",
      reminderSent24h: false,
      shootDate: { gte: in23h, lte: in25h },
    },
    include: { client: true },
  });

  // Shoots ~1h away that haven't had 1h reminder sent
  const shoots1h = await prisma.shoot.findMany({
    where: {
      status: "scheduled",
      reminderSent1h: false,
      shootDate: { gte: in30m, lte: in90m },
    },
    include: { client: true },
  });

  const results = { sent24h: 0, sent1h: 0, errors: 0 };

  const allTeamMembers = await prisma.teamMember.findMany({
    where: { status: "active" },
    select: { id: true, name: true, email: true },
  });
  const memberMap = new Map(allTeamMembers.map(m => [m.id, m]));

  for (const shoot of shoots24h) {
    const members = (shoot.assignedMembers as Array<{ memberId: string }>) || [];
    for (const { memberId } of members) {
      const member = memberMap.get(memberId);
      if (!member?.email) continue;
      try {
        await sendShootReminder({
          teamMemberEmail: member.email,
          teamMemberName: member.name,
          shootName: shoot.shootName || "",
          shootDate: shoot.shootDate,
          location: shoot.location || undefined,
          clientName: shoot.client.name,
          hoursUntil: 24,
        });
        results.sent24h++;
      } catch { results.errors++; }
    }
    await prisma.shoot.update({ where: { id: shoot.id }, data: { reminderSent24h: true } });
  }

  for (const shoot of shoots1h) {
    const members = (shoot.assignedMembers as Array<{ memberId: string }>) || [];
    for (const { memberId } of members) {
      const member = memberMap.get(memberId);
      if (!member?.email) continue;
      try {
        await sendShootReminder({
          teamMemberEmail: member.email,
          teamMemberName: member.name,
          shootName: shoot.shootName || "",
          shootDate: shoot.shootDate,
          location: shoot.location || undefined,
          clientName: shoot.client.name,
          hoursUntil: 1,
        });
        results.sent1h++;
      } catch { results.errors++; }
    }
    await prisma.shoot.update({ where: { id: shoot.id }, data: { reminderSent1h: true } });
  }

  return apiSuccess(results);
}
