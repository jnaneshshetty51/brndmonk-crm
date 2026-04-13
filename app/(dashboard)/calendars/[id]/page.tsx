"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import type { Calendar, ContentBrief } from "@/types";

const CONTENT_TYPES = ["Reel", "Post", "Carousel", "Story"];

function BriefModal({
  calendarId,
  brief,
  onClose,
  onSave,
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

  const inputClass = "w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95]";
  const labelClass = "block text-sm font-medium text-[#2D3142] mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="font-semibold text-[#2D3142]">{brief ? "Edit Brief" : "New Content Brief"}</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#2D3142] text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Brief # *</label>
              <input required value={form.briefNumber} onChange={(e) => setForm({ ...form, briefNumber: e.target.value })} className={inputClass} placeholder="1 of 12" />
            </div>
            <div>
              <label className={labelClass}>Content Type *</label>
              <select value={form.contentType} onChange={(e) => setForm({ ...form, contentType: e.target.value as "Reel" | "Post" | "Carousel" | "Story" })} className={inputClass}>
                {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Approval Deadline</label>
              <input type="date" value={form.approvalDeadline} onChange={(e) => setForm({ ...form, approvalDeadline: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Idea Title *</label>
            <input required value={form.ideaTitle} onChange={(e) => setForm({ ...form, ideaTitle: e.target.value })} className={inputClass} placeholder="Short, catchy title for this content" />
          </div>
          <div>
            <label className={labelClass}>Idea Description *</label>
            <textarea required rows={3} value={form.ideaDescription} onChange={(e) => setForm({ ...form, ideaDescription: e.target.value })} className={`${inputClass} resize-none`} placeholder="Full concept and idea explanation..." />
          </div>
          <div>
            <label className={labelClass}>Visual Description *</label>
            <textarea required rows={3} value={form.visualDescription} onChange={(e) => setForm({ ...form, visualDescription: e.target.value })} className={`${inputClass} resize-none`} placeholder="Colors, styling, mood, visual concept..." />
          </div>
          <div>
            <label className={labelClass}>Script / Talking Points *</label>
            <textarea required rows={3} value={form.script} onChange={(e) => setForm({ ...form, script: e.target.value })} className={`${inputClass} resize-none`} placeholder="What will be said or shown..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Music / Audio</label>
              <input value={form.music} onChange={(e) => setForm({ ...form, music: e.target.value })} className={inputClass} placeholder="Song name or audio style..." />
            </div>
            <div>
              <label className={labelClass}>Call to Action</label>
              <input value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} className={inputClass} placeholder="Follow, Visit link, DM us..." />
            </div>
          </div>
          <div>
            <label className={labelClass}>Hashtags</label>
            <input value={form.hashtags} onChange={(e) => setForm({ ...form, hashtags: e.target.value })} className={inputClass} placeholder="#brand #product #trending" />
          </div>
          <div>
            <label className={labelClass}>Mood Board Links</label>
            <input value={form.moodBoardLinks} onChange={(e) => setForm({ ...form, moodBoardLinks: e.target.value })} className={inputClass} placeholder="Pinterest, Drive link..." />
          </div>
          <div>
            <label className={labelClass}>Special Requirements</label>
            <textarea rows={2} value={form.specialRequirements} onChange={(e) => setForm({ ...form, specialRequirements: e.target.value })} className={`${inputClass} resize-none`} placeholder="Props, location, talent needed..." />
          </div>
          {brief && (
            <div>
              <label className={labelClass}>Changes (for version tracking)</label>
              <input value={form.changes} onChange={(e) => setForm({ ...form, changes: e.target.value })} className={inputClass} placeholder="What changed in this revision?" />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-[#E5E7EB] text-[#6B7280] text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] disabled:opacity-50 transition-colors">
              {saving ? "Saving..." : brief ? "Update Brief" : "Create Brief"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FeedbackModal({
  brief,
  onClose,
  onSave,
}: {
  brief: ContentBrief;
  onClose: () => void;
  onSave: () => void;
}) {
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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="font-semibold text-[#2D3142]">Brief Feedback</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#2D3142] text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-3">
            {(["revision", "reject"] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAction(a)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  action === a
                    ? a === "revision" ? "bg-orange-50 border-orange-300 text-orange-600" : "bg-red-50 border-red-300 text-red-600"
                    : "border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50"
                }`}
              >
                {a === "revision" ? "Request Changes" : "Reject Brief"}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Feedback / Reason *</label>
            <textarea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Explain what needs to change..."
              className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95] resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-[#E5E7EB] text-[#6B7280] text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={saving || !feedback.trim()} className="flex-1 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors">
              {saving ? "Submitting..." : "Submit Feedback"}
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

  const contentTypeIcon: Record<string, string> = {
    Reel: "🎬",
    Post: "📸",
    Carousel: "📑",
    Story: "⭕",
  };

  if (loading) {
    return (
      <div>
        <Topbar title="Calendar Details" />
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-5 h-28 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!calendar) return <div className="p-6"><p className="text-[#9CA3AF]">Calendar not found</p></div>;

  const briefs = (calendar.briefs || []) as ContentBrief[];
  const approvedCount = briefs.filter((b) => b.status === "approved").length;
  const pendingCount = briefs.filter((b) => ["draft", "sent_to_client"].includes(b.status)).length;
  const rejectedCount = briefs.filter((b) => ["rejected", "revision_requested"].includes(b.status)).length;

  return (
    <div>
      <Topbar title={`${calendar.month} ${calendar.year} Calendar`} />
      <div className="p-6 space-y-5">
        {/* Calendar Info */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-[#2D3142]">{calendar.month} {calendar.year}</h2>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(calendar.status)}`}>
                  {getStatusLabel(calendar.status)}
                </span>
              </div>
              <p className="text-[#6B7280] text-sm">{(calendar.client as { name: string })?.name}</p>
              <div className="flex gap-4 mt-3 text-sm text-[#6B7280]">
                <span>🎬 {calendar.totalReels} Reels</span>
                <span>📸 {calendar.totalPosts} Posts</span>
                <span>📑 {calendar.totalCarousels} Carousels</span>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-center px-4 py-3 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                <p className="text-xs text-green-600 font-medium">Approved</p>
              </div>
              <div className="text-center px-4 py-3 bg-yellow-50 rounded-xl">
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                <p className="text-xs text-yellow-600 font-medium">Pending</p>
              </div>
              <div className="text-center px-4 py-3 bg-red-50 rounded-xl">
                <p className="text-2xl font-bold text-red-500">{rejectedCount}</p>
                <p className="text-xs text-red-500 font-medium">Rejected</p>
              </div>
            </div>
          </div>
          {calendar.notes && (
            <p className="mt-3 text-sm text-[#6B7280] bg-[#F9FAFB] px-4 py-3 rounded-lg">{calendar.notes}</p>
          )}
          {sendMsg && (
            <div className={`mt-3 px-4 py-2 rounded-lg text-sm ${sendMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
              {sendMsg.text}
            </div>
          )}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F3F4F6]">
            <div className="flex items-center gap-2">
              <p className="text-xs text-[#9CA3AF]">Created {formatDate(calendar.createdAt)}</p>
              {calendar.sentToClientAt && (
                <p className="text-xs text-[#9CA3AF]">· Sent {formatDate(calendar.sentToClientAt)}</p>
              )}
            </div>
            <button onClick={sendToClient} disabled={sending}
              className="px-4 py-2 bg-[#5DCCC4] text-white text-sm font-medium rounded-lg hover:bg-[#2BAAA0] disabled:opacity-50 transition-colors">
              {sending ? "Sending..." : calendar.sentToClientAt ? "Resend to Client" : "📧 Send to Client"}
            </button>
          </div>
        </div>

        {/* Briefs Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[#2D3142]">Content Briefs ({briefs.length})</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowQuickAdd(v => !v)}
                className="px-3 py-2 text-sm font-medium border border-[#6B5B95] text-[#6B5B95] rounded-lg hover:bg-[#6B5B95]/5 transition-colors"
              >
                ⚡ Quick Add
              </button>
              <button
                onClick={() => { setEditBrief(null); setShowBriefModal(true); }}
                className="px-4 py-2 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] transition-colors"
              >
                + Full Brief
              </button>
            </div>
          </div>

          {/* Quick Add rows */}
          {showQuickAdd && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-3 space-y-2">
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase mb-3">Quick Add Multiple Briefs</p>
              {quickRows.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={row.contentType}
                    onChange={e => setQuickRows(r => r.map((x, j) => j === i ? { ...x, contentType: e.target.value } : x))}
                    className="px-2 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 w-28"
                  >
                    {["Reel", "Post", "Carousel", "Story"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input
                    value={row.ideaTitle}
                    onChange={e => setQuickRows(r => r.map((x, j) => j === i ? { ...x, ideaTitle: e.target.value } : x))}
                    placeholder="Brief title / idea..."
                    className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30"
                  />
                  {quickRows.length > 1 && (
                    <button onClick={() => setQuickRows(r => r.filter((_, j) => j !== i))} className="text-[#9CA3AF] hover:text-red-500 text-lg px-1">×</button>
                  )}
                </div>
              ))}
              <div className="flex items-center gap-2 pt-1">
                <button onClick={() => setQuickRows(r => [...r, { contentType: "Reel", ideaTitle: "" }])} className="text-xs text-[#6B5B95] hover:underline">+ Add row</button>
                <div className="flex-1" />
                <button onClick={() => setShowQuickAdd(false)} className="px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-gray-50">Cancel</button>
                <button
                  onClick={bulkCreateBriefs}
                  disabled={quickSaving || quickRows.every(r => !r.ideaTitle.trim())}
                  className="px-4 py-1.5 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] disabled:opacity-50 transition-colors"
                >
                  {quickSaving ? "Creating..." : `Create ${quickRows.filter(r => r.ideaTitle.trim()).length} Brief(s)`}
                </button>
              </div>
            </div>
          )}


          {briefs.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
              <p className="text-3xl mb-2">📝</p>
              <p className="text-[#9CA3AF] text-sm">No briefs yet. Add the first brief for this calendar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {briefs.map((brief) => (
                <div key={brief.id} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{contentTypeIcon[brief.contentType] || "📄"}</span>
                        <span className="text-xs text-[#9CA3AF] font-medium">#{brief.briefNumber}</span>
                        <span className="text-xs px-2 py-0.5 bg-[#6B5B95]/10 text-[#6B5B95] rounded-full font-medium">{brief.contentType}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(brief.status)}`}>
                          {getStatusLabel(brief.status)}
                        </span>
                        {brief.currentVersion > 1 && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">v{brief.currentVersion}</span>
                        )}
                      </div>
                      <p className="font-semibold text-[#2D3142] text-sm">{brief.ideaTitle}</p>
                      <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">{brief.ideaDescription}</p>

                      {brief.clientFeedback && (
                        <div className="mt-2 px-3 py-2 bg-orange-50 border border-orange-100 rounded-lg">
                          <p className="text-xs font-medium text-orange-600 mb-0.5">Client Feedback:</p>
                          <p className="text-xs text-orange-700">{brief.clientFeedback}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      {brief.status !== "approved" && (
                        <button
                          onClick={() => approveBrief(brief.id)}
                          className="text-xs px-3 py-1.5 bg-green-50 text-green-600 font-medium rounded-lg hover:bg-green-100 transition-colors"
                        >
                          ✓ Approve
                        </button>
                      )}
                      {brief.status !== "approved" && brief.status !== "rejected" && (
                        <button
                          onClick={() => setFeedbackBrief(brief)}
                          className="text-xs px-3 py-1.5 bg-red-50 text-red-500 font-medium rounded-lg hover:bg-red-100 transition-colors"
                        >
                          ✗ Reject
                        </button>
                      )}
                      <button
                        onClick={() => { setEditBrief(brief); setShowBriefModal(true); }}
                        className="text-xs px-3 py-1.5 border border-[#E5E7EB] text-[#6B7280] font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteBrief(brief.id)}
                        className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Brief details collapsed */}
                  <div className="mt-3 pt-3 border-t border-[#F3F4F6] flex flex-wrap gap-3 text-xs text-[#9CA3AF]">
                    {brief.music && <span>🎵 {brief.music}</span>}
                    {brief.cta && <span>👉 {brief.cta}</span>}
                    {brief.approvalDeadline && <span>⏰ Due {formatDate(brief.approvalDeadline)}</span>}
                    {brief.approvedAt && <span className="text-green-500">✓ Approved {formatDate(brief.approvedAt)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pb-4">
          <Link href="/dashboard/calendars" className="text-sm text-[#6B5B95] hover:underline">← Back to Calendars</Link>
        </div>
      </div>

      {showBriefModal && (
        <BriefModal
          calendarId={id}
          brief={editBrief}
          onClose={() => setShowBriefModal(false)}
          onSave={fetchCalendar}
        />
      )}
      {feedbackBrief && (
        <FeedbackModal
          brief={feedbackBrief}
          onClose={() => setFeedbackBrief(null)}
          onSave={fetchCalendar}
        />
      )}
    </div>
  );
}
