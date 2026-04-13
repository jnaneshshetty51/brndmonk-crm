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
  type LucideIcon,
} from "lucide-react";

const allTabs: {
  href: string;
  Icon: LucideIcon;
  label: string;
  section: string | null;
}[] = [
  { href: "/dashboard",        Icon: LayoutDashboard, label: "Home",      section: null },
  { href: "/clients",          Icon: Users,           label: "Clients",   section: "clients" },
  { href: "/calendars",        Icon: CalendarDays,    label: "Calendars", section: "calendars" },
  { href: "/shoots",           Icon: Camera,          label: "Shoots",    section: "shoots" },
  { href: "/videos",           Icon: Video,           label: "Videos",    section: "videos" },
  { href: "/projects",         Icon: FolderKanban,    label: "Projects",  section: "projects" },
  { href: "/teams",            Icon: Handshake,       label: "Team",      section: "teams" },
  { href: "/posting-calendar", Icon: Calendar,        label: "Calendar",  section: "posting_calendar" },
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
      {/* Bottom tab bar — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-t border-[--border] flex items-stretch">
        {primary.map((tab) => {
          const active =
            pathname === tab.href ||
            (tab.href !== "/dashboard" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => setShowMore(false)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${
                active
                  ? "text-[--brand-primary]"
                  : "text-[--text-tertiary]"
              }`}
            >
              <tab.Icon
                size={20}
                strokeWidth={active ? 2.25 : 1.75}
              />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
        {more.length > 0 && (
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${
              showMore ? "text-[--brand-primary]" : "text-[--text-tertiary]"
            }`}
          >
            <MoreHorizontal size={20} strokeWidth={1.75} />
            <span className="text-[10px] font-medium">More</span>
          </button>
        )}
      </nav>

      {/* More drawer */}
      {showMore && (
        <div
          className="md:hidden fixed inset-0 z-40"
          onClick={() => setShowMore(false)}
        >
          <div
            className="absolute bottom-16 left-0 right-0 bg-white border-t border-[--border] shadow-2xl rounded-t-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[--border] rounded-full mx-auto mt-3 mb-4" />
            <div className="grid grid-cols-4 gap-1 px-4 pb-6">
              {more.map((tab) => {
                const active = pathname.startsWith(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    onClick={() => setShowMore(false)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-colors ${
                      active
                        ? "bg-[--brand-primary-light] text-[--brand-primary]"
                        : "text-[--text-secondary] hover:bg-[--bg-app]"
                    }`}
                  >
                    <tab.Icon
                      size={22}
                      strokeWidth={active ? 2.25 : 1.75}
                    />
                    <span className="text-xs font-medium text-center leading-tight">
                      {tab.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
