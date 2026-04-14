"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import Topbar from "@/components/Topbar";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  CalendarDays,
  XCircle,
  Video,
  FolderKanban,
  Bell,
  Camera,
  ArrowUpRight,
  ArrowRight,
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

/* ── Stat Card ─────────────────────────────────────────────── */
const StatCard = ({
  label,
  value,
  sub,
  href,
  Icon,
  gradient,
  lightBg,
  iconColor,
}: {
  label: string;
  value: number;
  sub?: string;
  href?: string;
  Icon: LucideIcon;
  gradient: string;
  lightBg: string;
  iconColor: string;
}) => {
  const inner = (
    <div
      className="relative bg-white rounded-2xl p-5 overflow-hidden card-hover cursor-pointer group"
      style={{
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Subtle top gradient accent */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: gradient }}
      />

      <div className="flex items-start justify-between mb-4">
        {/* Icon badge */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
          style={{ background: lightBg }}
        >
          <Icon size={17} strokeWidth={1.75} style={{ color: iconColor }} />
        </div>

        {/* Arrow */}
        {href && (
          <ArrowUpRight
            size={15}
            strokeWidth={2}
            className="text-[--text-tertiary] opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        )}
      </div>

      <p className="text-xs font-semibold text-[--text-tertiary] uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className="text-3xl font-black tracking-tight leading-none"
        style={{ color: iconColor }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs text-[--text-tertiary] mt-2 font-medium">{sub}</p>
      )}
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
};

/* ── Quick Action Card ─────────────────────────────────────── */
const QuickAction = ({
  href,
  label,
  desc,
  Icon,
  gradient,
}: {
  href: string;
  label: string;
  desc: string;
  Icon: LucideIcon;
  gradient: string;
}) => (
  <Link
    href={href}
    className="group relative bg-white rounded-2xl p-5 overflow-hidden card-hover flex flex-col gap-3"
    style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
  >
    {/* Background gradient on hover */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300 rounded-2xl"
      style={{ background: gradient }}
    />

    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white transition-all duration-300 group-hover:scale-110"
      style={{ background: gradient, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
    >
      <Icon size={17} strokeWidth={1.75} />
    </div>

    <div>
      <p className="font-bold text-sm text-[--text-primary] group-hover:text-[--brand-primary] transition-colors leading-tight">
        {label}
      </p>
      <p className="text-xs text-[--text-tertiary] mt-0.5">{desc}</p>
    </div>

    <ArrowRight
      size={13}
      strokeWidth={2}
      className="absolute bottom-4 right-4 text-[--text-tertiary] opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1"
    />
  </Link>
);

/* ── Skeleton ──────────────────────────────────────────────── */
const Skeleton = () => (
  <div>
    <Topbar title="Dashboard" />
    <div className="p-6 space-y-6">
      {/* Hero skeleton */}
      <div className="h-28 rounded-2xl animate-pulse" style={{ background: "var(--border)" }} />
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[--border] p-5 h-[132px] animate-pulse" />
        ))}
      </div>
    </div>
  </div>
);

/* ── Page ──────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;

  const s = data?.stats;
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="p-4 md:p-6 space-y-6">

        {/* ── Welcome Banner ────────────────────────────── */}
        <div
          className="relative rounded-2xl px-6 py-5 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #1E293B 100%)",
            boxShadow: "0 8px 32px rgba(99,102,241,0.25)",
          }}
        >
          {/* Glow blobs */}
          <div
            className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: "var(--brand-primary)" }}
          />
          <div
            className="absolute -bottom-8 left-24 w-40 h-40 rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{ background: "var(--brand-accent)" }}
          />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">
                Good day
              </p>
              <h2 className="text-white text-xl md:text-2xl font-black tracking-tight">
                Welcome back, {firstName} 👋
              </h2>
              <p className="text-white/50 text-sm mt-1.5">
                {s?.activeClients ?? 0} active clients · {s?.pendingBriefs ?? 0} briefs pending review
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/briefs"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:opacity-90 active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  backdropFilter: "blur(8px)",
                }}
              >
                View Briefs
                <ArrowRight size={13} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ────────────────────────────────── */}
        <div>
          <p className="text-[11px] font-bold text-[--text-tertiary] uppercase tracking-widest mb-3">
            Overview
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            <StatCard
              label="Total Clients"
              value={s?.totalClients ?? 0}
              sub={`${s?.activeClients ?? 0} active`}
              href="/clients"
              Icon={Users}
              gradient="var(--gradient-brand)"
              lightBg="#EEF2FF"
              iconColor="#6366F1"
            />
            <StatCard
              label="Briefs Approved"
              value={s?.approvedBriefs ?? 0}
              sub={`${s?.pendingBriefs ?? 0} pending`}
              href="/calendars"
              Icon={CalendarDays}
              gradient="var(--gradient-success)"
              lightBg="#ECFDF5"
              iconColor="#10B981"
            />
            <StatCard
              label="Briefs Rejected"
              value={s?.rejectedBriefs ?? 0}
              sub="needs revision"
              href="/calendars"
              Icon={XCircle}
              gradient="var(--gradient-danger)"
              lightBg="#FEF2F2"
              iconColor="#EF4444"
            />
            <StatCard
              label="Videos for Review"
              value={s?.videosAwaitingApproval ?? 0}
              sub="awaiting approval"
              href="/videos"
              Icon={Video}
              gradient="var(--gradient-warning)"
              lightBg="#FFFBEB"
              iconColor="#F59E0B"
            />
            <StatCard
              label="Active Projects"
              value={s?.activeProjects ?? 0}
              sub="in progress"
              href="/projects"
              Icon={FolderKanban}
              gradient="var(--gradient-accent)"
              lightBg="#ECFEFF"
              iconColor="#06B6D4"
            />
            <StatCard
              label="Notifications"
              value={s?.unreadNotifications ?? 0}
              sub="unread"
              Icon={Bell}
              gradient="var(--gradient-rose)"
              lightBg="#FFF1F2"
              iconColor="#F43F5E"
            />
          </div>
        </div>

        {/* ── Two-column section ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Upcoming Shoots — takes 2 cols */}
          <div
            className="lg:col-span-2 bg-white rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[--border]">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ background: "var(--gradient-brand)", boxShadow: "0 4px 10px rgba(99,102,241,0.35)" }}
                >
                  <Camera size={14} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="font-bold text-[--text-primary] text-sm leading-tight">
                    Upcoming Shoots
                  </h2>
                  <p className="text-[11px] text-[--text-tertiary]">Next 7 days</p>
                </div>
              </div>
              <Link
                href="/shoots"
                className="flex items-center gap-1 text-xs font-bold transition-colors hover:opacity-70"
                style={{ color: "var(--brand-primary)" }}
              >
                View all <ArrowRight size={12} strokeWidth={2.5} />
              </Link>
            </div>

            {!data?.upcomingShoots?.length ? (
              <div className="px-5 py-14 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "var(--bg-app)" }}
                >
                  <Camera size={24} className="text-[--text-tertiary]" strokeWidth={1.25} />
                </div>
                <p className="text-[--text-secondary] text-sm font-semibold">No shoots in the next 7 days</p>
                <p className="text-[--text-tertiary] text-xs mt-1 mb-4">Schedule your first shoot to see it here.</p>
                <Link
                  href="/shoots"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:opacity-90"
                  style={{ background: "var(--gradient-brand)", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}
                >
                  Schedule a shoot <ArrowRight size={13} strokeWidth={2.5} />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[--border]">
                {data.upcomingShoots.map((shoot) => (
                  <div
                    key={shoot.id}
                    className="px-5 py-4 flex items-center justify-between hover:bg-[--bg-app] transition-colors duration-150 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: "var(--gradient-brand)" }}
                      >
                        {shoot.client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[--text-primary] text-sm truncate">
                          {shoot.shootName || "Unnamed Shoot"}
                        </p>
                        <p className="text-[--text-tertiary] text-xs mt-0.5 truncate">
                          {shoot.client.name}
                          {shoot.location ? ` · ${shoot.location}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <p className="text-xs text-[--text-secondary] font-medium hidden sm:block">
                        {formatDate(shoot.shootDate)}
                      </p>
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${getStatusColor(shoot.status)}`}>
                        {getStatusLabel(shoot.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions — 1 col */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-bold text-[--text-tertiary] uppercase tracking-widest">
              Quick Actions
            </p>
            <QuickAction
              href="/clients"
              label="Add Client"
              desc="Create a new client record"
              Icon={Users}
              gradient="var(--gradient-brand)"
            />
            <QuickAction
              href="/calendars"
              label="New Calendar"
              desc="Plan a content month"
              Icon={CalendarDays}
              gradient="var(--gradient-success)"
            />
            <QuickAction
              href="/shoots"
              label="Schedule Shoot"
              desc="Book a video shoot"
              Icon={Camera}
              gradient="var(--gradient-warning)"
            />
            <QuickAction
              href="/projects"
              label="New Project"
              desc="Start a dev project"
              Icon={FolderKanban}
              gradient="var(--gradient-accent)"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
