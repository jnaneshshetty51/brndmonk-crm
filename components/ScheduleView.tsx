"use client";
import { useState, useRef } from "react";
import { Film, Image, Layers, Sparkles, Check, Clock } from "lucide-react";

interface Brief {
  id: string;
  briefNumber: string;
  contentType: string;
  ideaTitle: string;
  hashtags?: string | null;
  music?: string | null;
  caption?: string | null;
  scheduledPostDate?: string | null;
  postTime?: string | null;
  phase?: string | null;
  status: string;
}

const TYPE_CONFIG: Record<string, { Icon: React.ElementType; color: string; bg: string; row: string }> = {
  Reel:     { Icon: Film,     color: "#6366F1", bg: "rgba(99,102,241,0.12)",  row: "rgba(99,102,241,0.035)" },
  Post:     { Icon: Image,    color: "#06B6D4", bg: "rgba(6,182,212,0.12)",   row: "rgba(6,182,212,0.035)"  },
  Carousel: { Icon: Layers,   color: "#8B5CF6", bg: "rgba(139,92,246,0.12)", row: "rgba(139,92,246,0.035)" },
  Story:    { Icon: Sparkles, color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  row: "rgba(245,158,11,0.035)" },
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  draft:               { label: "Draft",      bg: "bg-slate-100",   text: "text-slate-600"   },
  sent_to_client:      { label: "Sent",       bg: "bg-blue-50",     text: "text-blue-600"    },
  approved:            { label: "Approved",   bg: "bg-emerald-50",  text: "text-emerald-700" },
  rejected:            { label: "Rejected",   bg: "bg-red-50",      text: "text-red-600"     },
  revision_requested:  { label: "Revision",   bg: "bg-amber-50",    text: "text-amber-700"   },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function EditableCell({
  value,
  placeholder,
  multiline,
  type,
  onSave,
  className,
}: {
  value: string;
  placeholder: string;
  multiline?: boolean;
  type?: string;
  onSave: (v: string) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onSave(draft);
  };

  if (editing) {
    const shared = {
      ref,
      value: draft,
      autoFocus: true,
      onBlur: commit,
      onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" && !multiline) { e.preventDefault(); commit(); } if (e.key === "Escape") { setDraft(value); setEditing(false); } },
      className: `w-full bg-indigo-50 border border-indigo-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 ${className ?? ""}`,
    };
    return multiline
      ? <textarea {...shared} rows={3} onChange={(e) => setDraft(e.target.value)} style={{ resize: "vertical", minWidth: 180 }} />
      : <input {...shared} type={type ?? "text"} onChange={(e) => setDraft(e.target.value)} />;
  }

  return (
    <div
      onClick={() => { setDraft(value); setEditing(true); }}
      className={`cursor-pointer rounded-lg px-2 py-1 hover:bg-indigo-50 transition-colors min-h-[28px] ${className ?? ""}`}
      title="Click to edit"
    >
      {value
        ? <span className="text-xs text-[--text-primary]">{value}</span>
        : <span className="text-xs text-[--text-tertiary] italic">{placeholder}</span>
      }
    </div>
  );
}

export default function ScheduleView({ briefs, onRefresh }: { briefs: Brief[]; onRefresh: () => void }) {
  const save = async (id: string, patch: Partial<Brief>) => {
    await fetch(`/api/briefs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    onRefresh();
  };

  // Split into scheduled and unscheduled
  const scheduled = [...briefs]
    .filter((b) => b.scheduledPostDate)
    .sort((a, b) => new Date(a.scheduledPostDate!).getTime() - new Date(b.scheduledPostDate!).getTime());
  const unscheduled = briefs.filter((b) => !b.scheduledPostDate);

  // Group scheduled by week (Mon–Sun ISO week)
  type WeekGroup = { label: string; rows: Brief[] };
  const weeks: WeekGroup[] = [];
  scheduled.forEach((b) => {
    const d = new Date(b.scheduledPostDate!);
    // Week label: "Week of Apr 7"
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const label = `Week of ${monday.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
    const existing = weeks.find((w) => w.label === label);
    if (existing) existing.rows.push(b);
    else weeks.push({ label, rows: [b] });
  });

  const TH = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
    <th className={`px-3 py-2.5 text-left text-[10px] font-bold text-[--text-tertiary] uppercase tracking-wider whitespace-nowrap ${className ?? ""}`}>
      {children}
    </th>
  );

  const renderRow = (brief: Brief) => {
    const cfg = TYPE_CONFIG[brief.contentType] ?? TYPE_CONFIG.Reel;
    const ContentIcon = cfg.Icon;
    const st = STATUS_CONFIG[brief.status] ?? STATUS_CONFIG.draft;
    const dateObj = brief.scheduledPostDate ? new Date(brief.scheduledPostDate) : null;
    const isPosted = brief.status === "approved" && !!dateObj && dateObj < new Date();

    return (
      <tr key={brief.id} style={{ background: cfg.row }} className="border-b border-[--border] hover:brightness-[0.97] transition-all group">
        {/* Posted indicator */}
        <td className="px-3 py-2.5 text-center w-8">
          {isPosted
            ? <Check size={13} className="text-emerald-500 mx-auto" strokeWidth={2.5} />
            : <Clock size={12} className="text-[--text-tertiary] mx-auto opacity-40" />
          }
        </td>

        {/* Day */}
        <td className="px-3 py-2.5 whitespace-nowrap">
          <span className="text-xs font-bold text-[--text-secondary]">
            {dateObj ? DAYS[dateObj.getDay()] : "—"}
          </span>
        </td>

        {/* Date */}
        <td className="px-2 py-1.5 whitespace-nowrap min-w-[110px]">
          <EditableCell
            type="date"
            value={brief.scheduledPostDate ? brief.scheduledPostDate.slice(0, 10) : ""}
            placeholder="Set date"
            onSave={(v) => save(brief.id, { scheduledPostDate: v || null })}
          />
        </td>

        {/* Content Type */}
        <td className="px-3 py-2.5 whitespace-nowrap">
          <span className="flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
            <ContentIcon size={10} strokeWidth={2} />
            {brief.contentType}
          </span>
        </td>

        {/* Brief # */}
        <td className="px-3 py-2.5 whitespace-nowrap">
          <span className="text-[10px] font-bold text-[--text-tertiary]">#{brief.briefNumber}</span>
        </td>

        {/* Title */}
        <td className="px-2 py-1.5 min-w-[160px] max-w-[220px]">
          <EditableCell
            value={brief.ideaTitle}
            placeholder="Title…"
            onSave={(v) => save(brief.id, { ideaTitle: v })}
            className="font-semibold"
          />
        </td>

        {/* Caption */}
        <td className="px-2 py-1.5 min-w-[220px] max-w-[320px]">
          <EditableCell
            value={brief.caption ?? ""}
            placeholder="Caption / copy…"
            multiline
            onSave={(v) => save(brief.id, { caption: v })}
          />
        </td>

        {/* Hashtags */}
        <td className="px-2 py-1.5 min-w-[160px] max-w-[200px]">
          <EditableCell
            value={brief.hashtags ?? ""}
            placeholder="#hashtags"
            onSave={(v) => save(brief.id, { hashtags: v })}
            className="text-indigo-500"
          />
        </td>

        {/* Post Time */}
        <td className="px-2 py-1.5 min-w-[90px]">
          <EditableCell
            value={brief.postTime ?? ""}
            placeholder="10:30 AM"
            onSave={(v) => save(brief.id, { postTime: v })}
          />
        </td>

        {/* Status */}
        <td className="px-3 py-2.5 whitespace-nowrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
            {st.label}
          </span>
        </td>

        {/* Audio / Music */}
        <td className="px-2 py-1.5 min-w-[120px]">
          <EditableCell
            value={brief.music ?? ""}
            placeholder="Audio / music…"
            onSave={(v) => save(brief.id, { music: v })}
          />
        </td>

        {/* Phase */}
        <td className="px-2 py-1.5 min-w-[90px]">
          <EditableCell
            value={brief.phase ?? ""}
            placeholder="Phase 1"
            onSave={(v) => save(brief.id, { phase: v })}
          />
        </td>
      </tr>
    );
  };

  const TableHeader = () => (
    <thead className="sticky top-0 z-10 bg-white" style={{ borderBottom: "2px solid var(--border)" }}>
      <tr>
        <TH className="w-8" />
        <TH>Day</TH>
        <TH>Date</TH>
        <TH>Type</TH>
        <TH>#</TH>
        <TH>Title / Concept</TH>
        <TH>Caption Essay</TH>
        <TH>Hashtags</TH>
        <TH>Post Time</TH>
        <TH>Status</TH>
        <TH>Audio / Notes</TH>
        <TH>Phase</TH>
      </tr>
    </thead>
  );

  if (briefs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[--border] p-16 text-center">
        <Film size={28} className="mx-auto text-[--text-tertiary] mb-3" strokeWidth={1.25} />
        <p className="font-semibold text-[--text-secondary] text-sm">No briefs to schedule</p>
        <p className="text-xs text-[--text-tertiary] mt-1">Add briefs first, then assign post dates here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-[--text-tertiary] font-medium">
        Click any cell to edit inline. Changes save automatically.
      </p>

      <div className="rounded-2xl border border-[--border] overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 1000 }}>
            <TableHeader />
            <tbody>
              {weeks.length > 0 ? (
                weeks.map((week) => (
                  <>
                    {/* Week header */}
                    <tr key={week.label} className="bg-slate-50">
                      <td colSpan={12} className="px-4 py-2 text-[10px] font-black text-[--text-tertiary] uppercase tracking-widest border-b border-[--border]">
                        {week.label}
                      </td>
                    </tr>
                    {week.rows.map(renderRow)}
                  </>
                ))
              ) : null}

              {unscheduled.length > 0 && (
                <>
                  <tr className="bg-slate-50">
                    <td colSpan={12} className="px-4 py-2 text-[10px] font-black text-[--text-tertiary] uppercase tracking-widest border-b border-[--border]">
                      Unscheduled — set a post date
                    </td>
                  </tr>
                  {unscheduled.map(renderRow)}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
