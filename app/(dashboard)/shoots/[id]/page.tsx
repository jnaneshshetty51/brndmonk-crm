"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";

interface ShootDetail {
  id: string;
  shootName?: string;
  shootDate: string;
  duration?: number;
  location?: string;
  briefIds: string[];
  assignedMembers: Array<{ memberId: string; name?: string; role: string }>;
  equipmentNeeded?: string;
  specialInstructions?: string;
  rawFootageLocation?: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
  notesPostShoot?: string;
  reminderSent24h: boolean;
  reminderSent1h: boolean;
  createdAt: string;
  client: { id: string; name: string };
  calendar?: { id: string; month: string; year: number };
}

const STATUS_STEPS = ["scheduled", "in_progress", "completed"];

export default function ShootDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [shoot, setShoot] = useState<ShootDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editFields, setEditFields] = useState({ rawFootageLocation: "", notesPostShoot: "", status: "" });
  const [showUpdate, setShowUpdate] = useState(false);

  const fetchShoot = () => {
    fetch(`/api/shoots/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setShoot(d.data);
          setEditFields({ rawFootageLocation: d.data.rawFootageLocation || "", notesPostShoot: d.data.notesPostShoot || "", status: d.data.status });
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchShoot(); }, [id]);

  const [creatingVideos, setCreatingVideos] = useState(false);
  const [videosCreated, setVideosCreated] = useState(false);

  const updateShoot = async () => {
    setUpdating(true);
    await fetch(`/api/shoots/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editFields),
    });
    setShowUpdate(false);
    fetchShoot();
    setUpdating(false);
  };

  const createVideosFromShoot = async () => {
    if (!shoot) return;
    setCreatingVideos(true);
    const res = await fetch(`/api/shoots/${id}/create-videos`, { method: "POST" });
    const data = await res.json();
    if (data.success) setVideosCreated(true);
    setCreatingVideos(false);
  };

  if (loading) return (
    <div><Topbar title="Shoot" />
      <div className="p-6 space-y-4">{[1,2,3].map(i=><div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-5 h-28 animate-pulse"/>)}</div>
    </div>
  );

  if (!shoot) return (
    <div><Topbar title="Shoot" />
      <div className="p-6"><p className="text-[#9CA3AF]">Shoot not found.</p></div>
    </div>
  );

  const stepIndex = STATUS_STEPS.indexOf(shoot.status);

  return (
    <div>
      <Topbar title={shoot.shootName || "Shoot Detail"} />
      <div className="p-6 space-y-4">

        {/* Header */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-[#2D3142]">{shoot.shootName || "Unnamed Shoot"}</h2>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(shoot.status)}`}>
                  {getStatusLabel(shoot.status)}
                </span>
              </div>
              <p className="text-[#6B7280] text-sm">{shoot.client.name}</p>
              {shoot.calendar && (
                <Link href={`/calendars/${shoot.calendar.id}`} className="text-xs text-[#6B5B95] hover:underline">
                  {shoot.calendar.month} {shoot.calendar.year} Calendar
                </Link>
              )}
            </div>
            <button onClick={() => setShowUpdate(!showUpdate)} className="px-4 py-2 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] transition-colors">
              Update Status
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="flex items-center gap-0">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i <= stepIndex ? "bg-[#6B5B95] text-white" : "bg-gray-100 text-gray-400"}`}>
                    {i < stepIndex ? "✓" : i + 1}
                  </div>
                  <p className={`text-xs ml-1.5 flex-1 ${i <= stepIndex ? "text-[#6B5B95] font-medium" : "text-[#9CA3AF]"}`}>
                    {getStatusLabel(step)}
                  </p>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 ${i < stepIndex ? "bg-[#6B5B95]" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Auto-create videos banner */}
          {shoot.status === "completed" && !videosCreated && (
            <div className="mt-4 pt-4 border-t border-[#F3F4F6] flex items-center justify-between bg-[#5DCCC4]/10 rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-[#2BAAA0]">Shoot complete — ready to create videos?</p>
                <p className="text-xs text-[#6B7280] mt-0.5">Auto-creates a video entry in the pipeline for each linked brief.</p>
              </div>
              <button onClick={createVideosFromShoot} disabled={creatingVideos}
                className="px-4 py-2 bg-[#5DCCC4] text-white text-sm font-medium rounded-lg hover:bg-[#2BAAA0] disabled:opacity-50 transition-colors flex-shrink-0">
                {creatingVideos ? "Creating..." : "🎥 Create Videos"}
              </button>
            </div>
          )}
          {videosCreated && (
            <div className="mt-4 pt-4 border-t border-[#F3F4F6] bg-green-50 rounded-lg p-3">
              <p className="text-sm font-medium text-green-700">✓ Videos created and added to the pipeline.</p>
            </div>
          )}

          {/* Update form */}
          {showUpdate && (
            <div className="mt-5 pt-5 border-t border-[#F3F4F6] space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Status</label>
                <select value={editFields.status} onChange={(e) => setEditFields({ ...editFields, status: e.target.value })} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30">
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              {editFields.status === "completed" && (
                <div>
                  <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Raw Footage Link (Google Drive)</label>
                  <input value={editFields.rawFootageLocation} onChange={(e) => setEditFields({ ...editFields, rawFootageLocation: e.target.value })} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30" placeholder="https://drive.google.com/..." />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Post-Shoot Notes</label>
                <textarea rows={2} value={editFields.notesPostShoot} onChange={(e) => setEditFields({ ...editFields, notesPostShoot: e.target.value })} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 resize-none" placeholder="What happened, issues..." />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowUpdate(false)} className="px-3 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={updateShoot} disabled={updating} className="px-4 py-2 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] disabled:opacity-50 transition-colors">
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Shoot details */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="font-semibold text-[#2D3142] mb-4">Shoot Details</h3>
            <div className="space-y-3 text-sm">
              {[
                { label: "Date & Time", value: new Date(shoot.shootDate).toLocaleString() },
                { label: "Duration", value: shoot.duration ? `${shoot.duration} minutes` : "—" },
                { label: "Location", value: shoot.location || "—" },
                { label: "Briefs Covered", value: `${shoot.briefIds.length} brief(s)` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-[#9CA3AF]">{label}</span>
                  <span className="text-[#2D3142] font-medium">{value}</span>
                </div>
              ))}
              {shoot.rawFootageLocation && (
                <div className="pt-2 border-t border-[#F3F4F6]">
                  <a href={shoot.rawFootageLocation} target="_blank" rel="noreferrer" className="text-[#6B5B95] hover:underline text-sm font-medium">
                    📁 View Raw Footage →
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Team */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="font-semibold text-[#2D3142] mb-4">Assigned Team</h3>
            {shoot.assignedMembers.length === 0 ? (
              <p className="text-[#9CA3AF] text-sm">No team members assigned</p>
            ) : (
              <div className="space-y-2">
                {shoot.assignedMembers.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-[#F9FAFB] rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#5DCCC4]/20 flex items-center justify-center text-[#2BAAA0] font-bold text-xs">
                        {(m.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-[#2D3142]">{m.name || m.memberId}</span>
                    </div>
                    <span className="text-xs text-[#9CA3AF]">{m.role}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Equipment & Instructions */}
          {(shoot.equipmentNeeded || shoot.specialInstructions) && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="font-semibold text-[#2D3142] mb-4">Notes for Team</h3>
              {shoot.equipmentNeeded && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-[#9CA3AF] uppercase mb-1">Equipment Needed</p>
                  <p className="text-sm text-[#2D3142]">{shoot.equipmentNeeded}</p>
                </div>
              )}
              {shoot.specialInstructions && (
                <div>
                  <p className="text-xs font-medium text-[#9CA3AF] uppercase mb-1">Special Instructions</p>
                  <p className="text-sm text-[#2D3142]">{shoot.specialInstructions}</p>
                </div>
              )}
            </div>
          )}

          {/* Post-shoot notes */}
          {shoot.notesPostShoot && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <h3 className="font-semibold text-yellow-800 mb-2">Post-Shoot Notes</h3>
              <p className="text-sm text-yellow-700">{shoot.notesPostShoot}</p>
              {shoot.completedAt && <p className="text-xs text-yellow-500 mt-2">Completed {formatDate(shoot.completedAt)}</p>}
            </div>
          )}
        </div>

        <Link href="/shoots" className="inline-block text-sm text-[#6B5B95] hover:underline pb-4">← Back to Shoots</Link>
      </div>
    </div>
  );
}
