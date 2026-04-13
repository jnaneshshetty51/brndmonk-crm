"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";

interface VideoDetail {
  id: string;
  rawFootageLink?: string;
  rawFootageUploadedAt?: string;
  editingStatus: string;
  finalVideoLink?: string;
  finalVideoVersion: number;
  clientApprovalStatus: string;
  clientFeedback?: string;
  sentToClientAt?: string;
  clientApprovedAt?: string;
  versions: Array<{ version: number; link: string; uploadedAt: string; feedback?: string }>;
  status: string;
  scheduledPostDate?: string;
  scheduledPostPlatform?: string;
  scheduledPostCaption?: string;
  postedAt?: string;
  createdAt: string;
  client: { id: string; name: string };
  brief?: { id: string; ideaTitle: string; contentType: string; script: string; music?: string; hashtags?: string; cta?: string };
  shoot?: { id: string; shootDate: string; location?: string };
}

const VIDEO_STATUSES = ["in_editing", "ready_for_approval", "pending_client_approval", "approved", "scheduled", "posted"];

export default function VideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpdate, setShowUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState({
    status: "", finalVideoLink: "", clientFeedback: "", clientApprovalStatus: "",
    scheduledPostDate: "", scheduledPostPlatform: "", scheduledPostCaption: "",
  });

  const fetchVideo = () => {
    fetch(`/api/videos/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setVideo(d.data);
          setForm({
            status: d.data.status,
            finalVideoLink: d.data.finalVideoLink || "",
            clientFeedback: d.data.clientFeedback || "",
            clientApprovalStatus: d.data.clientApprovalStatus,
            scheduledPostDate: d.data.scheduledPostDate?.slice(0, 10) || "",
            scheduledPostPlatform: d.data.scheduledPostPlatform || "",
            scheduledPostCaption: d.data.scheduledPostCaption || "",
          });
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVideo(); }, [id]);

  const saveUpdate = async () => {
    setUpdating(true);
    await fetch(`/api/videos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowUpdate(false);
    fetchVideo();
    setUpdating(false);
  };

  if (loading) return (
    <div><Topbar title="Video" />
      <div className="p-6 space-y-4">{[1,2,3].map(i=><div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-5 h-28 animate-pulse"/>)}</div>
    </div>
  );

  if (!video) return (
    <div><Topbar title="Video" />
      <div className="p-6"><p className="text-[#9CA3AF]">Video not found.</p></div>
    </div>
  );

  const stepIndex = VIDEO_STATUSES.indexOf(video.status);
  const inputClass = "w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95]";

  return (
    <div>
      <Topbar title="Video Detail" />
      <div className="p-6 space-y-4">

        {/* Header */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-[#2D3142]">
                  {video.brief?.ideaTitle || `Video — ${video.client.name}`}
                </h2>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(video.status)}`}>
                  {getStatusLabel(video.status)}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full">v{video.finalVideoVersion}</span>
              </div>
              <p className="text-[#6B7280] text-sm">{video.client.name}</p>
              {video.brief && (
                <Link href={`/briefs/${video.brief.id}`} className="text-xs text-[#6B5B95] hover:underline">
                  View Brief →
                </Link>
              )}
            </div>
            <button onClick={() => setShowUpdate(!showUpdate)} className="px-4 py-2 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] transition-colors">
              Update Video
            </button>
          </div>

          {/* Pipeline progress */}
          <div className="mt-5 overflow-x-auto">
            <div className="flex items-center min-w-max gap-0">
              {VIDEO_STATUSES.map((step, i) => (
                <div key={step} className="flex items-center">
                  <div className={`flex flex-col items-center`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i <= stepIndex ? "bg-[#6B5B95] text-white" : "bg-gray-100 text-gray-400"}`}>
                      {i < stepIndex ? "✓" : i + 1}
                    </div>
                    <p className={`text-[10px] mt-1 whitespace-nowrap ${i <= stepIndex ? "text-[#6B5B95] font-medium" : "text-[#9CA3AF]"}`}>
                      {getStatusLabel(step)}
                    </p>
                  </div>
                  {i < VIDEO_STATUSES.length - 1 && (
                    <div className={`h-0.5 w-8 mx-1 mb-4 ${i < stepIndex ? "bg-[#6B5B95]" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Update form */}
          {showUpdate && (
            <div className="mt-5 pt-5 border-t border-[#F3F4F6] space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                    {VIDEO_STATUSES.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Client Approval</label>
                  <select value={form.clientApprovalStatus} onChange={(e) => setForm({ ...form, clientApprovalStatus: e.target.value })} className={inputClass}>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Final Video Link (Google Drive)</label>
                <input value={form.finalVideoLink} onChange={(e) => setForm({ ...form, finalVideoLink: e.target.value })} className={inputClass} placeholder="https://drive.google.com/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Client Feedback</label>
                <textarea rows={2} value={form.clientFeedback} onChange={(e) => setForm({ ...form, clientFeedback: e.target.value })} className={`${inputClass} resize-none`} placeholder="Client's comments on this video..." />
              </div>
              {(form.status === "scheduled" || form.status === "posted") && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Post Date</label>
                    <input type="date" value={form.scheduledPostDate} onChange={(e) => setForm({ ...form, scheduledPostDate: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Platform</label>
                    <select value={form.scheduledPostPlatform} onChange={(e) => setForm({ ...form, scheduledPostPlatform: e.target.value })} className={inputClass}>
                      <option value="">Select...</option>
                      {["Instagram","Facebook","TikTok","YouTube","LinkedIn"].map(p=><option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Post Caption</label>
                    <textarea rows={3} value={form.scheduledPostCaption} onChange={(e) => setForm({ ...form, scheduledPostCaption: e.target.value })} className={`${inputClass} resize-none`} placeholder="Caption for the post..." />
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => setShowUpdate(false)} className="px-3 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={saveUpdate} disabled={updating} className="px-4 py-2 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] disabled:opacity-50 transition-colors">
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {/* Links */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="font-semibold text-[#2D3142] mb-4">Files</h3>
              <div className="space-y-3">
                {video.rawFootageLink ? (
                  <a href={video.rawFootageLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-xl">📁</span>
                    <div>
                      <p className="text-sm font-medium text-[#2D3142]">Raw Footage</p>
                      <p className="text-xs text-[#9CA3AF] truncate">{video.rawFootageLink}</p>
                    </div>
                    <span className="ml-auto text-[#6B5B95] text-xs">Open →</span>
                  </a>
                ) : <p className="text-[#9CA3AF] text-sm">No raw footage uploaded yet</p>}

                {video.finalVideoLink ? (
                  <a href={video.finalVideoLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-[#6B5B95]/5 rounded-lg hover:bg-[#6B5B95]/10 transition-colors">
                    <span className="text-xl">🎬</span>
                    <div>
                      <p className="text-sm font-medium text-[#2D3142]">Final Video (v{video.finalVideoVersion})</p>
                      <p className="text-xs text-[#9CA3AF] truncate">{video.finalVideoLink}</p>
                    </div>
                    <span className="ml-auto text-[#6B5B95] text-xs">Open →</span>
                  </a>
                ) : <p className="text-[#9CA3AF] text-sm">No final video uploaded yet</p>}
              </div>
            </div>

            {/* Brief info */}
            {video.brief && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <h3 className="font-semibold text-[#2D3142] mb-4">Content Brief</h3>
                <div className="space-y-3 text-sm">
                  <div><p className="text-xs text-[#9CA3AF] uppercase mb-1">Script</p><p className="text-[#2D3142] whitespace-pre-wrap">{video.brief.script}</p></div>
                  {video.brief.music && <div><p className="text-xs text-[#9CA3AF] uppercase mb-1">Music</p><p className="text-[#2D3142]">🎵 {video.brief.music}</p></div>}
                  {video.brief.hashtags && <div><p className="text-xs text-[#9CA3AF] uppercase mb-1">Hashtags</p><p className="text-[#2D3142] text-xs">{video.brief.hashtags}</p></div>}
                  {video.brief.cta && <div><p className="text-xs text-[#9CA3AF] uppercase mb-1">CTA</p><p className="text-[#2D3142]">👉 {video.brief.cta}</p></div>}
                </div>
              </div>
            )}

            {/* Client feedback */}
            {video.clientFeedback && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                <h3 className="font-semibold text-orange-700 mb-2">Client Feedback</h3>
                <p className="text-sm text-orange-800">{video.clientFeedback}</p>
              </div>
            )}

            {/* Post details */}
            {video.scheduledPostDate && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <h3 className="font-semibold text-[#2D3142] mb-4">Post Schedule</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#9CA3AF]">Platform</span><span className="font-medium text-[#2D3142]">{video.scheduledPostPlatform || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-[#9CA3AF]">Date</span><span className="font-medium text-[#2D3142]">{formatDate(video.scheduledPostDate)}</span></div>
                  {video.postedAt && <div className="flex justify-between"><span className="text-[#9CA3AF]">Posted</span><span className="font-medium text-green-600">{formatDate(video.postedAt)}</span></div>}
                  {video.scheduledPostCaption && <div className="pt-2 border-t border-[#F3F4F6]"><p className="text-[#9CA3AF] mb-1">Caption</p><p className="text-[#2D3142] whitespace-pre-wrap text-xs">{video.scheduledPostCaption}</p></div>}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Version history */}
            {video.versions.length > 0 && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <h3 className="font-semibold text-[#2D3142] mb-4">Version History</h3>
                <div className="space-y-3">
                  {[...video.versions].reverse().map((v) => (
                    <div key={v.version} className="pb-3 border-b border-[#F3F4F6] last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#6B5B95]">Version {v.version}</span>
                        <span className="text-xs text-[#9CA3AF]">{formatDate(v.uploadedAt)}</span>
                      </div>
                      <a href={v.link} target="_blank" rel="noreferrer" className="text-xs text-[#6B5B95] hover:underline truncate block">View Video →</a>
                      {v.feedback && <p className="text-xs text-[#6B7280] mt-1 italic">"{v.feedback}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick stats */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="font-semibold text-[#2D3142] mb-4">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[#9CA3AF]">Client Approval</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(video.clientApprovalStatus)}`}>{getStatusLabel(video.clientApprovalStatus)}</span>
                </div>
                {video.sentToClientAt && <div className="flex justify-between"><span className="text-[#9CA3AF]">Sent to Client</span><span className="text-[#2D3142]">{formatDate(video.sentToClientAt)}</span></div>}
                {video.clientApprovedAt && <div className="flex justify-between"><span className="text-[#9CA3AF]">Approved</span><span className="text-green-600">{formatDate(video.clientApprovedAt)}</span></div>}
                <div className="flex justify-between"><span className="text-[#9CA3AF]">Created</span><span className="text-[#2D3142]">{formatDate(video.createdAt)}</span></div>
              </div>
            </div>
          </div>
        </div>

        <Link href="/videos" className="inline-block text-sm text-[#6B5B95] hover:underline pb-4">← Back to Videos</Link>
      </div>
    </div>
  );
}
