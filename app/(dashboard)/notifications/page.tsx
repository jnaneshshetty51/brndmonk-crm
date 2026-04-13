"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { formatDate } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  message: string;
  actionLink?: string;
  status: string;
  createdAt: string;
  readAt?: string;
  client?: { id: string; name: string };
}

const typeIcon: Record<string, string> = {
  brief_approved: "✅",
  brief_rejected: "❌",
  brief_revision: "✏️",
  shoot_reminder: "🎬",
  video_ready: "🎥",
  project_update: "💻",
  general: "🔔",
};

const typeLabel: Record<string, string> = {
  brief_approved: "Brief Approved",
  brief_rejected: "Brief Rejected",
  brief_revision: "Revision Requested",
  shoot_reminder: "Shoot Reminder",
  video_ready: "Video Ready",
  project_update: "Project Update",
  general: "Notification",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = () => {
    const params = filter === "all" ? "?limit=50" : `?status=${filter}&limit=50`;
    fetch(`/api/notifications${params}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setNotifications(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, [filter]);

  const markAllRead = async () => {
    setMarkingAll(true);
    await fetch("/api/notifications", { method: "PATCH" });
    fetchNotifications();
    setMarkingAll(false);
  };

  const markRead = async (notifId: string) => {
    await fetch(`/api/notifications/${notifId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "read" }),
    });
    setNotifications((prev) => prev.map((n) => n.id === notifId ? { ...n, status: "read" } : n));
  };

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  return (
    <div>
      <Topbar title="Notifications" />
      <div className="p-6 space-y-4">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-white rounded-xl border border-[#E5E7EB] p-1">
            {(["all", "unread", "read"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? "bg-[#6B5B95] text-white" : "text-[#6B7280] hover:bg-gray-50"}`}>
                {f === "unread" && unreadCount > 0 ? `Unread (${unreadCount})` : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} disabled={markingAll} className="px-4 py-2 text-sm font-medium text-[#6B5B95] border border-[#6B5B95]/30 rounded-lg hover:bg-[#6B5B95]/5 disabled:opacity-50 transition-colors">
              {markingAll ? "Marking..." : "Mark all as read"}
            </button>
          )}
        </div>

        {/* Notifications list */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-4 h-20 animate-pulse" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-16 text-center">
            <p className="text-5xl mb-3">🔔</p>
            <p className="font-semibold text-[#2D3142] text-lg">All caught up!</p>
            <p className="text-[#9CA3AF] text-sm mt-1">No {filter !== "all" ? filter : ""} notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div key={notif.id}
                className={`rounded-xl border p-4 transition-all ${notif.status === "unread" ? "bg-[#6B5B95]/5 border-[#6B5B95]/20" : "bg-white border-[#E5E7EB]"}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${notif.status === "unread" ? "bg-[#6B5B95]/15" : "bg-gray-100"}`}>
                    {typeIcon[notif.type] || "🔔"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-[#9CA3AF] uppercase">{typeLabel[notif.type] || notif.type}</span>
                          {notif.client && (
                            <span className="text-xs text-[#9CA3AF]">· {notif.client.name}</span>
                          )}
                          {notif.status === "unread" && (
                            <span className="w-2 h-2 rounded-full bg-[#6B5B95] inline-block" />
                          )}
                        </div>
                        <p className="text-sm text-[#2D3142] mt-0.5 leading-relaxed">{notif.message}</p>
                        <p className="text-xs text-[#9CA3AF] mt-1">{formatDate(notif.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {notif.actionLink && (
                          <Link href={notif.actionLink} className="text-xs text-[#6B5B95] font-medium hover:underline whitespace-nowrap">
                            View →
                          </Link>
                        )}
                        {notif.status === "unread" && (
                          <button onClick={() => markRead(notif.id)} className="text-xs text-[#9CA3AF] hover:text-[#6B5B95] transition-colors whitespace-nowrap">
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
