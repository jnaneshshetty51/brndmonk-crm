"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import type { Calendar, ContentBrief } from "@/types";
import {
  Film, Image, Layers, Sparkles, Plus, X, Check, ArrowLeft,
  Mail, Zap, Music, MousePointerClick, Clock, CheckCircle2,
  XCircle, RotateCcw, Trash2, Edit2, ChevronRight, CalendarRange, List,
} from "lucide-react";
import ScheduleView from "@/components/ScheduleView";

const CONTENT_TYPES = ["Reel", "Post", "Carousel", "Story"];

const contentTypeConfig: Record<string, { Icon: React.ElementType; color: string; bg: string }> = {
  Reel:     { Icon: Film,     color: "#6366F1", bg: "rgba(99,102,241,0.12)" },
  Post:     { Icon: Image,    color: "#06B6D4", bg: "rgba(6,182,212,0.12)" },
  Carousel: { Icon: Layers,   color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  Story:    { Icon: Sparkles, color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
};

const inputCls = "w-full px-3 py-2.5 border border-[--border] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white";
const labelCls = "block text-xs font-semibold text-[--text-secondary] mb-1.5";

function BriefModal({
  calendarId, brief, onClose, onSave,
}: {
  calendarId: string;
  brief?: ContentBrief | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    calendarId,
    briefNumber: brief?.briefNumber || "",
    contentType: (brief?.contentType as "Reel" | "Post" | "Carousel" | "Story") || "Reel",
    ideaTitle: brief?.ideaTitle || "",
    ideaDescription: brief?.ideaDescription || "",
    visualDescription: brief?.visualDescription || "",
    script: brief?.script || "",
    music: brief?.music || "",
    hashtags: brief?.hashtags || "",
    cta: brief?.cta || "",
    moodBoardLinks: brief?.moodBoardLinks || "",
    specialRequirements: brief?.specialRequirements || "",
    approvalDeadline: brief?.approvalDeadline?.slice(0, 10) || "",
    changes: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = brief ? `/api/briefs/${brief.id}` : "/api/briefs";
    const method = brief ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { onSave(); onClose(); }
    setSaving(false);
  };

  const cfg = contentTypeConfig[form.contentType] || contentTypeConfig.Reel;
  const ContentIcon = cfg.Icon;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[--border]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: cfg.bg }}>
              <ContentIcon size={15} style={{ color: cfg.color }} />
            </div>
            <h2 className="font-bold text-[--text-primary]">{brief ? "Edit Brief" : "New Content Brief"}</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[--bg-app] text-[--text-tertiary] transition-colors">
            <X size={15} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Brief # *</label>
              <input required value={form.briefNumber} onChange={(e) => setForm({ ...form, briefNumber: e.target.value })} className={inputCls} placeholder="1 of 12" />
            </div>
            <div>
              <label className={labelCls}>Content Type *</label>
              <select value={form.contentType} onChange={(e) => setForm({ ...form, contentType: e.target.value as "Reel" | "Post" | "Carousel" | "Story" })} className={inputCls}>
                {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Approval Deadline</label>
              <input type="date" value={form.approvalDeadline} onChange={(e) => setForm({ ...form, approvalDeadline: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Idea Title *</label>
            <input required value={form.ideaTitle} onChange={(e) => setForm({ ...form, ideaTitle: e.target.value })} className={inputCls} placeholder="Short, catchy title for this content" />
          </div>
          <div>
            <label className={labelCls}>Idea Description *</label>
            <textarea required rows={3} value={form.ideaDescription} onChange={(e) => setForm({ ...form, ideaDescription: e.target.value })} className={`${inputCls} resize-none`} placeholder="Full concept and idea explanation…" />
          </div>
          <div>
            <label className={labelCls}>Visual Description *</label>
            <textarea required rows={3} value={form.visualDescription} onChange={(e) => setForm({ ...form, visualDescription: e.target.value })} className={`${inputCls} resize-none`} placeholder="Colors, styling, mood, visual concept…" />
          </div>
          <div>
            <label className={labelCls}>Script / Talking Points *</label>
            <textarea required rows={3} value={form.script} onChange={(e) => setForm({ ...form, script: e.target.value })} className={`${inputCls} resize-none`} placeholder="What will be said or shown…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Music / Audio</label>
              <input value={form.music} onChange={(e) => setForm({ ...form, music: e.target.value })} className={inputCls} placeholder="Song name or audio style…" />
            </div>
            <div>
              <label className={labelCls}>Call to Action</label>
              <input value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} className={inputCls} placeholder="Follow, Visit link, DM us…" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Hashtags</label>
            <input value={form.hashtags} onChange={(e) => setForm({ ...form, hashtags: e.target.value })} className={inputCls} placeholder="#brand #product #trending" />
          </div>
          <div>
            <label className={labelCls}>Mood Board Links</label>
            <input value={form.moodBoardLinks} onChange={(e) => setForm({ ...form, moodBoardLinks: e.target.value })} className={inputCls} placeholder="Pinterest, Drive link…" />
          </div>
          <div>
            <label className={labelCls}>Special Requirements</label>
            <textarea rows={2} value={form.specialRequirements} onChange={(e) => setForm({ ...form, specialRequirements: e.target.value })} className={`${inputCls} resize-none`} placeholder="Props, location, talent needed…" />
          </div>
          {brief && (
            <div>
              <label className={labelCls}>Changes (for version tracking)</label>
              <input value={form.changes} onChange={(e) => setForm({ ...form, changes: e.target.value })} className={inputCls} placeholder="What changed in this revision?" />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-opacity" style={{ background: "var(--gradient-brand)" }}>
              {saving ? "Saving…" : brief ? "Update Brief" : "Create Brief"}
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

function FeedbackModal({ brief, onClose, onSave }: { brief: ContentBrief; onClose: () => void; onSave: () => void }) {
  const [action, setAction] = useState<"revision" | "reject">("revision");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    setSaving(true);
    await fetch(`/api/briefs/${brief.id}/reject`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback, action }),
    });
    onSave();
    onClose();
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[--border]">
          <h2 className="font-bold text-[--text-primary]">Brief Feedback</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[--bg-app] text-[--text-tertiary] transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setAction("revision")}
              className={`flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-all duration-150 ${
                action === "revision" ? "border-amber-400 bg-amber-50" : "border-[--border] hover:bg-[--bg-app]"
              }`}
            >
              <RotateCcw size={18} className={action === "revision" ? "text-amber-500" : "text-[--text-tertiary]"} />
              <span className={`text-xs font-bold ${action === "revision" ? "text-amber-600" : "text-[--text-secondary]"}`}>Request Changes</span>
            </button>
            <button
              onClick={() => setAction("reject")}
              className={`flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-all duration-150 ${
                action === "reject" ? "border-red-400 bg-red-50" : "border-[--border] hover:bg-[--bg-app]"
              }`}
            >
              <XCircle size={18} className={action === "reject" ? "text-red-500" : "text-[--text-tertiary]"} />
              <span className={`text-xs font-bold ${action === "reject" ? "text-red-600" : "text-[--text-secondary]"}`}>Reject Brief</span>
            </button>
          </div>
          <div>
            <label className={labelCls}>Feedback / Reason *</label>
            <textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)}
              placeholder="Explain what needs to change…"
              className={`${inputCls} resize-none`} />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-[--border] text-[--text-secondary] text-sm font-semibold rounded-xl hover:bg-[--bg-app] transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving || !feedback.trim()}
              className={`flex-1 py-2.5 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-all ${
                action === "reject" ? "bg-red-600 hover:bg-red-700" : "bg-amber-500 hover:bg-amber-600"
              }`}>
              {saving ? "Submitting…" : "Submit Feedback"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalendarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [editBrief, setEditBrief] = useState<ContentBrief | null>(null);
  const [feedbackBrief, setFeedbackBrief] = useState<ContentBrief | null>(null);
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickRows, setQuickRows] = useState([{ contentType: "Reel", ideaTitle: "" }]);
  const [quickSaving, setQuickSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"briefs" | "schedule">("briefs");

  const fetchCalendar = () => {
    fetch(`/api/calendars/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setCalendar(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCalendar(); }, [id]);

  const approveBrief = async (briefId: string) => {
    await fetch(`/api/briefs/${briefId}/approve`, { method: "PUT" });
    fetchCalendar();
  };

  const deleteBrief = async (briefId: string) => {
    if (!confirm("Delete this brief?")) return;
    await fetch(`/api/briefs/${briefId}`, { method: "DELETE" });
    fetchCalendar();
  };

  const bulkCreateBriefs = async () => {
    const valid = quickRows.filter(r => r.ideaTitle.trim());
    if (!valid.length) return;
    setQuickSaving(true);
    for (const row of valid) {
      await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendarId: id,
          contentType: row.contentType,
          ideaTitle: row.ideaTitle,
          ideaDescription: "",
          visualDescription: "",
          script: "",
        }),
      });
    }
    setQuickRows([{ contentType: "Reel", ideaTitle: "" }]);
    setShowQuickAdd(false);
    setQuickSaving(false);
    fetchCalendar();
  };

  const sendToClient = async () => {
    setSending(true);
    setSendMsg(null);
    const res = await fetch(`/api/calendars/${id}/send-to-client`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      setSendMsg({ type: "success", text: "Calendar sent to client by email!" });
      fetchCalendar();
    } else {
      setSendMsg({ type: "error", text: data.error || "Failed to send." });
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div>
        <Topbar title="Calendar Details" />
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[--border] p-5 h-28 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!calendar) return (
    <div>
      <Topbar title="Calendar Details" />
      <div className="p-6 text-center text-[--text-tertiary] mt-20">Calendar not found.</div>
    </div>
  );

  const briefs = (calendar.briefs || []) as ContentBrief[];
  const approvedCount = briefs.filter((b) => b.status === "approved").length;
  const pendingCount = briefs.filter((b) => ["draft", "sent_to_client"].includes(b.status)).length;
  const rejectedCount = briefs.filter((b) => ["rejected", "revision_requested"].includes(b.status)).length;

  return (
    <div>
      <Topbar title={`${calendar.month} ${calendar.year}`} />
      <div className="p-4 md:p-6 space-y-5">

        {/* Calendar Info card */}
        <div className="bg-white rounded-2xl border border-[--border] overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
          {/* Top gradient band */}
          <div className="h-1.5 w-full" style={{ background: "var(--gradient-brand)" }} />
          <div className="p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                {/* Month badge */}
                <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 text-white font-black shadow-lg" style={{ background: "var(--gradient-brand)", boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{calendar.month.slice(0, 3)}</span>
                  <span className="text-xl font-black leading-tight">{calendar.year.toString().slice(-2)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                    <h2 className="text-xl font-black text-[--text-primary]">{calendar.month} {calendar.year}</h2>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${getStatusColor(calendar.status)}`}>
                      {getStatusLabel(calendar.status)}
                    </span>
                  </div>
                  <p className="text-[--text-secondary] text-sm font-medium">{(calendar.client as { name: string })?.name}</p>
                  <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs text-[--text-secondary] font-semibold">
                      <Film size={12} className="text-indigo-400" /> {calendar.totalReels} Reels
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-[--text-secondary] font-semibold">
                      <Image size={12} className="text-cyan-400" /> {calendar.totalPosts} Posts
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-[--text-secondary] font-semibold">
                      <Layers size={12} className="text-violet-400" /> {calendar.totalCarousels} Carousels
                    </span>
                  </div>
                </div>
              </div>

              {/* Brief stats */}
              <div className="flex gap-2.5 shrink-0">
                <div className="text-center px-4 py-3 rounded-xl" style={{ background: "linear-gradient(135deg, #ECFDF5, #D1FAE5)", border: "1px solid #A7F3D0" }}>
                  <p className="text-2xl font-black text-emerald-600">{approvedCount}</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide">Approved</p>
                </div>
                <div className="text-center px-4 py-3 rounded-xl" style={{ background: "linear-gradient(135deg, #FFFBEB, #FEF3C7)", border: "1px solid #FDE68A" }}>
                  <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wide">Pending</p>
                </div>
                <div className="text-center px-4 py-3 rounded-xl" style={{ background: "linear-gradient(135deg, #FEF2F2, #FEE2E2)", border: "1px solid #FECACA" }}>
                  <p className="text-2xl font-black text-red-500">{rejectedCount}</p>
                  <p className="text-[10px] text-red-500 font-bold uppercase tracking-wide">Rejected</p>
                </div>
              </div>
            </div>

            {calendar.notes && (
              <div className="mt-4 px-4 py-3 rounded-xl text-sm text-[--text-secondary] border border-[--border]" style={{ background: "var(--bg-app)" }}>
                {calendar.notes}
              </div>
            )}

            {sendMsg && (
              <div className={`mt-3 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 ${sendMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                {sendMsg.type === "success" ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                {sendMsg.text}
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[--border] flex-wrap gap-3">
              <div className="flex items-center gap-3 text-xs text-[--text-tertiary]">
                <span>Created {formatDate(calendar.createdAt)}</span>
                {calendar.sentToClientAt && (
                  <span className="text-emerald-500 font-medium flex items-center gap-1">
                    <ChevronRight size={11} /> Sent {formatDate(calendar.sentToClientAt)}
                  </span>
                )}
              </div>
              <button onClick={sendToClient} disabled={sending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-xl disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: "var(--gradient-brand)" }}>
                <Mail size={14} />
                {sending ? "Sending…" : calendar.sentToClientAt ? "Resend to Client" : "Send to Client"}
              </button>
            </div>
          </div>
        </div>

        {/* Briefs section */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Title + count */}
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-[--text-primary] text-base">Content Briefs</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--brand-primary-light)", color: "var(--brand-primary)" }}>
                  {briefs.length}
                </span>
              </div>
              {/* Tab toggle */}
              <div className="flex items-center bg-[--bg-app] border border-[--border] rounded-xl p-0.5 gap-0.5">
                <button
                  onClick={() => setActiveTab("briefs")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === "briefs" ? "bg-white shadow-sm text-[--text-primary]" : "text-[--text-tertiary] hover:text-[--text-secondary]"}`}
                >
                  <List size={12} /> Briefs
                </button>
                <button
                  onClick={() => setActiveTab("schedule")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === "schedule" ? "bg-white shadow-sm text-[--text-primary]" : "text-[--text-tertiary] hover:text-[--text-secondary]"}`}
                >
                  <CalendarRange size={12} /> Schedule
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowQuickAdd(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-xl border transition-all duration-150 ${showQuickAdd ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-[--border] text-[--text-secondary] hover:bg-[--bg-app]"}`}>
                <Zap size={13} /> Quick Add
              </button>
              <button onClick={() => { setEditBrief(null); setShowBriefModal(true); }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-white rounded-xl hover:opacity-90 transition-opacity"
                style={{ background: "var(--gradient-brand)" }}>
                <Plus size={13} /> Full Brief
              </button>
            </div>
          </div>

          {/* Quick Add panel */}
          {showQuickAdd && (
            <div className="bg-white rounded-2xl border border-indigo-200 p-4 mb-4" style={{ boxShadow: "0 4px 20px rgba(99,102,241,0.08)" }}>
              <p className="text-xs font-bold text-[--text-tertiary] uppercase tracking-wider mb-3">Quick Add Multiple Briefs</p>
              <div className="space-y-2">
                {quickRows.map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select
                      value={row.contentType}
                      onChange={e => setQuickRows(r => r.map((x, j) => j === i ? { ...x, contentType: e.target.value } : x))}
                      className="px-3 py-2 border border-[--border] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 w-32 bg-white"
                    >
                      {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input
                      value={row.ideaTitle}
                      onChange={e => setQuickRows(r => r.map((x, j) => j === i ? { ...x, ideaTitle: e.target.value } : x))}
                      placeholder="Brief title / idea…"
                      className="flex-1 px-3 py-2 border border-[--border] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                    />
                    {quickRows.length > 1 && (
                      <button onClick={() => setQuickRows(r => r.filter((_, j) => j !== i))} className="w-7 h-7 rounded-lg flex items-center justify-center text-[--text-tertiary] hover:text-red-500 hover:bg-red-50 transition-colors">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[--border]">
                <button onClick={() => setQuickRows(r => [...r, { contentType: "Reel", ideaTitle: "" }])}
                  className="text-xs text-indigo-600 font-bold hover:text-indigo-800 transition-colors flex items-center gap-1">
                  <Plus size={11} /> Add row
                </button>
                <div className="flex-1" />
                <button onClick={() => setShowQuickAdd(false)} className="px-3 py-1.5 text-sm border border-[--border] rounded-xl text-[--text-secondary] hover:bg-[--bg-app] transition-colors font-medium">
                  Cancel
                </button>
                <button onClick={bulkCreateBriefs} disabled={quickSaving || quickRows.every(r => !r.ideaTitle.trim())}
                  className="px-4 py-1.5 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-opacity hover:opacity-90"
                  style={{ background: "var(--gradient-brand)" }}>
                  {quickSaving ? "Creating…" : `Create ${quickRows.filter(r => r.ideaTitle.trim()).length} Brief(s)`}
                </button>
              </div>
            </div>
          )}

          {/* Schedule view */}
          {activeTab === "schedule" && (
            <ScheduleView briefs={briefs as Parameters<typeof ScheduleView>[0]["briefs"]} onRefresh={fetchCalendar} />
          )}

          {/* Brief cards */}
          {activeTab === "briefs" && (briefs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[--border] p-12 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--bg-app)" }}>
                <Film size={24} className="text-[--text-tertiary]" strokeWidth={1.25} />
              </div>
              <p className="font-bold text-[--text-secondary] text-sm">No briefs yet</p>
              <p className="text-[--text-tertiary] text-xs mt-1 mb-4">Add the first content brief for this calendar</p>
              <button onClick={() => setShowBriefModal(true)} className="px-4 py-2 text-sm font-bold text-white rounded-xl" style={{ background: "var(--gradient-brand)" }}>
                Add First Brief
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {briefs.map((brief) => {
                const cfg = contentTypeConfig[brief.contentType] || contentTypeConfig.Reel;
                const ContentIcon = cfg.Icon;
                const isApproved = brief.status === "approved";
                const isRejected = ["rejected", "revision_requested"].includes(brief.status);

                return (
                  <div
                    key={brief.id}
                    className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-md ${
                      isApproved ? "border-emerald-200" : isRejected ? "border-red-200" : "border-[--border]"
                    }`}
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    {/* Status bar */}
                    <div className="h-0.5 w-full" style={{
                      background: isApproved
                        ? "linear-gradient(90deg, #10B981, #059669)"
                        : isRejected
                        ? "linear-gradient(90deg, #EF4444, #DC2626)"
                        : "var(--gradient-brand)"
                    }} />

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Content type icon */}
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: cfg.bg }}>
                            <ContentIcon size={17} style={{ color: cfg.color }} strokeWidth={1.75} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs text-[--text-tertiary] font-bold">#{brief.briefNumber}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: cfg.bg, color: cfg.color }}>
                                {brief.contentType}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${getStatusColor(brief.status)}`}>
                                {getStatusLabel(brief.status)}
                              </span>
                              {brief.currentVersion > 1 && (
                                <span className="text-xs px-2 py-0.5 bg-[--bg-app] text-[--text-tertiary] rounded-full font-semibold">
                                  v{brief.currentVersion}
                                </span>
                              )}
                            </div>
                            <p className="font-bold text-[--text-primary] text-sm leading-tight">{brief.ideaTitle}</p>
                            {brief.ideaDescription && (
                              <p className="text-xs text-[--text-secondary] mt-1 line-clamp-2">{brief.ideaDescription}</p>
                            )}

                            {brief.clientFeedback && (
                              <div className="mt-2.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                                <p className="text-xs font-bold text-amber-700 mb-0.5">Client Feedback:</p>
                                <p className="text-xs text-amber-700">{brief.clientFeedback}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                          {!isApproved && (
                            <button onClick={() => approveBrief(brief.id)}
                              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors">
                              <Check size={11} strokeWidth={2.5} /> Approve
                            </button>
                          )}
                          {!isApproved && !isRejected && (
                            <button onClick={() => setFeedbackBrief(brief)}
                              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors">
                              <X size={11} strokeWidth={2.5} /> Reject
                            </button>
                          )}
                          <button onClick={() => { setEditBrief(brief); setShowBriefModal(true); }}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-[--border] text-[--text-secondary] font-bold hover:bg-[--bg-app] transition-colors">
                            <Edit2 size={11} /> Edit
                          </button>
                          <button onClick={() => deleteBrief(brief.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[--text-tertiary] hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Brief meta row */}
                      <div className="mt-3 pt-3 border-t border-[--border] flex flex-wrap gap-3">
                        {brief.music && (
                          <span className="flex items-center gap-1.5 text-xs text-[--text-tertiary]">
                            <Music size={10} /> {brief.music}
                          </span>
                        )}
                        {brief.cta && (
                          <span className="flex items-center gap-1.5 text-xs text-[--text-tertiary]">
                            <MousePointerClick size={10} /> {brief.cta}
                          </span>
                        )}
                        {brief.approvalDeadline && (
                          <span className="flex items-center gap-1.5 text-xs text-[--text-tertiary]">
                            <Clock size={10} /> Due {formatDate(brief.approvalDeadline)}
                          </span>
                        )}
                        {brief.approvedAt && (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
                            <CheckCircle2 size={10} /> Approved {formatDate(brief.approvedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Back link */}
        <div className="pb-2">
          <Link href="/calendars" className="flex items-center gap-1.5 text-sm text-[--text-secondary] hover:text-indigo-600 font-semibold transition-colors w-fit">
            <ArrowLeft size={14} /> Back to Calendars
          </Link>
        </div>
      </div>

      {showBriefModal && (
        <BriefModal calendarId={id} brief={editBrief} onClose={() => setShowBriefModal(false)} onSave={fetchCalendar} />
      )}
      {feedbackBrief && (
        <FeedbackModal brief={feedbackBrief} onClose={() => setFeedbackBrief(null)} onSave={fetchCalendar} />
      )}
    </div>
  );
}
