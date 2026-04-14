"use client";
import { useEffect, useState, useCallback } from "react";
import Topbar from "@/components/Topbar";
import {
  Activity, User, FileText, FolderKanban, Camera,
  Video, Users, Receipt, Filter,
} from "lucide-react";

interface Log {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  entityName: string | null;
  details: string | null;
  createdAt: string;
}

const entityIcon: Record<string, React.ElementType> = {
  Client:  Users,
  Invoice: Receipt,
  Project: FolderKanban,
  Brief:   FileText,
  Video:   Video,
  Shoot:   Camera,
};

const actionColor: Record<string, { bg: string; text: string }> = {
  created:      { bg: "bg-emerald-50",  text: "text-emerald-700" },
  updated:      { bg: "bg-blue-50",     text: "text-blue-700" },
  deleted:      { bg: "bg-red-50",      text: "text-red-700" },
  approved:     { bg: "bg-emerald-50",  text: "text-emerald-700" },
  rejected:     { bg: "bg-red-50",      text: "text-red-700" },
  sent:         { bg: "bg-blue-50",     text: "text-blue-700" },
  paid:         { bg: "bg-violet-50",   text: "text-violet-700" },
};

const ENTITIES = ["Client", "Invoice", "Project", "Brief", "Video", "Shoot"];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEntity, setFilterEntity] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const url = filterEntity ? `/api/activity?entity=${filterEntity}&limit=100` : "/api/activity?limit=100";
    fetch(url).then((r) => r.json()).then((d) => { if (d.success) setLogs(d.data); }).finally(() => setLoading(false));
  }, [filterEntity]);

  useEffect(() => { load(); }, [load]);

  // Group logs by date
  const grouped = logs.reduce<Record<string, Log[]>>((acc, log) => {
    const day = new Date(log.createdAt).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    (acc[day] ??= []).push(log);
    return acc;
  }, {});

  return (
    <div>
      <Topbar title="Activity Log" />
      <div className="p-4 md:p-6 space-y-5 max-w-3xl">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[--border] rounded-xl text-sm text-[--text-secondary]">
            <Filter size={13} />
            <select value={filterEntity} onChange={(e) => setFilterEntity(e.target.value)} className="bg-transparent focus:outline-none text-sm font-medium">
              <option value="">All entities</option>
              {ENTITIES.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <span className="text-xs text-[--text-tertiary] font-medium">{logs.length} events</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[--border] p-4 h-16 animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[--border] py-16 text-center">
            <Activity size={32} className="mx-auto text-[--text-tertiary] mb-3" strokeWidth={1.25} />
            <p className="font-semibold text-[--text-secondary] text-sm">No activity yet</p>
            <p className="text-xs text-[--text-tertiary] mt-1">Actions across the CRM will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([day, dayLogs]) => (
              <div key={day}>
                <p className="text-[11px] font-bold text-[--text-tertiary] uppercase tracking-widest mb-3">{day}</p>
                <div className="bg-white rounded-2xl border border-[--border] overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
                  {dayLogs.map((log, idx) => {
                    const Icon = entityIcon[log.entity] ?? Activity;
                    const actionKey = Object.keys(actionColor).find((k) => log.action.includes(k)) ?? "updated";
                    const colors = actionColor[actionKey] ?? actionColor.updated;

                    return (
                      <div
                        key={log.id}
                        className={`flex items-start gap-4 px-5 py-4 hover:bg-[--bg-app] transition-colors ${idx > 0 ? "border-t border-[--border]" : ""}`}
                      >
                        {/* Entity icon */}
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--brand-primary-light)" }}>
                          <Icon size={15} strokeWidth={1.75} style={{ color: "var(--brand-primary)" }} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Actor */}
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ background: "var(--gradient-accent)" }}>
                                {log.userName?.charAt(0)?.toUpperCase() ?? "S"}
                              </div>
                              <span className="text-sm font-semibold text-[--text-primary]">{log.userName ?? "System"}</span>
                            </div>

                            {/* Action badge */}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                              {log.action}
                            </span>

                            {/* Entity name */}
                            <span className="text-sm text-[--text-secondary]">
                              <span className="text-[--text-tertiary]">{log.entity}</span>
                              {log.entityName && <span className="font-semibold text-[--text-primary] ml-1">{log.entityName}</span>}
                            </span>
                          </div>

                          {log.details && (
                            <p className="text-xs text-[--text-tertiary] mt-0.5">{log.details}</p>
                          )}
                        </div>

                        <span className="text-[11px] text-[--text-tertiary] shrink-0 font-medium mt-0.5">{timeAgo(log.createdAt)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
