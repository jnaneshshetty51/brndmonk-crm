"use client";
import { useEffect, useState, useCallback } from "react";
import Topbar from "@/components/Topbar";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import type { Video, Client, Calendar } from "@/types";
import { Download, Plus, X, Video as VideoIcon } from "lucide-react";

const inputCls = "w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95]";
const labelCls = "block text-sm font-medium text-[#2D3142] mb-1.5";

function VideoModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [form, setForm] = useState({ clientId: "", calendarId: "", rawFootageLink: "", editorId: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch("/api/clients").then((r) => r.json()).then((d) => { if (d.success) setClients(d.data); }); }, []);
  useEffect(() => {
    if (form.clientId) fetch(`/api/calendars?clientId=${form.clientId}`).then((r) => r.json()).then((d) => { if (d.success) setCalendars(d.data); });
  }, [form.clientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await fetch("/api/videos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { onSave(); onClose(); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[--border]">
          <h2 className="font-bold text-[--text-primary]">Add Video</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[--bg-app] text-[--text-tertiary]"><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className={labelCls}>Client *</label>
            <select required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className={inputCls}>
              <option value="">Select client...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Calendar *</label>
            <select required value={form.calendarId} onChange={(e) => setForm({ ...form, calendarId: e.target.value })} className={inputCls} disabled={!form.clientId}>
              <option value="">Select calendar...</option>
              {calendars.map((c) => <option key={c.id} value={c.id}>{c.month} {c.year}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Raw Footage Link</label>
            <input value={form.rawFootageLink} onChange={(e) => setForm({ ...form, rawFootageLink: e.target.value })} className={inputCls} placeholder="https://drive.google.com/..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-[--border] text-[--text-secondary] text-sm font-semibold rounded-xl hover:bg-[--bg-app]">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl disabled:opacity-50" style={{ background: "var(--gradient-brand)" }}>
              {saving ? "Adding…" : "Add Video"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UpdateVideoModal({ video, onClose, onSave }: { video: Video; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    status: video.status, finalVideoLink: video.finalVideoLink || "",
    clientFeedback: video.clientFeedback || "", clientApprovalStatus: video.clientApprovalStatus,
    scheduledPostDate: video.scheduledPostDate?.slice(0, 10) || "",
    scheduledPostPlatform: video.scheduledPostPlatform || "", scheduledPostCaption: video.scheduledPostCaption || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    await fetch(`/api/videos/${video.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    onSave(); onClose(); setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[--border]">
          <h2 className="font-bold text-[--text-primary]">Update Video</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[--bg-app] text-[--text-tertiary]"><X size={15} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div><label className={labelCls}>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
              <option value="in_editing">In Editing</option><option value="ready_for_approval">Ready for Approval</option>
              <option value="pending_client_approval">Pending Client Approval</option><option value="approved">Approved</option>
              <option value="rejected">Rejected</option><option value="scheduled">Scheduled</option><option value="posted">Posted</option>
            </select>
          </div>
          <div><label className={labelCls}>Final Video Link</label>
            <input value={form.finalVideoLink} onChange={(e) => setForm({ ...form, finalVideoLink: e.target.value })} className={inputCls} placeholder="https://drive.google.com/..." />
          </div>
          <div><label className={labelCls}>Client Approval Status</label>
            <select value={form.clientApprovalStatus} onChange={(e) => setForm({ ...form, clientApprovalStatus: e.target.value })} className={inputCls}>
              <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
            </select>
          </div>
          <div><label className={labelCls}>Client Feedback</label>
            <textarea rows={3} value={form.clientFeedback} onChange={(e) => setForm({ ...form, clientFeedback: e.target.value })} className={`${inputCls} resize-none`} placeholder="Client comments..." />
          </div>
          {form.status === "scheduled" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Post Date</label><input type="date" value={form.scheduledPostDate} onChange={(e) => setForm({ ...form, scheduledPostDate: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Platform</label>
                  <select value={form.scheduledPostPlatform} onChange={(e) => setForm({ ...form, scheduledPostPlatform: e.target.value })} className={inputCls}>
                    <option value="">Select...</option><option>Instagram</option><option>Facebook</option><option>TikTok</option><option>YouTube</option>
                  </select>
                </div>
              </div>
              <div><label className={labelCls}>Post Caption</label>
                <textarea rows={3} value={form.scheduledPostCaption} onChange={(e) => setForm({ ...form, scheduledPostCaption: e.target.value })} className={`${inputCls} resize-none`} placeholder="Caption for the post..." />
              </div>
            </>
          )}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-[--border] text-[--text-secondary] text-sm font-semibold rounded-xl hover:bg-[--bg-app]">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl disabled:opacity-50" style={{ background: "var(--gradient-brand)" }}>
              {saving ? "Updating…" : "Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function exportCSV(videos: Video[]) {
  const headers = ["Client", "Status", "Approval Status", "Editor", "Final Video", "Post Date", "Platform", "Created"];
  const rows = videos.map((v) => [
    (v.client as { name: string })?.name ?? "",
    v.status, v.clientApprovalStatus, v.editorId ?? "",
    v.finalVideoLink ?? "", v.scheduledPostDate ? new Date(v.scheduledPostDate).toLocaleDateString() : "",
    v.scheduledPostPlatform ?? "", new Date(v.createdAt).toLocaleDateString(),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `videos-${Date.now()}.csv`;
  a.click();
}

const STATUS_GROUPS = [
  { key: "in_editing",              label: "In Editing",        color: "bg-purple-50 border-purple-200" },
  { key: "ready_for_approval",      label: "Ready for Review",  color: "bg-blue-50 border-blue-200" },
  { key: "pending_client_approval", label: "With Client",       color: "bg-yellow-50 border-yellow-200" },
  { key: "approved",                label: "Approved",          color: "bg-green-50 border-green-200" },
  { key: "scheduled",               label: "Scheduled",         color: "bg-teal-50 border-teal-200" },
  { key: "posted",                  label: "Posted",            color: "bg-gray-50 border-gray-200" },
];

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [updateVideo, setUpdateVideo] = useState<Video | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchVideos = useCallback(() => {
    const params = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`/api/videos${params}`).then((r) => r.json()).then((d) => { if (d.success) setVideos(d.data); }).finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const toggleSelect = (id: string) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected(selected.size === videos.length ? new Set() : new Set(videos.map((v) => v.id)));

  const bulkUpdateStatus = async (status: string) => {
    await Promise.all([...selected].map((id) => fetch(`/api/videos/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })));
    setSelected(new Set()); fetchVideos();
  };

  const grouped = STATUS_GROUPS.map((g) => ({ ...g, videos: videos.filter((v) => v.status === g.key) }));
  const selectedVideos = videos.filter((v) => selected.has(v.id));

  return (
    <div>
      <Topbar title="Videos" />
      <div className="p-4 md:p-6 space-y-5">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 border border-[--border] rounded-xl text-sm bg-white focus:outline-none">
            <option value="">All Statuses</option>
            {STATUS_GROUPS.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}
          </select>
          <div className="flex-1" />
          <button onClick={() => exportCSV(videos)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[--border] text-sm font-semibold text-[--text-secondary] hover:bg-[--bg-app] bg-white">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "var(--gradient-brand)" }}>
            <Plus size={14} /> Add Video
          </button>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-indigo-200 bg-indigo-50 text-sm">
            <span className="font-semibold text-indigo-700">{selected.size} selected</span>
            <div className="flex gap-2 ml-2 flex-wrap">
              <button onClick={() => bulkUpdateStatus("in_editing")} className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700">In Editing</button>
              <button onClick={() => bulkUpdateStatus("ready_for_approval")} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700">Ready</button>
              <button onClick={() => bulkUpdateStatus("approved")} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700">Approved</button>
              <button onClick={() => bulkUpdateStatus("posted")} className="px-3 py-1.5 rounded-lg bg-slate-600 text-white text-xs font-bold hover:bg-slate-700">Posted</button>
              <button onClick={() => exportCSV(selectedVideos)} className="px-3 py-1.5 rounded-lg border border-indigo-300 text-indigo-700 text-xs font-bold hover:bg-indigo-100">Export Selected</button>
            </div>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-indigo-400 hover:text-indigo-700"><X size={14} /></button>
          </div>
        )}

        {/* Select all */}
        {videos.length > 0 && !loading && (
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={selected.size === videos.length && videos.length > 0} onChange={toggleAll} className="rounded" />
            <span className="text-xs text-[--text-tertiary] font-medium">
              {selected.size > 0 ? `${selected.size} of ${videos.length} selected` : `Select all ${videos.length} videos`}
            </span>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-2xl border border-[--border] p-5 h-24 animate-pulse" />)}</div>
        ) : videos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[--border] p-16 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--bg-app)" }}>
              <VideoIcon size={24} className="text-[--text-tertiary]" strokeWidth={1.25} />
            </div>
            <p className="font-bold text-[--text-secondary] text-sm">No videos yet</p>
            <p className="text-[--text-tertiary] text-xs mt-1 mb-4">Add your first video to track editing progress</p>
            <button onClick={() => setShowModal(true)} className="px-4 py-2 text-sm font-bold text-white rounded-xl" style={{ background: "var(--gradient-brand)" }}>Add Video</button>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.filter((g) => g.videos.length > 0).map((group) => (
              <div key={group.key}>
                <p className="text-[11px] font-bold text-[--text-tertiary] uppercase tracking-widest mb-3">
                  {group.label} <span className="normal-case font-semibold">({group.videos.length})</span>
                </p>
                <div className="space-y-3">
                  {group.videos.map((video) => (
                    <div key={video.id}
                      className={`rounded-2xl border p-5 hover:shadow-md transition-all duration-200 relative ${group.color} ${selected.has(video.id) ? "ring-2 ring-indigo-300" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <input type="checkbox" checked={selected.has(video.id)} onChange={() => toggleSelect(video.id)} className="rounded mt-0.5 shrink-0" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <p className="font-bold text-[--text-primary] text-sm truncate">
                                  {video.brief ? (video.brief as { ideaTitle: string }).ideaTitle : `Video — ${(video.client as { name: string })?.name}`}
                                </p>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${getStatusColor(video.status)}`}>v{video.finalVideoVersion}</span>
                              </div>
                              <p className="text-xs text-[--text-secondary]">{(video.client as { name: string })?.name}</p>
                              <div className="flex flex-wrap gap-3 mt-2 text-xs text-[--text-tertiary]">
                                {video.rawFootageLink && <a href={video.rawFootageLink} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-medium">📁 Raw Footage</a>}
                                {video.finalVideoLink && <a href={video.finalVideoLink} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-medium">🎬 Final Video</a>}
                                {video.scheduledPostDate && <span>📅 Post: {formatDate(video.scheduledPostDate)}</span>}
                                {video.scheduledPostPlatform && <span>📱 {video.scheduledPostPlatform}</span>}
                              </div>
                              {video.clientFeedback && <p className="mt-2 text-xs text-[--text-secondary] italic">&ldquo;{video.clientFeedback}&rdquo;</p>}
                            </div>
                            <button onClick={() => setUpdateVideo(video)}
                              className="text-xs px-3 py-1.5 bg-white border border-[--border] text-[--text-secondary] font-semibold rounded-xl hover:bg-[--bg-app] transition-colors shrink-0">
                              Update
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <VideoModal onClose={() => setShowModal(false)} onSave={fetchVideos} />}
      {updateVideo && <UpdateVideoModal video={updateVideo} onClose={() => setUpdateVideo(null)} onSave={fetchVideos} />}
    </div>
  );
}
