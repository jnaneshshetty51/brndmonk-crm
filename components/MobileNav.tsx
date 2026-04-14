"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Camera,
  Video,
  FolderKanban,
  Handshake,
  Calendar,
  Bell,
  Settings,
  MoreHorizontal,
  X,
  Receipt,
  Activity,
  type LucideIcon,
} from "lucide-react";

const allTabs: { href: string; Icon: LucideIcon; label: string; section: string | null }[] = [
  { href: "/dashboard",        Icon: LayoutDashboard, label: "Home",      section: null },
  { href: "/clients",          Icon: Users,           label: "Clients",   section: "clients" },
  { href: "/calendars",        Icon: CalendarDays,    label: "Calendars", section: "calendars" },
  { href: "/shoots",           Icon: Camera,          label: "Shoots",    section: "shoots" },
  { href: "/videos",           Icon: Video,           label: "Videos",    section: "videos" },
  { href: "/projects",         Icon: FolderKanban,    label: "Projects",  section: "projects" },
  { href: "/teams",            Icon: Handshake,       label: "Team",      section: "teams" },
  { href: "/invoices",         Icon: Receipt,         label: "Invoices",  section: null },
  { href: "/posting-calendar", Icon: Calendar,        label: "Calendar",  section: "posting_calendar" },
  { href: "/activity",         Icon: Activity,        label: "Activity",  section: null },
  { href: "/notifications",    Icon: Bell,            label: "Notifs",    section: "notifications" },
  { href: "/settings",         Icon: Settings,        label: "Settings",  section: "settings" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { can } = useAuth();
  const [showMore, setShowMore] = useState(false);

  const visible = allTabs.filter((t) => !t.section || can(t.section, "view"));
  const primary = visible.slice(0, 4);
  const more = visible.slice(4);

  return (
    <>
      {/* Bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
        style={{
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {primary.map((tab) => {
          const active =
            pathname === tab.href ||
            (tab.href !== "/dashboard" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => setShowMore(false)}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all duration-150"
            >
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  active ? "scale-110" : ""
                }`}
                style={
                  active
                    ? { background: "var(--gradient-brand)", boxShadow: "0 4px 12px rgba(99,102,241,0.5)" }
                    : {}
                }
              >
                <tab.Icon
                  size={18}
                  strokeWidth={active ? 2.25 : 1.75}
                  color={active ? "white" : "rgba(148,163,184,0.8)"}
                />
              </span>
              <span
                className="text-[10px] font-semibold"
                style={{ color: active ? "white" : "rgba(148,163,184,0.6)" }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}

        {more.length > 0 && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all duration-150"
          >
            <span
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                showMore ? "scale-110" : ""
              }`}
              style={
                showMore
                  ? { background: "var(--gradient-brand)", boxShadow: "0 4px 12px rgba(99,102,241,0.5)" }
                  : {}
              }
            >
              <MoreHorizontal
                size={18}
                strokeWidth={1.75}
                color={showMore ? "white" : "rgba(148,163,184,0.8)"}
              />
            </span>
            <span
              className="text-[10px] font-semibold"
              style={{ color: showMore ? "white" : "rgba(148,163,184,0.6)" }}
            >
              More
            </span>
          </button>
        )}
      </nav>

      {/* Backdrop */}
      {showMore && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More drawer */}
      {showMore && (
        <div
          className="md:hidden fixed bottom-[64px] left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
          style={{
            background: "rgba(15, 23, 42, 0.98)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderBottom: "none",
            boxShadow: "0 -20px 60px rgba(0,0,0,0.4)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle + header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <span className="text-sm font-bold text-white">More</span>
            <button
              onClick={() => setShowMore(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(148,163,184,0.8)" }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Drag handle */}
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "rgba(255,255,255,0.12)" }} />

          <div className="grid grid-cols-4 gap-2 px-4 pb-6">
            {more.map((tab) => {
              const active = pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setShowMore(false)}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-150 active:scale-95"
                  style={
                    active
                      ? { background: "var(--sidebar-active-bg)", border: "1px solid rgba(99,102,241,0.3)" }
                      : { border: "1px solid rgba(255,255,255,0.05)" }
                  }
                >
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={
                      active
                        ? { background: "var(--gradient-brand)", boxShadow: "0 4px 10px rgba(99,102,241,0.4)" }
                        : { background: "rgba(255,255,255,0.06)" }
                    }
                  >
                    <tab.Icon
                      size={19}
                      strokeWidth={active ? 2.25 : 1.75}
                      color={active ? "white" : "rgba(148,163,184,0.8)"}
                    />
                  </span>
                  <span
                    className="text-[11px] font-semibold text-center leading-tight"
                    style={{ color: active ? "white" : "rgba(148,163,184,0.7)" }}
                  >
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
