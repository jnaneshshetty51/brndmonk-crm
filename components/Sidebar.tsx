"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  LogOut,
  Zap,
  Search,
  Receipt,
  Activity,
  type LucideIcon,
} from "lucide-react";

const mainNav: { href: string; label: string; Icon: LucideIcon; section: string | null }[] = [
  { href: "/dashboard",  label: "Dashboard",  Icon: LayoutDashboard, section: null },
  { href: "/clients",    label: "Clients",    Icon: Users,            section: "clients" },
  { href: "/calendars",  label: "Calendars",  Icon: CalendarDays,     section: "calendars" },
  { href: "/shoots",     label: "Shoots",     Icon: Camera,           section: "shoots" },
  { href: "/videos",     label: "Videos",     Icon: Video,            section: "videos" },
  { href: "/projects",   label: "Projects",   Icon: FolderKanban,     section: "projects" },
  { href: "/teams",      label: "Team",       Icon: Handshake,        section: "teams" },
  { href: "/invoices",   label: "Invoices",   Icon: Receipt,          section: null },
];

const bottomNav: { href: string; label: string; Icon: LucideIcon; section: string | null }[] = [
  { href: "/posting-calendar", label: "Posting Calendar", Icon: Calendar,  section: "posting_calendar" },
  { href: "/activity",         label: "Activity Log",     Icon: Activity,  section: null },
  { href: "/notifications",    label: "Notifications",    Icon: Bell,      section: "notifications" },
  { href: "/settings",         label: "Settings",         Icon: Settings,  section: "settings" },
];

export default function Sidebar({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const pathname = usePathname();
  const { user, can, logout } = useAuth();

  const isVisible = (section: string | null) => {
    if (!section) return true;
    return can(section, "view");
  };

  const NavLink = ({ href, Icon, label }: { href: string; Icon: LucideIcon; label: string }) => {
    const active =
      pathname === href ||
      (href !== "/dashboard" && pathname.startsWith(href));

    return (
      <Link
        href={href}
        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          active
            ? "bg-[#161C2D] text-white border border-[#2B354E]"
            : "text-[#94A3B8] hover:bg-white/5 hover:text-white border border-transparent"
        }`}
      >
        {/* Active left glow bar */}
        {active && (
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full"
            style={{ background: "var(--gradient-brand)" }}
          />
        )}

        {/* Icon wrapper */}
        <span
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
            active
              ? "text-white"
              : "text-[--sidebar-text] group-hover:text-[--sidebar-text-hover]"
          }`}
          style={
            active
              ? { background: "var(--gradient-brand)", boxShadow: "0 4px 12px rgba(99,102,241,0.4)" }
              : {}
          }
        >
          <Icon size={14} strokeWidth={active ? 2.25 : 1.75} />
        </span>

        <span className="leading-none">{label}</span>
      </Link>
    );
  };

  const initials = user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      className="w-60 min-h-screen flex flex-col fixed left-0 top-0 z-40 hidden md:flex"
      style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg shrink-0"
            style={{ background: "var(--gradient-brand)", boxShadow: "0 4px 14px rgba(99,102,241,0.5)" }}
          >
            B
          </div>
          <div>
            <span className="font-bold text-white text-sm leading-tight block tracking-tight">
              Brndmonk
            </span>
            <span
              className="text-[10px] font-semibold tracking-[0.12em] uppercase"
              style={{ color: "var(--brand-primary)" }}
            >
              CRM Studio
            </span>
          </div>
        </div>
      </div>

      {/* Search trigger */}
      <div className="px-3 py-3" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 hover:bg-white/5"
          style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(148,163,184,0.7)" }}
        >
          <Search size={13} strokeWidth={2} />
          <span className="flex-1 text-left text-xs">Search…</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(148,163,184,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>⌘K</kbd>
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.14em] px-3 mb-3"
          style={{ color: "rgba(148,163,184,0.5)" }}
        >
          Main Menu
        </p>
        {mainNav
          .filter((item) => isVisible(item.section))
          .map((item) => (
            <NavLink key={item.href} href={item.href} Icon={item.Icon} label={item.label} />
          ))}

        <div
          className="pt-4 mt-4 space-y-0.5"
          style={{ borderTop: "1px solid var(--sidebar-border)" }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-[0.14em] px-3 mb-3"
            style={{ color: "rgba(148,163,184,0.5)" }}
          >
            Tools
          </p>
          {bottomNav
            .filter((item) => isVisible(item.section))
            .map((item) => (
              <NavLink key={item.href} href={item.href} Icon={item.Icon} label={item.label} />
            ))}
        </div>
      </nav>

      {/* Upgrade nudge */}
      <div className="mx-3 mb-3 rounded-xl p-3.5" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
        <div className="flex items-center gap-2 mb-1.5">
          <Zap size={12} className="text-indigo-400" strokeWidth={2.5} />
          <span className="text-xs font-semibold text-indigo-300">Pro Plan Active</span>
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: "rgba(148,163,184,0.75)" }}>
          All features unlocked. Agency mode enabled.
        </p>
      </div>

      {/* User */}
      <div className="px-3 py-3" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 hover:bg-white/5"
        >
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
            style={{ background: "var(--gradient-accent)", boxShadow: "0 2px 8px rgba(6,182,212,0.4)" }}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {user?.name}
            </p>
            <p className="text-[11px] truncate capitalize" style={{ color: "var(--sidebar-text)" }}>
              {user?.role?.replace(/_/g, " ")}
            </p>
          </div>

          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 rounded-lg transition-all duration-150 hover:bg-red-500/15"
            style={{ color: "rgba(148,163,184,0.6)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(148,163,184,0.6)")}
          >
            <LogOut size={13} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
  );
}
