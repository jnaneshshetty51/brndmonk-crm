import { Resend } from "resend";

// Lazy init so build doesn't fail without RESEND_API_KEY
function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "re_placeholder");
}
const FROM = process.env.EMAIL_FROM || "Brndmonk CRM <noreply@brndmonk.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://brndmonk-crm.vercel.app";

export async function sendBriefToClient({
  clientEmail,
  clientName,
  briefTitle,
  briefId,
  calendarMonth,
  calendarYear,
}: {
  clientEmail: string;
  clientName: string;
  briefTitle: string;
  briefId: string;
  calendarMonth: string;
  calendarYear: number;
}) {
  return getResend().emails.send({
    from: FROM,
    to: clientEmail,
    subject: `New Content Brief Ready for Review — ${calendarMonth} ${calendarYear}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
        <div style="background:#6B5B95;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:20px;font-weight:700;">Brndmonk</h1>
        </div>
        <h2 style="color:#2D3142;font-size:18px;margin-bottom:8px;">Hi ${clientName},</h2>
        <p style="color:#6B7280;line-height:1.6;margin-bottom:16px;">
          A new content brief has been prepared for your <strong>${calendarMonth} ${calendarYear}</strong> calendar and is ready for your review.
        </p>
        <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:16px;margin-bottom:24px;">
          <p style="color:#2D3142;font-weight:600;margin:0 0 4px;">${briefTitle}</p>
          <p style="color:#9CA3AF;font-size:13px;margin:0;">${calendarMonth} ${calendarYear} Calendar</p>
        </div>
        <a href="${APP_URL}/briefs/${briefId}"
           style="display:inline-block;background:#6B5B95;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
          Review Brief →
        </a>
        <hr style="border:none;border-top:1px solid #E5E7EB;margin:32px 0;">
        <p style="color:#9CA3AF;font-size:12px;">Brndmonk CRM · Content Management</p>
      </div>
    `,
  });
}

export async function sendCalendarToClient({
  clientEmail,
  clientName,
  calendarId,
  calendarMonth,
  calendarYear,
  briefCount,
}: {
  clientEmail: string;
  clientName: string;
  calendarId: string;
  calendarMonth: string;
  calendarYear: number;
  briefCount: number;
}) {
  return getResend().emails.send({
    from: FROM,
    to: clientEmail,
    subject: `Your ${calendarMonth} ${calendarYear} Content Calendar is Ready`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
        <div style="background:#6B5B95;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:20px;font-weight:700;">Brndmonk</h1>
        </div>
        <h2 style="color:#2D3142;font-size:18px;margin-bottom:8px;">Hi ${clientName},</h2>
        <p style="color:#6B7280;line-height:1.6;margin-bottom:16px;">
          Your content calendar for <strong>${calendarMonth} ${calendarYear}</strong> is ready for review.
          It contains <strong>${briefCount} content brief${briefCount !== 1 ? "s" : ""}</strong> for your approval.
        </p>
        <a href="${APP_URL}/calendars/${calendarId}"
           style="display:inline-block;background:#6B5B95;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
          Review Calendar →
        </a>
        <p style="color:#6B7280;font-size:13px;margin-top:16px;line-height:1.6;">
          Please review each brief and let us know your thoughts. You can approve, request changes, or reject individual pieces.
        </p>
        <hr style="border:none;border-top:1px solid #E5E7EB;margin:32px 0;">
        <p style="color:#9CA3AF;font-size:12px;">Brndmonk CRM · Content Management</p>
      </div>
    `,
  });
}

export async function sendShootReminder({
  teamMemberEmail,
  teamMemberName,
  shootName,
  shootDate,
  location,
  clientName,
  hoursUntil,
}: {
  teamMemberEmail: string;
  teamMemberName: string;
  shootName: string;
  shootDate: Date;
  location?: string;
  clientName: string;
  hoursUntil: 24 | 1;
}) {
  const timeLabel = hoursUntil === 24 ? "Tomorrow" : "In 1 Hour";
  return getResend().emails.send({
    from: FROM,
    to: teamMemberEmail,
    subject: `🎬 Shoot Reminder (${timeLabel}) — ${shootName || clientName}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
        <div style="background:#6B5B95;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:20px;font-weight:700;">Brndmonk</h1>
        </div>
        <h2 style="color:#2D3142;font-size:18px;margin-bottom:8px;">Shoot Reminder — ${timeLabel}</h2>
        <p style="color:#6B7280;margin-bottom:16px;">Hi ${teamMemberName}, you have a shoot ${hoursUntil === 24 ? "tomorrow" : "in 1 hour"}.</p>
        <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:16px;margin-bottom:24px;">
          <p style="color:#2D3142;font-weight:600;margin:0 0 8px;">${shootName || "Shoot"}</p>
          <p style="color:#6B7280;font-size:13px;margin:0 0 4px;">📅 ${shootDate.toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}</p>
          <p style="color:#6B7280;font-size:13px;margin:0 0 4px;">👥 Client: ${clientName}</p>
          ${location ? `<p style="color:#6B7280;font-size:13px;margin:0;">📍 ${location}</p>` : ""}
        </div>
        <hr style="border:none;border-top:1px solid #E5E7EB;margin:32px 0;">
        <p style="color:#9CA3AF;font-size:12px;">Brndmonk CRM · Shoot Reminders</p>
      </div>
    `,
  });
}

export async function sendVideoReadyForApproval({
  clientEmail,
  clientName,
  videoId,
  briefTitle,
}: {
  clientEmail: string;
  clientName: string;
  videoId: string;
  briefTitle: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to: clientEmail,
    subject: `Video Ready for Approval — ${briefTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
        <div style="background:#6B5B95;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:20px;font-weight:700;">Brndmonk</h1>
        </div>
        <h2 style="color:#2D3142;font-size:18px;margin-bottom:8px;">Your video is ready, ${clientName}!</h2>
        <p style="color:#6B7280;line-height:1.6;margin-bottom:16px;">
          The edited video for <strong>${briefTitle}</strong> is ready for your review and approval.
        </p>
        <a href="${APP_URL}/videos/${videoId}"
           style="display:inline-block;background:#6B5B95;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
          Review Video →
        </a>
        <hr style="border:none;border-top:1px solid #E5E7EB;margin:32px 0;">
        <p style="color:#9CA3AF;font-size:12px;">Brndmonk CRM · Video Review</p>
      </div>
    `,
  });
}
