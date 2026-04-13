"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Plus, X } from "lucide-react";

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
    <header className="h-14 md:h-16 bg-white/80 backdrop-blur-sm border-b border-[--border] flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      {/* Mobile: logo | Desktop: page title */}
      <div className="flex items-center gap-2.5 md:hidden">
        <div className="w-7 h-7 rounded-lg bg-[--brand-primary] flex items-center justify-center text-white font-bold text-xs shadow-sm">
          B
        </div>
        <span className="font-bold text-[--text-primary] text-sm">Brndmonk</span>
      </div>
      <h1 className="hidden md:block text-lg font-bold text-[--text-primary] tracking-tight">
        {title}
      </h1>

      <div className="flex items-center gap-2.5">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative w-9 h-9 rounded-xl border border-[--border] flex items-center justify-center text-[--text-secondary] hover:bg-[--bg-app] hover:border-[--border-strong] transition-all"
          >
            <Bell size={16} strokeWidth={1.75} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[--status-danger] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[--border] rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[--border]">
                <span className="text-sm font-semibold text-[--text-primary]">
                  Notifications
                  {unread > 0 && (
                    <span className="ml-2 text-[10px] font-bold bg-[--brand-primary-light] text-[--brand-primary] px-1.5 py-0.5 rounded-full">
                      {unread} new
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-[--brand-primary] hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifs(false)}
                    className="text-[--text-tertiary] hover:text-[--text-primary] transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[--border]">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell size={24} className="mx-auto text-[--text-tertiary] mb-2" strokeWidth={1.5} />
                    <p className="text-sm text-[--text-tertiary]">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 text-sm transition-colors ${
                        n.status === "unread"
                          ? "bg-[--brand-primary-light]/50"
                          : "hover:bg-[--bg-app]"
                      }`}
                    >
                      {n.status === "unread" && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[--brand-primary] mr-2 mb-0.5 align-middle" />
                      )}
                      <span className="text-[--text-primary] leading-relaxed">
                        {n.message}
                      </span>
                      <p className="text-[--text-tertiary] text-xs mt-1">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-[--border] bg-[--bg-app]">
                <Link
                  href="/notifications"
                  onClick={() => setShowNotifs(false)}
                  className="text-xs text-[--brand-primary] font-semibold hover:underline"
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link
          href="/clients"
          className="flex items-center gap-1.5 px-4 py-2 bg-[--brand-primary] text-white text-sm font-semibold rounded-xl hover:bg-[--brand-primary-hover] transition-colors shadow-sm"
        >
          <Plus size={15} strokeWidth={2.5} />
          New Client
        </Link>
      </div>
    </header>
  );
}
