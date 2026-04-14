"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Bell, Plus, X, CheckCheck, Sparkles } from "lucide-react";

interface Notification {
  id: string;
  message: string;
  type: string;
  status: string;
  createdAt: string;
}

const typeIcon: Record<string, { bg: string; dot: string }> = {
  info:    { bg: "bg-blue-50",   dot: "bg-blue-400" },
  success: { bg: "bg-emerald-50", dot: "bg-emerald-400" },
  warning: { bg: "bg-amber-50",  dot: "bg-amber-400" },
  error:   { bg: "bg-red-50",    dot: "bg-red-400" },
};

export default function Topbar({ title }: { title: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const { user } = useAuth();
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

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Mobile: logo | Desktop: page title */}
      <div className="flex items-center gap-3 md:hidden">
        <div 
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm"
          style={{ background: "var(--gradient-brand)", boxShadow: "0 4px 10px rgba(99,102,241,0.4)" }}
        >
          B
        </div>
        <span className="font-bold text-[#0F172A] text-sm">Brndmonk</span>
      </div>

      <div className="hidden md:flex items-center gap-2">
        <h1 className="text-lg font-bold text-[--text-primary] tracking-tight">
          {title}
        </h1>
        <span
          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "var(--brand-primary-light)", color: "var(--brand-primary)" }}
        >
          <Sparkles size={9} strokeWidth={2.5} />
          Live
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative w-9 h-9 rounded-xl border border-[--border] flex items-center justify-center text-[--text-secondary] hover:bg-[--bg-app] hover:border-[--border-strong] transition-all duration-150"
          >
            <Bell size={15} strokeWidth={1.75} />
            {unread > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1"
                style={{ background: "var(--gradient-danger)", boxShadow: "0 2px 6px rgba(239,68,68,0.5)" }}
              >
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifs && (
            <div
              className="absolute right-0 mt-2 w-[340px] bg-white border border-[--border] rounded-2xl z-50 overflow-hidden"
              style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-[--border]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[--text-primary]">Notifications</span>
                  {unread > 0 && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: "var(--gradient-brand)", color: "white" }}
                    >
                      {unread} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {unread > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-colors hover:bg-[--brand-primary-light]"
                      style={{ color: "var(--brand-primary)" }}
                    >
                      <CheckCheck size={11} strokeWidth={2.5} />
                      All read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifs(false)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[--text-tertiary] hover:text-[--text-primary] hover:bg-[--bg-app] transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-[--border]">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: "var(--bg-app)" }}
                    >
                      <Bell size={20} className="text-[--text-tertiary]" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-medium text-[--text-secondary]">All caught up!</p>
                    <p className="text-xs text-[--text-tertiary] mt-0.5">No notifications yet.</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const t = typeIcon[n.type] ?? typeIcon.info;
                    return (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3.5 transition-colors ${
                          n.status === "unread" ? "bg-[--brand-primary-light]/40" : "hover:bg-[--bg-app]"
                        }`}
                      >
                        <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${t.dot} ${n.status !== "unread" ? "opacity-30" : ""}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[--text-primary] leading-snug">{n.message}</p>
                          <p className="text-[11px] text-[--text-tertiary] mt-1">
                            {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-[--border] bg-[--bg-app]">
                <Link
                  href="/notifications"
                  onClick={() => setShowNotifs(false)}
                  className="text-xs font-bold transition-opacity hover:opacity-70"
                  style={{ color: "var(--brand-primary)" }}
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
          className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-xl transition-all duration-150 hover:opacity-90 active:scale-95"
          style={{
            background: "var(--gradient-brand)",
            boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
          }}
        >
          <Plus size={14} strokeWidth={2.5} />
          <span className="hidden sm:inline">New Client</span>
          <span className="sm:hidden">New</span>
        </Link>

        {/* User avatar (desktop) */}
        {initials && (
          <div
            className="hidden md:flex w-8 h-8 rounded-full items-center justify-center text-white font-bold text-xs cursor-default shrink-0"
            style={{ background: "var(--gradient-accent)", boxShadow: "0 2px 8px rgba(6,182,212,0.35)" }}
            title={user?.name}
          >
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
