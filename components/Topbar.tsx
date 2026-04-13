"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Notification {
  id: string;
  message: string;
  type: string;
  status: string;
  createdAt: string;
}

export default function Topbar({ title }: { title: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = notifications.filter((n) => n.status === "unread").length;

  useEffect(() => {
    fetch("/api/notifications?limit=10")
      .then((r) => r.json())
      .then((d) => { if (d.success) setNotifications(d.data); });
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
  };

  return (
    <header className="h-14 md:h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      {/* Mobile: show logo; desktop: show title */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-7 h-7 rounded-lg bg-[#6B5B95] flex items-center justify-center text-white font-bold text-sm">B</div>
        <span className="font-bold text-[#2D3142] text-sm">Brndmonk</span>
      </div>
      <h1 className="hidden md:block text-lg font-semibold text-[#2D3142]">{title}</h1>
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative w-9 h-9 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-gray-50 transition-colors"
          >
            🔔
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
                <span className="text-sm font-semibold text-[#2D3142]">Notifications</span>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-[#6B5B95] hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#F3F4F6]">
                {notifications.length === 0 ? (
                  <p className="text-sm text-[#9CA3AF] text-center py-6">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 text-sm ${n.status === "unread" ? "bg-[#6B5B95]/5" : ""}`}
                    >
                      <p className="text-[#2D3142] leading-relaxed">{n.message}</p>
                      <p className="text-[#9CA3AF] text-xs mt-1">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-[#E5E7EB]">
                <Link href="/notifications" onClick={() => setShowNotifs(false)} className="text-xs text-[#6B5B95] font-medium hover:underline">
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick create */}
        <Link
          href="/clients"
          className="px-4 py-2 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] transition-colors"
        >
          + New Client
        </Link>
      </div>
    </header>
  );
}
