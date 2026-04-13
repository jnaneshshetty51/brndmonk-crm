"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const allTabs = [
  { href: "/dashboard",        icon: "⊞", label: "Home",       section: null },
  { href: "/clients",          icon: "👥", label: "Clients",    section: "clients" },
  { href: "/calendars",        icon: "📅", label: "Calendars",  section: "calendars" },
  { href: "/shoots",           icon: "🎬", label: "Shoots",     section: "shoots" },
  { href: "/videos",           icon: "🎥", label: "Videos",     section: "videos" },
  { href: "/projects",         icon: "💻", label: "Projects",   section: "projects" },
  { href: "/teams",            icon: "🤝", label: "Team",       section: "teams" },
  { href: "/posting-calendar", icon: "🗓️", label: "Calendar",   section: "posting_calendar" },
  { href: "/notifications",    icon: "🔔", label: "Notifs",     section: "notifications" },
  { href: "/settings",         icon: "⚙️", label: "Settings",   section: "settings" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { can } = useAuth();
  const [showMore, setShowMore] = useState(false);

  const visible = allTabs.filter(t => !t.section || can(t.section, "view"));
  const primary = visible.slice(0, 4);
  const more = visible.slice(4);

  return (
    <>
      {/* Bottom tab bar — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5E7EB] flex items-stretch">
        {primary.map((tab) => {
          const active = pathname === tab.href || (tab.href !== "/dashboard" && pathname.startsWith(tab.href));
          return (
            <Link key={tab.href} href={tab.href} onClick={() => setShowMore(false)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${
                active ? "text-[#6B5B95]" : "text-[#9CA3AF]"
              }`}>
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
        {more.length > 0 && (
          <button onClick={() => setShowMore(!showMore)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${showMore ? "text-[#6B5B95]" : "text-[#9CA3AF]"}`}>
            <span className="text-xl leading-none">•••</span>
            <span className="text-[10px] font-medium">More</span>
          </button>
        )}
      </nav>

      {/* More drawer */}
      {showMore && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-16 left-0 right-0 bg-white border-t border-[#E5E7EB] shadow-xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-4 gap-0 p-4">
              {more.map((tab) => {
                const active = pathname.startsWith(tab.href);
                return (
                  <Link key={tab.href} href={tab.href} onClick={() => setShowMore(false)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors ${
                      active ? "bg-[#6B5B95]/10 text-[#6B5B95]" : "text-[#6B7280] hover:bg-gray-50"
                    }`}>
                    <span className="text-2xl">{tab.icon}</span>
                    <span className="text-xs font-medium text-center leading-tight">{tab.label}</span>
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
