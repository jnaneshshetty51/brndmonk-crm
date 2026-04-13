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
];

const bottomNav: { href: string; label: string; Icon: LucideIcon; section: string | null }[] = [
  { href: "/posting-calendar", label: "Posting Calendar", Icon: Calendar, section: "posting_calendar" },
  { href: "/notifications",    label: "Notifications",    Icon: Bell,     section: "notifications" },
  { href: "/settings",         label: "Settings",         Icon: Settings, section: "settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, can, logout } = useAuth();

  const isVisible = (section: string | null) => {
    if (!section) return true;
    return can(section, "view");
  };

  const NavLink = ({
    href,
    Icon,
    label,
  }: {
    href: string;
    Icon: LucideIcon;
    label: string;
  }) => {
    const active =
      pathname === href ||
      (href !== "/dashboard" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
          active
            ? "bg-[--brand-primary-light] text-[--brand-primary]"
            : "text-[--text-secondary] hover:bg-white hover:text-[--text-primary]"
        }`}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-[--brand-primary]" />
        )}
        <Icon
          size={16}
          strokeWidth={active ? 2.25 : 1.75}
          className="shrink-0"
        />
        {label}
      </Link>
    );
  };

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-[--border] flex flex-col fixed left-0 top-0 z-40 hidden md:flex">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[--border]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[--brand-primary] flex items-center justify-center text-white font-bold text-sm shadow-sm">
            B
          </div>
          <div>
            <span className="font-bold text-[--text-primary] text-sm leading-tight block">
              Brndmonk
            </span>
            <span className="text-[10px] text-[--text-tertiary] font-medium tracking-wide uppercase">
              CRM
            </span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-[--text-tertiary] uppercase tracking-widest px-3 mb-2">
          Menu
        </p>
        {mainNav
          .filter((item) => isVisible(item.section))
          .map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              Icon={item.Icon}
              label={item.label}
            />
          ))}

        <div className="pt-3 mt-3 border-t border-[--border] space-y-0.5">
          <p className="text-[10px] font-semibold text-[--text-tertiary] uppercase tracking-widest px-3 mb-2">
            Tools
          </p>
          {bottomNav
            .filter((item) => isVisible(item.section))
            .map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                Icon={item.Icon}
                label={item.label}
              />
            ))}
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-[--border] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[--brand-primary-light] flex items-center justify-center text-[--brand-primary] font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[--text-primary] truncate">
              {user?.name}
            </p>
            <p className="text-xs text-[--text-tertiary] truncate capitalize">
              {user?.role?.replace(/_/g, " ")}
            </p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="text-[--text-tertiary] hover:text-[--status-danger] transition-colors p-1 rounded-lg hover:bg-red-50"
          >
            <LogOut size={14} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
  );
}
