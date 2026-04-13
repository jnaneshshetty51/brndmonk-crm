"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";

interface TeamMemberDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  skills: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface AssignedShoot {
  id: string;
  shootName?: string;
  shootDate: string;
  status: string;
  client: { name: string };
}

interface AssignedVideo {
  id: string;
  editingStatus: string;
  status: string;
  client: { name: string };
  brief?: { ideaTitle: string };
}

export default function TeamMemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<TeamMemberDetail | null>(null);
  const [shoots, setShoots] = useState<AssignedShoot[]>([]);
  const [videos, setVideos] = useState<AssignedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "shoots" | "videos">("profile");
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", role: "", department: "", skills: "", status: "" });
  const [saving, setSaving] = useState(false);

  const fetchMember = () => {
    fetch(`/api/teams/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setMember(d.data);
          setEditForm({
            name: d.data.name,
            email: d.data.email,
            phone: d.data.phone || "",
            role: d.data.role,
            department: d.data.department,
            skills: (d.data.skills as string[]).join(", "),
            status: d.data.status,
          });
        }
      })
      .finally(() => setLoading(false));
  };

  const fetchWorkload = () => {
    fetch(`/api/shoots?limit=100`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const assigned = d.data.filter((s: { assignedMembers: Array<{ memberId: string }> }) =>
            (s.assignedMembers as Array<{ memberId: string }>).some((m) => m.memberId === id)
          );
          setShoots(assigned);
        }
      });
    fetch(`/api/videos?limit=100`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const assigned = d.data.filter((v: { editorId: string }) => v.editorId === id);
          setVideos(assigned);
        }
      });
  };

  useEffect(() => {
    fetchMember();
    fetchWorkload();
  }, [id]);

  const saveMember = async () => {
    setSaving(true);
    await fetch(`/api/teams/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        skills: editForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    });
    setShowEdit(false);
    fetchMember();
    setSaving(false);
  };

  if (loading) return (
    <div><Topbar title="Team Member" />
      <div className="p-6 space-y-4">{[1,2,3].map(i=><div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-5 h-28 animate-pulse"/>)}</div>
    </div>
  );

  if (!member) return (
    <div><Topbar title="Team Member" />
      <div className="p-6"><p className="text-[#9CA3AF]">Team member not found.</p></div>
    </div>
  );

  const inputClass = "w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30";
  const deptLabel = member.department === "social_media" ? "Social Media" : "App / Web Dev";
  const deptColor = member.department === "social_media" ? "bg-[#6B5B95]/10 text-[#6B5B95]" : "bg-[#5DCCC4]/10 text-[#2BAAA0]";

  return (
    <div>
      <Topbar title={member.name} />
      <div className="p-6 space-y-4">

        {/* Header */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#5DCCC4]/20 flex items-center justify-center text-[#2BAAA0] font-bold text-2xl">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-[#2D3142]">{member.name}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(member.status)}`}>
                    {getStatusLabel(member.status)}
                  </span>
                </div>
                <p className="text-sm text-[#6B7280]">{member.role}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${deptColor}`}>{deptLabel}</span>
                </div>
              </div>
            </div>
            <button onClick={() => setShowEdit(!showEdit)} className="px-4 py-2 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] transition-colors">
              Edit Profile
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-[#F3F4F6]">
            {[
              { label: "Shoots Assigned", value: shoots.length },
              { label: "Videos Assigned", value: videos.length },
              { label: "Skills", value: member.skills.length },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-[#6B5B95]">{value}</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Edit form */}
          {showEdit && (
            <div className="mt-5 pt-5 border-t border-[#F3F4F6] space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Name</label>
                  <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Email</label>
                  <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Phone</label>
                  <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Role</label>
                  <input value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Department</label>
                  <select value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} className={inputClass}>
                    <option value="social_media">Social Media</option>
                    <option value="app_web">App / Web Dev</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Status</label>
                  <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className={inputClass}>
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Skills (comma-separated)</label>
                <input value={editForm.skills} onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })} className={inputClass} placeholder="Cinematography, Editing..." />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowEdit(false)} className="px-3 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={saveMember} disabled={saving} className="px-4 py-2 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] disabled:opacity-50 transition-colors">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-[#E5E7EB] p-1 w-fit">
          {(["profile", "shoots", "videos"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? "bg-[#6B5B95] text-white" : "text-[#6B7280] hover:bg-gray-50"}`}>
              {tab === "shoots" ? `Shoots (${shoots.length})` : tab === "videos" ? `Videos (${videos.length})` : "Profile"}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="font-semibold text-[#2D3142] mb-4">Contact Details</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Email", value: member.email },
                  { label: "Phone", value: member.phone || "—" },
                  { label: "Member Since", value: formatDate(member.createdAt) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[#9CA3AF]">{label}</span>
                    <span className="text-[#2D3142] font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="font-semibold text-[#2D3142] mb-4">Skills</h3>
              {member.skills.length === 0 ? (
                <p className="text-[#9CA3AF] text-sm">No skills added</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 bg-[#6B5B95]/10 text-[#6B5B95] rounded-full font-medium">{skill}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shoots tab */}
        {activeTab === "shoots" && (
          <div className="space-y-3">
            {shoots.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-10 text-center">
                <p className="text-3xl mb-2">🎬</p>
                <p className="text-[#9CA3AF] text-sm">No shoots assigned to this member</p>
              </div>
            ) : (
              shoots.map((s) => (
                <div key={s.id} className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-[#2D3142] text-sm">{s.shootName || "Unnamed Shoot"}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(s.status)}`}>
                        {getStatusLabel(s.status)}
                      </span>
                    </div>
                    <p className="text-xs text-[#9CA3AF]">{s.client.name} · {new Date(s.shootDate).toLocaleDateString()}</p>
                  </div>
                  <Link href={`/shoots/${s.id}`} className="text-sm text-[#6B5B95] font-medium hover:underline">View →</Link>
                </div>
              ))
            )}
          </div>
        )}

        {/* Videos tab */}
        {activeTab === "videos" && (
          <div className="space-y-3">
            {videos.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-10 text-center">
                <p className="text-3xl mb-2">🎥</p>
                <p className="text-[#9CA3AF] text-sm">No videos assigned to this member as editor</p>
              </div>
            ) : (
              videos.map((v) => (
                <div key={v.id} className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-[#2D3142] text-sm">{v.brief?.ideaTitle || "Untitled Video"}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(v.editingStatus)}`}>
                        {getStatusLabel(v.editingStatus)}
                      </span>
                    </div>
                    <p className="text-xs text-[#9CA3AF]">{v.client.name}</p>
                  </div>
                  <Link href={`/videos/${v.id}`} className="text-sm text-[#6B5B95] font-medium hover:underline">View →</Link>
                </div>
              ))
            )}
          </div>
        )}

        <Link href="/teams" className="inline-block text-sm text-[#6B5B95] hover:underline pb-4">← Back to Team</Link>
      </div>
    </div>
  );
}
