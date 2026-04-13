"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";

interface Brief {
  id: string;
  briefNumber: string;
  contentType: string;
  ideaTitle: string;
  ideaDescription: string;
  visualDescription: string;
  script: string;
  music?: string;
  hashtags?: string;
  cta?: string;
  moodBoardLinks?: string;
  specialRequirements?: string;
  status: string;
  approvalDeadline?: string;
  clientFeedback?: string;
  revisionNotes?: string;
  currentVersion: number;
  versions: Array<{ version: number; createdAt: string; changes: string }>;
  sentToClientAt?: string;
  approvedAt?: string;
  lastRevisedAt?: string;
  createdAt: string;
  updatedAt: string;
  calendar: {
    id: string; month: string; year: number;
    client: { id: string; name: string };
  };
}

const contentTypeIcon: Record<string, string> = { Reel: "🎬", Post: "📸", Carousel: "📑", Story: "⭕" };

export default function BriefDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [showFeedbackBox, setShowFeedbackBox] = useState<"reject" | "revision" | null>(null);

  const fetchBrief = () => {
    fetch(`/api/briefs/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setBrief(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBrief(); }, [id]);

  const approve = async () => {
    setActionLoading("approve");
    await fetch(`/api/briefs/${id}/approve`, { method: "PUT" });
    fetchBrief();
    setActionLoading("");
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim() || !showFeedbackBox) return;
    setActionLoading("feedback");
    await fetch(`/api/briefs/${id}/reject`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback: feedbackText, action: showFeedbackBox }),
    });
    setFeedbackText("");
    setShowFeedbackBox(null);
    fetchBrief();
    setActionLoading("");
  };

  if (loading) return (
    <div><Topbar title="Brief" />
      <div className="p-6 space-y-4">{[1,2,3].map(i=><div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-5 h-28 animate-pulse"/>)}</div>
    </div>
  );

  if (!brief) return (
    <div><Topbar title="Brief" />
      <div className="p-6"><p className="text-[#9CA3AF]">Brief not found.</p></div>
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <h3 className="font-semibold text-[#2D3142] mb-3 text-sm uppercase tracking-wide text-[#9CA3AF]">{title}</h3>
      {children}
    </div>
  );

  return (
    <div>
      <Topbar title="Brief Detail" />
      <div className="p-6 space-y-4">

        {/* Header */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{contentTypeIcon[brief.contentType] || "📄"}</span>
                <span className="text-xs text-[#9CA3AF] font-medium">#{brief.briefNumber}</span>
                <span className="text-xs px-2 py-0.5 bg-[#6B5B95]/10 text-[#6B5B95] rounded-full font-medium">{brief.contentType}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(brief.status)}`}>
                  {getStatusLabel(brief.status)}
                </span>
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">v{brief.currentVersion}</span>
              </div>
              <h2 className="text-xl font-bold text-[#2D3142]">{brief.ideaTitle}</h2>
              <p className="text-sm text-[#6B7280] mt-0.5">
                {brief.calendar?.client?.name} ·{" "}
                <Link href={`/calendars/${brief.calendar?.id}`} className="text-[#6B5B95] hover:underline">
                  {brief.calendar?.month} {brief.calendar?.year} Calendar
                </Link>
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-shrink-0">
              {brief.status !== "approved" && (
                <button onClick={approve} disabled={actionLoading === "approve"} className="px-4 py-2 bg-green-50 text-green-600 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50">
                  {actionLoading === "approve" ? "..." : "✓ Approve"}
                </button>
              )}
              {brief.status !== "approved" && (
                <>
                  <button onClick={() => setShowFeedbackBox("revision")} className="px-4 py-2 bg-orange-50 text-orange-600 text-sm font-medium rounded-lg hover:bg-orange-100 transition-colors">
                    Request Changes
                  </button>
                  <button onClick={() => setShowFeedbackBox("reject")} className="px-4 py-2 bg-red-50 text-red-500 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors">
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Feedback box */}
          {showFeedbackBox && (
            <div className="mt-4 pt-4 border-t border-[#F3F4F6]">
              <label className="block text-sm font-medium text-[#2D3142] mb-2">
                {showFeedbackBox === "revision" ? "What needs to change?" : "Reason for rejection"}
              </label>
              <textarea
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 resize-none"
                placeholder="Be specific about what needs to change..."
              />
              <div className="flex gap-2 mt-2">
                <button onClick={() => setShowFeedbackBox(null)} className="px-3 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={submitFeedback} disabled={!feedbackText.trim() || actionLoading === "feedback"} className={`px-4 py-2 text-sm font-medium rounded-lg text-white disabled:opacity-50 transition-colors ${showFeedbackBox === "revision" ? "bg-orange-500 hover:bg-orange-600" : "bg-red-500 hover:bg-red-600"}`}>
                  {actionLoading === "feedback" ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[#F3F4F6] text-xs text-[#9CA3AF]">
            <span>Created {formatDate(brief.createdAt)}</span>
            {brief.sentToClientAt && <span>· Sent {formatDate(brief.sentToClientAt)}</span>}
            {brief.approvedAt && <span className="text-green-500">· Approved {formatDate(brief.approvedAt)}</span>}
            {brief.approvalDeadline && <span>· Due {formatDate(brief.approvalDeadline)}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            <Section title="Idea">
              <p className="text-sm text-[#2D3142] leading-relaxed">{brief.ideaDescription}</p>
            </Section>

            <Section title="Visual Description">
              <p className="text-sm text-[#2D3142] leading-relaxed whitespace-pre-wrap">{brief.visualDescription}</p>
            </Section>

            <Section title="Script / Talking Points">
              <p className="text-sm text-[#2D3142] leading-relaxed whitespace-pre-wrap">{brief.script}</p>
            </Section>

            {brief.specialRequirements && (
              <Section title="Special Requirements">
                <p className="text-sm text-[#2D3142]">{brief.specialRequirements}</p>
              </Section>
            )}

            {/* Client feedback */}
            {brief.clientFeedback && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                <h3 className="font-semibold text-orange-700 mb-2 text-sm">Client Feedback</h3>
                <p className="text-sm text-orange-800 leading-relaxed">{brief.clientFeedback}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Details */}
            <Section title="Details">
              <div className="space-y-2 text-sm">
                {brief.music && (
                  <div><span className="text-[#9CA3AF]">Music</span><p className="text-[#2D3142] mt-0.5">🎵 {brief.music}</p></div>
                )}
                {brief.cta && (
                  <div><span className="text-[#9CA3AF]">Call to Action</span><p className="text-[#2D3142] mt-0.5">👉 {brief.cta}</p></div>
                )}
                {brief.hashtags && (
                  <div><span className="text-[#9CA3AF]">Hashtags</span><p className="text-[#2D3142] mt-0.5 text-xs">{brief.hashtags}</p></div>
                )}
                {brief.moodBoardLinks && (
                  <div>
                    <span className="text-[#9CA3AF]">Mood Board</span>
                    <a href={brief.moodBoardLinks} target="_blank" rel="noreferrer" className="block text-[#6B5B95] hover:underline text-xs mt-0.5 truncate">
                      {brief.moodBoardLinks}
                    </a>
                  </div>
                )}
              </div>
            </Section>

            {/* Version History */}
            {brief.versions.length > 0 && (
              <Section title="Version History">
                <div className="space-y-3">
                  {[...brief.versions].reverse().map((v) => (
                    <div key={v.version} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#6B5B95]/10 flex items-center justify-center text-[#6B5B95] text-xs font-bold flex-shrink-0">
                        {v.version}
                      </div>
                      <div>
                        <p className="text-xs text-[#2D3142] font-medium">{v.changes}</p>
                        <p className="text-xs text-[#9CA3AF]">{formatDate(v.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        </div>

        <Link href={`/calendars/${brief.calendar?.id}`} className="inline-block text-sm text-[#6B5B95] hover:underline pb-4">
          ← Back to Calendar
        </Link>
      </div>
    </div>
  );
}
