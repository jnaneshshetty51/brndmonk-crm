"use client";
import { useState } from "react";
import { Film, Image, Layers, Sparkles, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

interface Brief {
  id: string;
  briefNumber: string;
  contentType: string;
  ideaTitle: string;
  caption?: string | null;
  hashtags?: string | null;
  postTime?: string | null;
  phase?: string | null;
  status: string;
  scheduledPostDate?: string | null;
}

const TYPE_CONFIG: Record<string, { Icon: React.ElementType; color: string; bg: string; border: string; label: string }> = {
  Reel:     { Icon: Film,     color: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE", label: "Reel"     },
  Post:     { Icon: Image,    color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC", label: "Post"     },
  Carousel: { Icon: Layers,   color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", label: "Carousel" },
  Story:    { Icon: Sparkles, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", label: "Story"    },
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function BriefPill({ brief, onClick }: { brief: Brief; onClick: () => void }) {
  const cfg = TYPE_CONFIG[brief.contentType] ?? TYPE_CONFIG.Reel;
  const Icon = cfg.Icon;
  const isApproved = brief.status === "approved";
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold truncate transition-all hover:brightness-95 active:scale-[0.98]"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      {isApproved
        ? <CheckCircle2 size={9} strokeWidth={2.5} className="shrink-0" />
        : <Icon size={9} strokeWidth={2} className="shrink-0" />
      }
      <span className="truncate">{brief.ideaTitle}</span>
    </button>
  );
}

function DetailPanel({ brief, onClose }: { brief: Brief; onClose: () => void }) {
  const cfg = TYPE_CONFIG[brief.contentType] ?? TYPE_CONFIG.Reel;
  const Icon = cfg.Icon;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header band */}
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}99)` }} />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <Icon size={16} strokeWidth={1.75} style={{ color: cfg.color }} />
              </div>
              <div>
                <p className="font-black text-[--text-primary] text-sm leading-tight">{brief.ideaTitle}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
                    {brief.contentType}
                  </span>
                  <span className="text-[10px] text-[--text-tertiary] font-bold">#{brief.briefNumber}</span>
                  {brief.phase && (
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{brief.phase}</span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-[--text-tertiary] hover:text-[--text-primary] text-lg font-bold leading-none w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[--bg-app] transition-colors">×</button>
          </div>

          <div className="space-y-3 text-sm">
            {brief.postTime && (
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-[--text-tertiary] w-20 shrink-0">Post Time</span>
                <span className="font-semibold text-[--text-primary]">{brief.postTime}</span>
              </div>
            )}
            {brief.scheduledPostDate && (
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-[--text-tertiary] w-20 shrink-0">Date</span>
                <span className="font-semibold text-[--text-primary]">
                  {new Date(brief.scheduledPostDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            )}
            {brief.caption && (
              <div>
                <p className="text-xs font-bold text-[--text-tertiary] mb-1.5">Caption</p>
                <p className="text-xs text-[--text-secondary] leading-relaxed whitespace-pre-wrap bg-[--bg-app] rounded-xl px-3 py-2.5 border border-[--border] max-h-32 overflow-y-auto">
                  {brief.caption}
                </p>
              </div>
            )}
            {brief.hashtags && (
              <div>
                <p className="text-xs font-bold text-[--text-tertiary] mb-1">Hashtags</p>
                <p className="text-xs text-indigo-600 font-medium leading-relaxed">{brief.hashtags}</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-[--border]">
            <a href={`/briefs/${brief.id}`} className="text-xs font-bold text-indigo-600 hover:underline">
              Open full brief →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalendarGridView({
  briefs,
  month,
  year,
}: {
  briefs: Brief[];
  month: string;   // e.g. "April"
  year: number;
}) {
  const monthIndex = MONTHS.indexOf(month);
  const [viewYear, setViewYear] = useState(year);
  const [viewMonth, setViewMonth] = useState(monthIndex >= 0 ? monthIndex : new Date().getMonth());
  const [selected, setSelected] = useState<Brief | null>(null);

  const firstDay = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startOffset = firstDay.getDay(); // 0=Sun

  // Map scheduledPostDate → briefs for this month
  const byDay: Record<number, Brief[]> = {};
  briefs.forEach((b) => {
    if (!b.scheduledPostDate) return;
    const d = new Date(b.scheduledPostDate);
    if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
      (byDay[d.getDate()] ??= []).push(b);
    }
  });

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  // Total cells in grid (padded to 6 rows max)
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  // Count scheduled posts
  const scheduledCount = briefs.filter((b) => {
    if (!b.scheduledPostDate) return false;
    const d = new Date(b.scheduledPostDate);
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
  }).length;

  return (
    <div className="space-y-4">
      {/* Legend + nav */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Month nav */}
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-xl border border-[--border] hover:bg-[--bg-app] transition-colors text-[--text-secondary]">
            <ChevronLeft size={15} />
          </button>
          <span className="font-black text-[--text-primary] text-base min-w-[140px] text-center">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-xl border border-[--border] hover:bg-[--bg-app] transition-colors text-[--text-secondary]">
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 flex-wrap">
          {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
            const Icon = cfg.Icon;
            return (
              <span key={type} className="flex items-center gap-1 text-[11px] font-bold" style={{ color: cfg.color }}>
                <Icon size={11} strokeWidth={2} />
                {cfg.label}
              </span>
            );
          })}
          <span className="text-[11px] text-[--text-tertiary] font-medium ml-2">{scheduledCount} scheduled</span>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-2xl border border-[--border] overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[--border]" style={{ background: "var(--bg-app)" }}>
          {DAYS_SHORT.map((d) => (
            <div key={d} className="py-2.5 text-center text-[10px] font-black text-[--text-tertiary] uppercase tracking-widest">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7" style={{ minHeight: 480 }}>
          {Array.from({ length: totalCells }).map((_, i) => {
            const day = i - startOffset + 1;
            const isValid = day >= 1 && day <= daysInMonth;
            const dayBriefs = isValid ? (byDay[day] ?? []) : [];
            const isTodayCell = isValid && isToday(day);
            const hasContent = dayBriefs.length > 0;

            return (
              <div
                key={i}
                className={`min-h-[100px] p-1.5 border-b border-r border-[--border] last:border-r-0 ${
                  !isValid ? "bg-slate-50/60" : hasContent ? "" : ""
                } ${i % 7 === 6 ? "border-r-0" : ""}`}
                style={isTodayCell ? { background: "rgba(99,102,241,0.04)" } : undefined}
              >
                {isValid && (
                  <>
                    {/* Day number */}
                    <div className="flex items-center justify-end mb-1">
                      <span
                        className={`text-xs font-bold flex items-center justify-center w-6 h-6 rounded-full ${
                          isTodayCell
                            ? "bg-indigo-600 text-white"
                            : "text-[--text-secondary]"
                        }`}
                      >
                        {day}
                      </span>
                    </div>

                    {/* Content pills */}
                    <div className="space-y-0.5">
                      {dayBriefs.slice(0, 3).map((b) => (
                        <BriefPill key={b.id} brief={b} onClick={() => setSelected(b)} />
                      ))}
                      {dayBriefs.length > 3 && (
                        <button
                          className="w-full text-[10px] font-bold text-[--text-tertiary] hover:text-indigo-600 px-1.5 py-0.5 text-left transition-colors"
                          onClick={() => setSelected(dayBriefs[3])}
                        >
                          +{dayBriefs.length - 3} more
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Unscheduled strip */}
      {briefs.filter((b) => !b.scheduledPostDate).length > 0 && (
        <div className="bg-white rounded-2xl border border-[--border] p-4" style={{ boxShadow: "var(--shadow-card)" }}>
          <p className="text-[10px] font-black text-[--text-tertiary] uppercase tracking-widest mb-3">
            Unscheduled — {briefs.filter((b) => !b.scheduledPostDate).length} briefs without a post date
          </p>
          <div className="flex flex-wrap gap-2">
            {briefs.filter((b) => !b.scheduledPostDate).map((b) => (
              <BriefPill key={b.id} brief={b} onClick={() => setSelected(b)} />
            ))}
          </div>
        </div>
      )}

      {selected && <DetailPanel brief={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
