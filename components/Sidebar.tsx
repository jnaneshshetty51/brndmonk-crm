"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/clients", label: "Clients", icon: "👥" },
  { href: "/calendars", label: "Calendars", icon: "📅" },
  { href: "/shoots", label: "Shoots", icon: "🎬" },
  { href: "/videos", label: "Videos", icon: "🎥" },
  { href: "/projects", label: "Projects", icon: "💻" },
  { href: "/teams", label: "Team", icon: "🤝" },
];

const bottomNavItems = [
  { href: "/posting-calendar", label: "Posting Calendar", icon: "🗓️" },
  { href: "/notifications", label: "Notifications", icon: "🔔" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-[#E5E7EB] flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#6B5B95] flex items-center justify-center text-white font-bold text-sm">B</div>
          <span className="font-bold text-[#2D3142] text-base">Brndmonk CRM</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-[#6B5B95]/10 text-[#6B5B95]"
                  : "text-[#6B7280] hover:bg-gray-50 hover:text-[#2D3142]"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        <div className="pt-2 mt-2 border-t border-[#F3F4F6]">
          {bottomNavItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-[#6B5B95]/10 text-[#6B5B95]"
                    : "text-[#6B7280] hover:bg-gray-50 hover:text-[#2D3142]"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-[#E5E7EB] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#6B5B95]/20 flex items-center justify-center text-[#6B5B95] font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#2D3142] truncate">{user?.name}</p>
            <p className="text-xs text-[#9CA3AF] truncate capitalize">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="text-[#9CA3AF] hover:text-red-500 transition-colors text-xs"
            title="Logout"
          >
            ⎋
          </button>
        </div>
      </div>
    </aside>
  );
}
