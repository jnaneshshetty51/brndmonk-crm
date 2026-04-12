"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import Topbar from "@/components/Topbar";

interface DashboardData {
  stats: {
    totalClients: number;
    activeClients: number;
    totalBriefs: number;
    approvedBriefs: number;
    pendingBriefs: number;
    rejectedBriefs: number;
    videosAwaitingApproval: number;
    activeProjects: number;
    unreadNotifications: number;
  };
  upcomingShoots: Array<{
    id: string;
    shootName?: string;
    shootDate: string;
    location?: string;
    status: string;
    client: { id: string; name: string };
  }>;
}

const StatCard = ({
  label, value, sub, color, href,
}: {
  label: string; value: number; sub?: string; color: string; href?: string;
}) => {
  const card = (
    <div className={`bg-white rounded-xl border border-[#E5E7EB] p-5 hover:shadow-md transition-shadow ${href ? "cursor-pointer" : ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#6B7280] font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-[#9CA3AF] mt-1">{sub}</p>}
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <Topbar title="Dashboard" />
        <div className="p-6 grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-5 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const s = data?.stats;

  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Clients" value={s?.totalClients || 0} sub={`${s?.activeClients} active`} color="text-[#6B5B95]" href="/dashboard/clients" />
          <StatCard label="Briefs Approved" value={s?.approvedBriefs || 0} sub={`${s?.pendingBriefs} pending`} color="text-green-600" href="/dashboard/calendars" />
          <StatCard label="Briefs Rejected" value={s?.rejectedBriefs || 0} sub="needs revision" color="text-red-500" href="/dashboard/calendars" />
          <StatCard label="Videos for Review" value={s?.videosAwaitingApproval || 0} sub="awaiting approval" color="text-[#D4A574]" href="/dashboard/videos" />
          <StatCard label="Active Projects" value={s?.activeProjects || 0} sub="in progress" color="text-[#5DCCC4]" href="/dashboard/projects" />
          <StatCard label="Notifications" value={s?.unreadNotifications || 0} sub="unread" color="text-[#D4A5A5]" />
        </div>

        {/* Upcoming Shoots */}
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
            <h2 className="font-semibold text-[#2D3142]">Upcoming Shoots (Next 7 Days)</h2>
            <Link href="/dashboard/shoots" className="text-sm text-[#6B5B95] hover:underline font-medium">
              View all →
            </Link>
          </div>
          {!data?.upcomingShoots?.length ? (
            <div className="px-6 py-8 text-center">
              <p className="text-[#9CA3AF] text-sm">No shoots scheduled in the next 7 days</p>
              <Link
                href="/dashboard/shoots"
                className="mt-3 inline-block text-sm text-[#6B5B95] font-medium hover:underline"
              >
                Schedule a shoot →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#F3F4F6]">
              {data.upcomingShoots.map((shoot) => (
                <div key={shoot.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#2D3142] text-sm">
                      {shoot.shootName || "Unnamed Shoot"}
                    </p>
                    <p className="text-[#6B7280] text-xs mt-0.5">
                      {shoot.client.name} · {shoot.location || "TBD"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-[#6B7280]">{formatDate(shoot.shootDate)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(shoot.status)}`}>
                      {getStatusLabel(shoot.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: "/dashboard/clients", label: "Add Client", icon: "👥", desc: "Create new client" },
            { href: "/dashboard/calendars", label: "New Calendar", icon: "📅", desc: "Plan content month" },
            { href: "/dashboard/shoots", label: "Schedule Shoot", icon: "🎬", desc: "Book a shoot" },
            { href: "/dashboard/projects", label: "New Project", icon: "💻", desc: "Start a project" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-xl border border-[#E5E7EB] p-5 hover:border-[#6B5B95]/40 hover:shadow-md transition-all group"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="font-semibold text-sm text-[#2D3142] group-hover:text-[#6B5B95] transition-colors">
                {item.label}
              </p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
