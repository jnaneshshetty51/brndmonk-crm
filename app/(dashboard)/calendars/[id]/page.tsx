"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { formatDate } from "@/lib/utils";
import {
  Film, Image as ImageIcon, Layers, Sparkles, Plus, X,
  Check, ArrowLeft, Mail, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, RotateCcw, Trash2, Link2,
  CalendarDays, Clock, Music2, Hash, FileText,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────── */
interface Brief {
  id: string;
  briefNumber: string;
  contentType: string;
  ideaTitle: string;
  ideaDescription: string;
  visualDescription: string;
  script: string;
  music?: string | null;
  hashtags?: string | null;
  cta?: string | null;
  caption?: string | null;
  driveLink?: string | null;
  scheduledPostDate?: string | null;
  postTime?: string | null;
  phase?: string | null;
  status: string;
  clientFeedback?: string | null;
  approvalDeadline?: string | null;
  approvedAt?: string | null;
  currentVersion: number;
}

interface CalendarData {
  id: string;
  month: string;
  year: number;
  status: string;
  totalReels: number;
  totalPosts: number;
  totalCarousels: number;
  notes?: string | null;
  sentToClientAt?: string | null;
  client: { id: string; name: string; email: string };
  briefs: Brief[];
}

/* ─── Constants ──────────────────────────────────────────── */
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const CONTENT_TYPES = ["Reel","Post","Carousel","Story"];

const TYPE = {
  Reel:     { Icon: Film,       color: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE" },
  Post:     { Icon: ImageIcon,  color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
  Carousel: { Icon: Layers,     color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  Story:    { Icon: Sparkles,   color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
} as Record<string, { Icon: React.ElementType; color: string; bg: string; border: string }>;

const STATUS = {
  draft:              { label: "Draft",          bg: "bg-slate-100",   text: "text-slate-600",   dot: "#94A3B8" },
  sent_to_client:     { label: "Pending Review", bg: "bg-blue-50",     text: "text-blue-600",    dot: "#3B82F6" },
  approved:           { label: "Approved",       bg: "bg-emerald-50",  text: "text-emerald-700", dot: "#10B981" },
  rejected:           { label: "Rejected",       bg: "bg-red-50",      text: "text-red-600",     dot: "#EF4444" },
  revision_requested: { label: "Needs Changes",  bg: "bg-amber-50",    text: "text-amber-700",   dot: "#F59E0B" },
} as Record<string, { label: string; bg: string; text: string; dot: string }>;

const inputCls = "w-full px-3 py-2.5 border border-[--border] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white";
const labelCls = "block text-xs font-semibold text-[--text-secondary] mb-1.5";

/* ─── Add / Edit Brief Modal ─────────────────────────────── */
function BriefModal({ calendarId, brief, defaultDate, onClose, onSave }: {
  calendarId: string;
  brief?: Brief | null;
  defaultDate?: string;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    contentType: brief?.contentType || "Reel",
    ideaTitle: brief?.ideaTitle || "",
    ideaDescription: brief?.ideaDescription || "",
    visualDescription: brief?.visualDescription || "",
    script: brief?.script || "",
    caption: brief?.caption || "",
    hashtags: brief?.hashtags || "",
    music: brief?.music || "",
    cta: brief?.cta || "",
    driveLink: brief?.driveLink || "",
    scheduledPostDate: brief?.scheduledPostDate?.slice(0,10) || defaultDate || "",
    postTime: brief?.postTime || "",
    phase: brief?.phase || "",
    briefNumber: brief?.briefNumber || "",
  });
  const [saving, setSaving] = useState(false);
  const cfg = TYPE[form.contentType] || TYPE.Reel;
  const Icon = cfg.Icon;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = brief ? `/api/briefs/${brief.id}` : "/api/briefs";
    const res = await fetch(url, {
      method: brief ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, calendarId }),
    });
    if (res.ok) { onSave(); onClose(); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-4 overflow-hidden">
        {/* Header */}
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)` }} />
        <div className="flex items-center justify-between px-6 py-4 border-b border-[--border]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              <Icon size={16} style={{ color: cfg.color }} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="font-black text-[--text-primary] text-sm">{brief ? "Edit Content" : "Add New Content"}</h2>
              <p className="text-[10px] text-[--text-tertiary]">Fill in as much as you have — save and update anytime</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[--bg-app] text-[--text-tertiary] transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={save} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Row 1: type, date, time, phase */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className={labelCls}>Type *</label>
              <select value={form.contentType} onChange={e => setForm({...form, contentType: e.target.value})} className={inputCls}>
                {CONTENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Post Date</label>
              <input type="date" value={form.scheduledPostDate} onChange={e => setForm({...form, scheduledPostDate: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Post Time</label>
              <input value={form.postTime} onChange={e => setForm({...form, postTime: e.target.value})} className={inputCls} placeholder="e.g. 10:30 AM" />
            </div>
            <div>
              <label className={labelCls}>Phase</label>
              <input value={form.phase} onChange={e => setForm({...form, phase: e.target.value})} className={inputCls} placeholder="Phase 1" />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className={labelCls}>Content Title *</label>
            <input required value={form.ideaTitle} onChange={e => setForm({...form, ideaTitle: e.target.value})} className={inputCls} placeholder="Short, catchy title…" />
          </div>

          {/* Caption */}
          <div>
            <label className={labelCls}>Instagram Caption</label>
            <textarea rows={3} value={form.caption} onChange={e => setForm({...form, caption: e.target.value})} className={`${inputCls} resize-none`} placeholder="Full caption with emojis, tags, CTA…" />
          </div>

          {/* Hashtags + Music */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Hashtags</label>
              <input value={form.hashtags} onChange={e => setForm({...form, hashtags: e.target.value})} className={inputCls} placeholder="#brand #viral" />
            </div>
            <div>
              <label className={labelCls}>Audio / Music</label>
              <input value={form.music} onChange={e => setForm({...form, music: e.target.value})} className={inputCls} placeholder="Song name or style…" />
            </div>
          </div>

          {/* Script */}
          <div>
            <label className={labelCls}>Script / Talking Points</label>
            <textarea rows={3} value={form.script} onChange={e => setForm({...form, script: e.target.value})} className={`${inputCls} resize-none`} placeholder="What will be said or shown in the video…" />
          </div>

          {/* Visual + Idea desc */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Visual Description</label>
              <textarea rows={2} value={form.visualDescription} onChange={e => setForm({...form, visualDescription: e.target.value})} className={`${inputCls} resize-none`} placeholder="Colors, styling, mood…" />
            </div>
            <div>
              <label className={labelCls}>Idea Description</label>
              <textarea rows={2} value={form.ideaDescription} onChange={e => setForm({...form, ideaDescription: e.target.value})} className={`${inputCls} resize-none`} placeholder="Full concept…" />
            </div>
          </div>

          {/* Drive link + CTA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Google Drive Link</label>
              <input value={form.driveLink} onChange={e => setForm({...form, driveLink: e.target.value})} className={inputCls} placeholder="https://drive.google.com/…" />
            </div>
            <div>
              <label className={labelCls}>Call to Action</label>
              <input value={form.cta} onChange={e => setForm({...form, cta: e.target.value})} className={inputCls} placeholder="Follow, Visit link, DM us…" />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-opacity" style={{ background: "var(--gradient-brand)" }}>
              {saving ? "Saving…" : brief ? "Save Changes" : "Add Content"}
            </button>
            <button type="button" onClick={onClose} className="px-5 py-2.5 border border-[--border] text-[--text-secondary] text-sm font-semibold rounded-xl hover:bg-[--bg-app] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Content Row ────────────────────────────────────────── */
function ContentRow({ brief, onApprove, onReject, onEdit, onDelete, onDriveSave }: {
  brief: Brief;
  onApprove: () => void;
  onReject: (feedback: string, action: "revision" | "reject") => void;
  onEdit: () => void;
  onDelete: () => void;
  onDriveSave: (link: string) => void;
}) {
  const cfg = TYPE[brief.contentType] || TYPE.Reel;
  const Icon = cfg.Icon;
  const st = STATUS[brief.status] || STATUS.draft;
  const [expanded, setExpanded] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [fbAction, setFbAction] = useState<"revision"|"reject">("revision");
  const [feedback, setFeedback] = useState("");
  const [driveOpen, setDriveOpen] = useState(false);
  const [draftLink, setDraftLink] = useState(brief.driveLink || "");

  const dateObj = brief.scheduledPostDate ? new Date(brief.scheduledPostDate) : null;

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${brief.status === "approved" ? "border-emerald-200" : brief.status === "rejected" ? "border-red-200" : "border-[--border]"}`}
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      {/* Status stripe */}
      <div className="h-0.5" style={{ background: brief.status === "approved" ? "#10B981" : brief.status === "rejected" ? "#EF4444" : brief.status === "revision_requested" ? "#F59E0B" : cfg.color }} />

      {/* Main row */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-slate-50/60 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        {/* Type icon */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
          <Icon size={15} style={{ color: cfg.color }} strokeWidth={1.75} />
        </div>

        {/* Date */}
        <div className="hidden sm:flex flex-col items-center justify-center w-12 shrink-0">
          {dateObj ? (
            <>
              <span className="text-[10px] font-black text-[--text-tertiary] uppercase">{DAYS[dateObj.getDay()]}</span>
              <span className="text-base font-black text-[--text-primary] leading-none">{dateObj.getDate()}</span>
            </>
          ) : <span className="text-[10px] text-[--text-tertiary]">—</span>}
        </div>

        {/* Content info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-[--text-tertiary]">#{brief.briefNumber || "—"}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
              {brief.contentType}
            </span>
            {brief.phase && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{brief.phase}</span>}
            {brief.postTime && <span className="hidden md:flex items-center gap-1 text-[10px] text-[--text-tertiary]"><Clock size={9} /> {brief.postTime}</span>}
          </div>
          <p className="font-bold text-[--text-primary] text-sm mt-0.5 truncate">{brief.ideaTitle}</p>
          {brief.caption && <p className="text-xs text-[--text-tertiary] truncate mt-0.5">{brief.caption}</p>}
        </div>

        {/* Status + quick actions */}
        <div className="flex items-center gap-2 shrink-0 ml-2" onClick={e => e.stopPropagation()}>
          <span className={`hidden sm:block text-[10px] font-bold px-2.5 py-1 rounded-full ${st.bg} ${st.text}`}>
            {st.label}
          </span>

          {/* Drive link */}
          <button
            onClick={() => setDriveOpen(v => !v)}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${brief.driveLink ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "text-[--text-tertiary] hover:bg-[--bg-app]"}`}
            title={brief.driveLink ? "View Drive link" : "Add Drive link"}
          >
            <Link2 size={13} />
          </button>

          {/* Approve */}
          {brief.status !== "approved" && (
            <button onClick={onApprove} className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Approve">
              <Check size={13} strokeWidth={2.5} />
            </button>
          )}

          {/* Reject/Revision */}
          {!["approved","rejected"].includes(brief.status) && (
            <button onClick={() => setFeedbackOpen(true)} className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Reject / Request changes">
              <XCircle size={13} />
            </button>
          )}

          {/* Edit */}
          <button onClick={onEdit} className="w-8 h-8 rounded-xl flex items-center justify-center text-[--text-tertiary] hover:bg-[--bg-app] transition-colors" title="Edit">
            <FileText size={13} />
          </button>

          {/* Delete */}
          <button onClick={onDelete} className="w-8 h-8 rounded-xl flex items-center justify-center text-[--text-tertiary] hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Drive link input */}
      {driveOpen && (
        <div className="px-4 pb-3 border-t border-[--border] pt-3 flex gap-2 items-center bg-slate-50/60" onClick={e => e.stopPropagation()}>
          <Link2 size={13} className="text-[--text-tertiary] shrink-0" />
          <input
            value={draftLink}
            onChange={e => setDraftLink(e.target.value)}
            placeholder="https://drive.google.com/…"
            className="flex-1 text-sm border border-[--border] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
          />
          {draftLink && (
            <a href={draftLink} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:underline px-2" onClick={e => e.stopPropagation()}>
              Open →
            </a>
          )}
          <button onClick={() => { onDriveSave(draftLink); setDriveOpen(false); }} className="px-3 py-2 text-xs font-bold text-white rounded-xl" style={{ background: "var(--gradient-brand)" }}>
            Save
          </button>
        </div>
      )}

      {/* Feedback row */}
      {brief.clientFeedback && !feedbackOpen && (
        <div className="px-4 pb-3 border-t border-amber-100 pt-2 bg-amber-50/50">
          <p className="text-xs font-bold text-amber-700 mb-0.5">Client Feedback</p>
          <p className="text-xs text-amber-700">{brief.clientFeedback}</p>
        </div>
      )}

      {/* Feedback form */}
      {feedbackOpen && (
        <div className="px-4 pb-4 border-t border-[--border] pt-3 space-y-3 bg-slate-50/60" onClick={e => e.stopPropagation()}>
          <div className="grid grid-cols-2 gap-2">
            {([["revision","Request Changes","#F59E0B","#FFFBEB"],["reject","Reject","#EF4444","#FEF2F2"]] as const).map(([act, label, color, bg]) => (
              <button key={act} onClick={() => setFbAction(act)}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl border-2 text-xs font-bold transition-all`}
                style={{ borderColor: fbAction === act ? color : "#E5E7EB", background: fbAction === act ? bg : "white", color: fbAction === act ? color : "#6B7280" }}>
                {act === "revision" ? <RotateCcw size={12} /> : <XCircle size={12} />}
                {label}
              </button>
            ))}
          </div>
          <textarea rows={2} value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Explain what needs to change…"
            className="w-full text-sm border border-[--border] rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none bg-white" />
          <div className="flex gap-2">
            <button onClick={() => setFeedbackOpen(false)} className="flex-1 py-2 border border-[--border] text-[--text-secondary] text-xs font-bold rounded-xl hover:bg-[--bg-app] transition-colors">Cancel</button>
            <button onClick={() => { if (feedback.trim()) { onReject(feedback, fbAction); setFeedbackOpen(false); setFeedback(""); } }}
              disabled={!feedback.trim()}
              className="flex-1 py-2 text-white text-xs font-bold rounded-xl disabled:opacity-50 transition-all"
              style={{ background: fbAction === "reject" ? "#EF4444" : "#F59E0B" }}>
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-[--border] pt-3 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/40">
          {brief.script && (
            <div>
              <p className="text-[10px] font-black text-[--text-tertiary] uppercase tracking-widest mb-1.5">Script</p>
              <p className="text-xs text-[--text-secondary] leading-relaxed whitespace-pre-wrap">{brief.script}</p>
            </div>
          )}
          {brief.ideaDescription && (
            <div>
              <p className="text-[10px] font-black text-[--text-tertiary] uppercase tracking-widest mb-1.5">Idea</p>
              <p className="text-xs text-[--text-secondary] leading-relaxed">{brief.ideaDescription}</p>
            </div>
          )}
          {brief.hashtags && (
            <div>
              <p className="text-[10px] font-black text-[--text-tertiary] uppercase tracking-widest mb-1.5 flex items-center gap-1"><Hash size={9} />Hashtags</p>
              <p className="text-xs text-indigo-500 font-medium">{brief.hashtags}</p>
            </div>
          )}
          {brief.music && (
            <div>
              <p className="text-[10px] font-black text-[--text-tertiary] uppercase tracking-widest mb-1.5 flex items-center gap-1"><Music2 size={9} />Audio</p>
              <p className="text-xs text-[--text-secondary]">{brief.music}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Mini Calendar ──────────────────────────────────────── */
function MiniCalendar({ briefs, month, year, onDayClick }: {
  briefs: Brief[];
  month: string;
  year: number;
  onDayClick: (date: string) => void;
}) {
  const monthIndex = MONTHS.indexOf(month);
  const [vm, setVm] = useState(monthIndex >= 0 ? monthIndex : new Date().getMonth());
  const [vy, setVy] = useState(year);

  const firstDay = new Date(vy, vm, 1).getDay();
  const daysInMonth = new Date(vy, vm + 1, 0).getDate();
  const today = new Date();

  const byDay: Record<number, Brief[]> = {};
  briefs.forEach(b => {
    if (!b.scheduledPostDate) return;
    const d = new Date(b.scheduledPostDate);
    if (d.getFullYear() === vy && d.getMonth() === vm) (byDay[d.getDate()] ??= []).push(b);
  });

  const prev = () => { if (vm === 0) { setVm(11); setVy(y => y-1); } else setVm(m => m-1); };
  const next = () => { if (vm === 11) { setVm(0); setVy(y => y+1); } else setVm(m => m+1); };

  const cells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  return (
    <div className="bg-white rounded-2xl border border-[--border] overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
      {/* Nav */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[--border]">
        <button onClick={prev} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[--bg-app] text-[--text-secondary] transition-colors"><ChevronLeft size={14}/></button>
        <span className="text-xs font-black text-[--text-primary]">{MONTHS[vm]} {vy}</span>
        <button onClick={next} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[--bg-app] text-[--text-secondary] transition-colors"><ChevronRight size={14}/></button>
      </div>
      {/* Day labels */}
      <div className="grid grid-cols-7 px-2 pt-2">
        {DAYS.map(d => <div key={d} className="text-center text-[9px] font-black text-[--text-tertiary] uppercase pb-1">{d[0]}</div>)}
      </div>
      {/* Cells */}
      <div className="grid grid-cols-7 px-2 pb-3 gap-0.5">
        {Array.from({ length: cells }).map((_, i) => {
          const day = i - firstDay + 1;
          const valid = day >= 1 && day <= daysInMonth;
          const isToday = valid && today.getFullYear() === vy && today.getMonth() === vm && today.getDate() === day;
          const items = valid ? (byDay[day] || []) : [];
          const dateStr = valid ? `${vy}-${String(vm+1).padStart(2,"0")}-${String(day).padStart(2,"0")}` : "";

          return (
            <button
              key={i}
              disabled={!valid}
              onClick={() => valid && onDayClick(dateStr)}
              className={`relative flex flex-col items-center py-1.5 rounded-lg transition-all text-center ${
                valid ? "hover:bg-indigo-50 cursor-pointer" : "opacity-0 pointer-events-none"
              } ${isToday ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
            >
              <span className={`text-[11px] font-bold leading-none ${isToday ? "text-white" : valid ? "text-[--text-primary]" : ""}`}>
                {valid ? day : ""}
              </span>
              {items.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 justify-center flex-wrap">
                  {items.slice(0,3).map(b => {
                    const tc = TYPE[b.contentType] || TYPE.Reel;
                    return <span key={b.id} className="w-1.5 h-1.5 rounded-full" style={{ background: tc.color }} />;
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>
      {/* Legend */}
      <div className="px-4 pb-3 flex flex-wrap gap-2">
        {Object.entries(TYPE).map(([type, tc]) => (
          <span key={type} className="flex items-center gap-1 text-[9px] font-bold" style={{ color: tc.color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: tc.color }} />
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function CalendarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [cal, setCal] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBrief, setEditBrief] = useState<Brief | null>(null);
  const [defaultDate, setDefaultDate] = useState("");
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState<{ok: boolean; text: string} | null>(null);
  const [filterStatus, setFilterStatus] = useState("");

  const fetch_ = useCallback(() => {
    fetch(`/api/calendars/${id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setCal(d.data); })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const approve = async (briefId: string) => {
    await fetch(`/api/briefs/${briefId}/approve`, { method: "PUT" });
    fetch_();
  };

  const reject = async (briefId: string, feedback: string, action: "revision"|"reject") => {
    await fetch(`/api/briefs/${briefId}/reject`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback, action }),
    });
    fetch_();
  };

  const deleteBrief = async (briefId: string) => {
    if (!confirm("Delete this content?")) return;
    await fetch(`/api/briefs/${briefId}`, { method: "DELETE" });
    fetch_();
  };

  const saveDrive = async (briefId: string, driveLink: string) => {
    await fetch(`/api/briefs/${briefId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driveLink }),
    });
    fetch_();
  };

  const sendToClient = async () => {
    setSending(true); setSendMsg(null);
    const res = await fetch(`/api/calendars/${id}/send-to-client`, { method: "POST" });
    const d = await res.json();
    setSendMsg({ ok: d.success, text: d.success ? "Sent to client!" : d.error || "Failed." });
    if (d.success) fetch_();
    setSending(false);
  };

  if (loading) return (
    <div>
      <Topbar title="Content Calendar" />
      <div className="p-6 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-20 rounded-2xl bg-white border border-[--border] animate-pulse"/>)}</div>
    </div>
  );

  if (!cal) return (
    <div>
      <Topbar title="Content Calendar" />
      <div className="p-6 text-center text-[--text-tertiary] mt-20">Calendar not found.</div>
    </div>
  );

  const briefs = cal.briefs || [];
  const filtered = filterStatus ? briefs.filter(b => b.status === filterStatus) : briefs;
  const sorted = [...filtered].sort((a, b) => {
    if (!a.scheduledPostDate && !b.scheduledPostDate) return 0;
    if (!a.scheduledPostDate) return 1;
    if (!b.scheduledPostDate) return -1;
    return new Date(a.scheduledPostDate).getTime() - new Date(b.scheduledPostDate).getTime();
  });

  const stats = {
    total: briefs.length,
    approved: briefs.filter(b => b.status === "approved").length,
    pending: briefs.filter(b => b.status === "sent_to_client").length,
    rejected: briefs.filter(b => ["rejected","revision_requested"].includes(b.status)).length,
    withDrive: briefs.filter(b => b.driveLink).length,
  };

  return (
    <div>
      <Topbar title={`${cal.month} ${cal.year}`} />
      <div className="p-4 md:p-6">

        {/* ── Header ── */}
        <div className="bg-white rounded-2xl border border-[--border] overflow-hidden mb-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="h-1.5" style={{ background: "var(--gradient-brand)" }} />
          <div className="p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-black shrink-0"
                  style={{ background: "var(--gradient-brand)", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}>
                  <span className="text-[9px] uppercase tracking-widest opacity-80">{cal.month.slice(0,3)}</span>
                  <span className="text-xl leading-none">{cal.year.toString().slice(-2)}</span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-[--text-primary]">{cal.month} {cal.year}</h2>
                  <p className="text-sm text-[--text-secondary] font-semibold">{cal.client.name}</p>
                  <div className="flex gap-4 mt-2 flex-wrap">
                    {[
                      { label: "Total", val: stats.total, color: "text-[--text-primary]" },
                      { label: "Approved", val: stats.approved, color: "text-emerald-600" },
                      { label: "Pending", val: stats.pending, color: "text-blue-600" },
                      { label: "Needs Work", val: stats.rejected, color: "text-red-500" },
                      { label: "With Drive", val: stats.withDrive, color: "text-indigo-600" },
                    ].map(s => (
                      <div key={s.label} className="text-center">
                        <p className={`text-lg font-black ${s.color}`}>{s.val}</p>
                        <p className="text-[9px] font-bold text-[--text-tertiary] uppercase tracking-wide">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 items-end">
                <button onClick={sendToClient} disabled={sending}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-50 transition-opacity hover:opacity-90"
                  style={{ background: "var(--gradient-brand)" }}>
                  <Mail size={14} />
                  {sending ? "Sending…" : cal.sentToClientAt ? "Resend to Client" : "Send to Client"}
                </button>
                {sendMsg && (
                  <p className={`text-xs font-semibold ${sendMsg.ok ? "text-emerald-600" : "text-red-500"}`}>{sendMsg.text}</p>
                )}
                {cal.sentToClientAt && (
                  <p className="text-xs text-[--text-tertiary]">Last sent {formatDate(cal.sentToClientAt)}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">

          {/* ── Content list ── */}
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-[--text-primary]">Content</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--brand-primary-light)", color: "var(--brand-primary)" }}>
                  {filtered.length}
                </span>
                {/* Status filter */}
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="text-xs font-bold border border-[--border] rounded-xl px-3 py-1.5 bg-white text-[--text-secondary] focus:outline-none focus:ring-2 focus:ring-indigo-200">
                  <option value="">All</option>
                  {Object.entries(STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <button
                onClick={() => { setEditBrief(null); setDefaultDate(""); setShowModal(true); }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white rounded-xl hover:opacity-90 transition-opacity"
                style={{ background: "var(--gradient-brand)" }}>
                <Plus size={14} /> Add Content
              </button>
            </div>

            {/* List */}
            {sorted.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[--border] p-16 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
                <CalendarDays size={32} className="mx-auto text-[--text-tertiary] mb-3" strokeWidth={1.25} />
                <p className="font-bold text-[--text-secondary] text-sm">No content yet</p>
                <p className="text-xs text-[--text-tertiary] mt-1 mb-4">Click a day on the calendar or use Add Content to get started</p>
                <button onClick={() => setShowModal(true)} className="px-4 py-2 text-sm font-bold text-white rounded-xl" style={{ background: "var(--gradient-brand)" }}>
                  Add First Content
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {sorted.map(brief => (
                  <ContentRow
                    key={brief.id}
                    brief={brief}
                    onApprove={() => approve(brief.id)}
                    onReject={(fb, act) => reject(brief.id, fb, act)}
                    onEdit={() => { setEditBrief(brief); setShowModal(true); }}
                    onDelete={() => deleteBrief(brief.id)}
                    onDriveSave={(link) => saveDrive(brief.id, link)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Right sidebar: mini calendar ── */}
          <div className="space-y-4">
            <MiniCalendar
              briefs={briefs}
              month={cal.month}
              year={cal.year}
              onDayClick={(date) => { setDefaultDate(date); setEditBrief(null); setShowModal(true); }}
            />

            {/* Quick stats by type */}
            <div className="bg-white rounded-2xl border border-[--border] p-4" style={{ boxShadow: "var(--shadow-card)" }}>
              <p className="text-[10px] font-black text-[--text-tertiary] uppercase tracking-widest mb-3">By Type</p>
              {Object.entries(TYPE).map(([type, tc]) => {
                const count = briefs.filter(b => b.contentType === type).length;
                const approved = briefs.filter(b => b.contentType === type && b.status === "approved").length;
                return (
                  <div key={type} className="flex items-center gap-2 mb-2 last:mb-0">
                    <tc.Icon size={12} style={{ color: tc.color }} strokeWidth={2} className="shrink-0" />
                    <span className="text-xs font-semibold text-[--text-secondary] flex-1">{type}</span>
                    <span className="text-xs font-bold text-emerald-600">{approved}</span>
                    <span className="text-xs text-[--text-tertiary]">/{count}</span>
                  </div>
                );
              })}
            </div>

            <Link href="/calendars" className="flex items-center gap-1.5 text-sm text-[--text-secondary] hover:text-indigo-600 font-semibold transition-colors">
              <ArrowLeft size={14} /> All Calendars
            </Link>
          </div>
        </div>
      </div>

      {showModal && (
        <BriefModal
          calendarId={id}
          brief={editBrief}
          defaultDate={defaultDate}
          onClose={() => { setShowModal(false); setEditBrief(null); setDefaultDate(""); }}
          onSave={fetch_}
        />
      )}
    </div>
  );
}
