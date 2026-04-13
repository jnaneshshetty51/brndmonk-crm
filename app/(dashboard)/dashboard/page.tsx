"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import Topbar from "@/components/Topbar";
import {
  Users,
  CalendarDays,
  XCircle,
  Video,
  FolderKanban,
  Bell,
  Camera,
  type LucideIcon,
} from "lucide-react";

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
  label,
  value,
  sub,
  href,
  Icon,
  chipBg,
  chipColor,
  valueColor,
}: {
  label: string;
  value: number;
  sub?: string;
  href?: string;
  Icon: LucideIcon;
  chipBg: string;
  chipColor: string;
  valueColor: string;
}) => {
  const card = (
    <div
      className={`bg-white rounded-2xl border border-[--border] p-5 hover:shadow-md hover:border-[--border-strong] transition-all duration-200 ${
        href ? "cursor-pointer" : ""
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${chipBg}`}
      >
        <Icon size={18} strokeWidth={1.75} className={chipColor} />
      </div>
      <p className="text-sm text-[--text-secondary] font-medium">{label}</p>
      <p className={`text-3xl font-bold mt-1 tracking-tight ${valueColor}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-[--text-tertiary] mt-1">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
};

const QuickAction = ({
  href,
  label,
  desc,
  Icon,
}: {
  href: string;
  label: string;
  desc: string;
  Icon: LucideIcon;
}) => (
  <Link
    href={href}
    className="bg-white rounded-2xl border border-[--border] p-5 hover:border-[--brand-primary]/40 hover:shadow-md transition-all duration-200 group"
  >
    <div className="w-10 h-10 rounded-xl bg-[--brand-primary-light] flex items-center justify-center mb-4 group-hover:bg-[--brand-primary] transition-colors duration-200">
      <Icon
        size={18}
        strokeWidth={1.75}
        className="text-[--brand-primary] group-hover:text-white transition-colors duration-200"
      />
    </div>
    <p className="font-semibold text-sm text-[--text-primary] group-hover:text-[--brand-primary] transition-colors">
      {label}
    </p>
    <p className="text-xs text-[--text-tertiary] mt-0.5">{desc}</p>
  </Link>
);

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
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[--border] p-5 h-32 animate-pulse"
            />
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            label="Total Clients"
            value={s?.totalClients || 0}
            sub={`${s?.activeClients} active`}
            href="/clients"
            Icon={Users}
            chipBg="bg-violet-50"
            chipColor="text-violet-600"
            valueColor="text-[--brand-primary]"
          />
          <StatCard
            label="Briefs Approved"
            value={s?.approvedBriefs || 0}
            sub={`${s?.pendingBriefs} pending`}
            href="/calendars"
            Icon={CalendarDays}
            chipBg="bg-emerald-50"
            chipColor="text-emerald-600"
            valueColor="text-[--status-success]"
          />
          <StatCard
            label="Briefs Rejected"
            value={s?.rejectedBriefs || 0}
            sub="needs revision"
            href="/calendars"
            Icon={XCircle}
            chipBg="bg-red-50"
            chipColor="text-red-500"
            valueColor="text-[--status-danger]"
          />
          <StatCard
            label="Videos for Review"
            value={s?.videosAwaitingApproval || 0}
            sub="awaiting approval"
            href="/videos"
            Icon={Video}
            chipBg="bg-amber-50"
            chipColor="text-amber-600"
            valueColor="text-[--status-warning]"
          />
          <StatCard
            label="Active Projects"
            value={s?.activeProjects || 0}
            sub="in progress"
            href="/projects"
            Icon={FolderKanban}
            chipBg="bg-cyan-50"
            chipColor="text-cyan-600"
            valueColor="text-[--brand-accent]"
          />
          <StatCard
            label="Notifications"
            value={s?.unreadNotifications || 0}
            sub="unread"
            Icon={Bell}
            chipBg="bg-rose-50"
            chipColor="text-rose-500"
            valueColor="text-rose-500"
          />
        </div>

        {/* Upcoming Shoots */}
        <div className="bg-white rounded-2xl border border-[--border]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[--border]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                <Camera size={15} strokeWidth={1.75} className="text-violet-600" />
              </div>
              <h2 className="font-semibold text-[--text-primary] text-sm">
                Upcoming Shoots
                <span className="ml-2 text-[10px] font-medium text-[--text-tertiary] normal-case">
                  Next 7 days
                </span>
              </h2>
            </div>
            <Link
              href="/shoots"
              className="text-sm text-[--brand-primary] hover:underline font-semibold"
            >
              View all →
            </Link>
          </div>
          {!data?.upcomingShoots?.length ? (
            <div className="px-6 py-12 text-center">
              <Camera
                size={32}
                className="mx-auto text-[--text-tertiary] mb-3"
                strokeWidth={1.25}
              />
              <p className="text-[--text-secondary] text-sm font-medium">
                No shoots in the next 7 days
              </p>
              <Link
                href="/shoots"
                className="mt-3 inline-block text-sm text-[--brand-primary] font-semibold hover:underline"
              >
                Schedule a shoot →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[--border]">
              {data.upcomingShoots.map((shoot) => (
                <div
                  key={shoot.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-[--bg-app] transition-colors"
                >
                  <div>
                    <p className="font-semibold text-[--text-primary] text-sm">
                      {shoot.shootName || "Unnamed Shoot"}
                    </p>
                    <p className="text-[--text-secondary] text-xs mt-0.5">
                      {shoot.client.name} · {shoot.location || "TBD"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-[--text-secondary]">
                      {formatDate(shoot.shootDate)}
                    </p>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusColor(shoot.status)}`}
                    >
                      {getStatusLabel(shoot.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <p className="text-xs font-semibold text-[--text-tertiary] uppercase tracking-widest mb-3">
            Quick Actions
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction
              href="/clients"
              label="Add Client"
              desc="Create new client"
              Icon={Users}
            />
            <QuickAction
              href="/calendars"
              label="New Calendar"
              desc="Plan content month"
              Icon={CalendarDays}
            />
            <QuickAction
              href="/shoots"
              label="Schedule Shoot"
              desc="Book a shoot"
              Icon={Camera}
            />
            <QuickAction
              href="/projects"
              label="New Project"
              desc="Start a project"
              Icon={FolderKanban}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
