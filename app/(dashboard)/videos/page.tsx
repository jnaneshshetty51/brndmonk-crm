"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/Topbar";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import type { Video, Client, Calendar } from "@/types";

function VideoModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [form, setForm] = useState({ clientId: "", calendarId: "", rawFootageLink: "", editorId: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then((d) => { if (d.success) setClients(d.data); });
  }, []);

  useEffect(() => {
    if (form.clientId) {
      fetch(`/api/calendars?clientId=${form.clientId}`).then((r) => r.json()).then((d) => { if (d.success) setCalendars(d.data); });
    }
  }, [form.clientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { onSave(); onClose(); }
    setSaving(false);
  };

  const inputClass = "w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95]";
  const labelClass = "block text-sm font-medium text-[#2D3142] mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="font-semibold text-[#2D3142]">Add Video</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#2D3142] text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Client *</label>
            <select required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className={inputClass}>
              <option value="">Select client...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Calendar *</label>
            <select required value={form.calendarId} onChange={(e) => setForm({ ...form, calendarId: e.target.value })} className={inputClass} disabled={!form.clientId}>
              <option value="">Select calendar...</option>
              {calendars.map((c) => <option key={c.id} value={c.id}>{c.month} {c.year}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Raw Footage Link (Google Drive)</label>
            <input value={form.rawFootageLink} onChange={(e) => setForm({ ...form, rawFootageLink: e.target.value })} className={inputClass} placeholder="https://drive.google.com/..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-[#E5E7EB] text-[#6B7280] text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] disabled:opacity-50 transition-colors">
              {saving ? "Adding..." : "Add Video"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UpdateVideoModal({ video, onClose, onSave }: { video: Video; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    status: video.status,
    finalVideoLink: video.finalVideoLink || "",
    clientFeedback: video.clientFeedback || "",
    clientApprovalStatus: video.clientApprovalStatus,
    scheduledPostDate: video.scheduledPostDate?.slice(0, 10) || "",
    scheduledPostPlatform: video.scheduledPostPlatform || "",
    scheduledPostCaption: video.scheduledPostCaption || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    await fetch(`/api/videos/${video.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    onSave();
    onClose();
    setSaving(false);
  };

  const inputClass = "w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95]";
  const labelClass = "block text-sm font-medium text-[#2D3142] mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="font-semibold text-[#2D3142]">Update Video</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#2D3142] text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
              <option value="in_editing">In Editing</option>
              <option value="ready_for_approval">Ready for Approval</option>
              <option value="pending_client_approval">Pending Client Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="scheduled">Scheduled</option>
              <option value="posted">Posted</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Final Video Link (Google Drive)</label>
            <input value={form.finalVideoLink} onChange={(e) => setForm({ ...form, finalVideoLink: e.target.value })} className={inputClass} placeholder="https://drive.google.com/..." />
          </div>
          <div>
            <label className={labelClass}>Client Approval Status</label>
            <select value={form.clientApprovalStatus} onChange={(e) => setForm({ ...form, clientApprovalStatus: e.target.value })} className={inputClass}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Client Feedback</label>
            <textarea rows={3} value={form.clientFeedback} onChange={(e) => setForm({ ...form, clientFeedback: e.target.value })} className={`${inputClass} resize-none`} placeholder="Client comments on this video..." />
          </div>
          {form.status === "scheduled" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Post Date</label>
                  <input type="date" value={form.scheduledPostDate} onChange={(e) => setForm({ ...form, scheduledPostDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Platform</label>
                  <select value={form.scheduledPostPlatform} onChange={(e) => setForm({ ...form, scheduledPostPlatform: e.target.value })} className={inputClass}>
                    <option value="">Select...</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Post Caption</label>
                <textarea rows={3} value={form.scheduledPostCaption} onChange={(e) => setForm({ ...form, scheduledPostCaption: e.target.value })} className={`${inputClass} resize-none`} placeholder="Caption for the post..." />
              </div>
            </>
          )}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-[#E5E7EB] text-[#6B7280] text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] disabled:opacity-50 transition-colors">
              {saving ? "Updating..." : "Update Video"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const STATUS_GROUPS = [
  { key: "in_editing", label: "In Editing", color: "bg-purple-50 border-purple-200" },
  { key: "ready_for_approval", label: "Ready for Review", color: "bg-blue-50 border-blue-200" },
  { key: "pending_client_approval", label: "With Client", color: "bg-yellow-50 border-yellow-200" },
  { key: "approved", label: "Approved", color: "bg-green-50 border-green-200" },
  { key: "scheduled", label: "Scheduled", color: "bg-teal-50 border-teal-200" },
  { key: "posted", label: "Posted", color: "bg-gray-50 border-gray-200" },
];

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [updateVideo, setUpdateVideo] = useState<Video | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchVideos = () => {
    const params = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`/api/videos${params}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setVideos(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVideos(); }, [statusFilter]);

  const grouped = STATUS_GROUPS.map((g) => ({
    ...g,
    videos: videos.filter((v) => v.status === g.key),
  }));

  return (
    <div>
      <Topbar title="Videos" />
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30">
            <option value="">All Statuses</option>
            {STATUS_GROUPS.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}
          </select>
          <div className="flex-1" />
          <button onClick={() => setShowModal(true)} className="px-4 py-2.5 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] transition-colors">
            + Add Video
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-5 h-24 animate-pulse" />)}</div>
        ) : videos.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
            <p className="text-4xl mb-3">🎥</p>
            <p className="font-semibold text-[#2D3142]">No videos yet</p>
            <p className="text-[#9CA3AF] text-sm mt-1">Add your first video</p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.filter((g) => g.videos.length > 0 || !statusFilter).map((group) => (
              group.videos.length > 0 && (
                <div key={group.key}>
                  <h3 className="text-sm font-semibold text-[#6B7280] mb-2 uppercase tracking-wide">
                    {group.label} ({group.videos.length})
                  </h3>
                  <div className="space-y-3">
                    {group.videos.map((video) => (
                      <div key={video.id} className={`rounded-xl border p-5 hover:shadow-md transition-shadow ${group.color}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-[#2D3142] text-sm">
                                {video.brief ? (video.brief as { ideaTitle: string }).ideaTitle : `Video — ${(video.client as { name: string })?.name}`}
                              </p>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(video.status)}`}>
                                v{video.finalVideoVersion}
                              </span>
                            </div>
                            <p className="text-xs text-[#6B7280]">{(video.client as { name: string })?.name}</p>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-[#9CA3AF]">
                              {video.rawFootageLink && (
                                <a href={video.rawFootageLink} target="_blank" rel="noreferrer" className="text-[#6B5B95] hover:underline">📁 Raw Footage</a>
                              )}
                              {video.finalVideoLink && (
                                <a href={video.finalVideoLink} target="_blank" rel="noreferrer" className="text-[#6B5B95] hover:underline">🎬 Final Video</a>
                              )}
                              {video.scheduledPostDate && <span>📅 Post: {formatDate(video.scheduledPostDate)}</span>}
                              {video.scheduledPostPlatform && <span>📱 {video.scheduledPostPlatform}</span>}
                            </div>
                            {video.clientFeedback && (
                              <p className="mt-2 text-xs text-[#6B7280] italic">"{video.clientFeedback}"</p>
                            )}
                          </div>
                          <button
                            onClick={() => setUpdateVideo(video)}
                            className="text-xs px-3 py-1.5 bg-white border border-[#E5E7EB] text-[#6B7280] font-medium rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {showModal && <VideoModal onClose={() => setShowModal(false)} onSave={fetchVideos} />}
      {updateVideo && <UpdateVideoModal video={updateVideo} onClose={() => setUpdateVideo(null)} onSave={fetchVideos} />}
    </div>
  );
}
