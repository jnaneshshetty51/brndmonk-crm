"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/Topbar";
import { getStatusColor, getStatusLabel } from "@/lib/utils";
import type { TeamMember } from "@/types";

function TeamModal({ member, onClose, onSave }: { member?: TeamMember | null; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    name: member?.name || "",
    email: member?.email || "",
    phone: member?.phone || "",
    role: member?.role || "",
    department: (member?.department as "social_media" | "app_web") || "social_media",
    skills: member?.skills?.join(", ") || "",
    status: member?.status || "active",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = member ? `/api/teams/${member.id}` : "/api/teams";
    const method = member ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean) }),
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
          <h2 className="font-semibold text-[#2D3142]">{member ? "Edit Team Member" : "Add Team Member"}</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#2D3142] text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="John Doe" />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="john@agency.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className={labelClass}>Role *</label>
              <input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputClass} placeholder="Cinematographer, Editor..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Department *</label>
              <select required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value as "social_media" | "app_web" })} className={inputClass}>
                <option value="social_media">Social Media</option>
                <option value="app_web">App / Web Dev</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Skills (comma-separated)</label>
            <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} className={inputClass} placeholder="Cinematography, Video Editing, Color Grading..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-[#E5E7EB] text-[#6B7280] text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] disabled:opacity-50 transition-colors">
              {saving ? "Saving..." : member ? "Update" : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TeamsPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);

  const fetchMembers = () => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then((d) => { if (d.success) setMembers(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMembers(); }, []);

  const deleteMember = async (id: string) => {
    if (!confirm("Remove this team member?")) return;
    await fetch(`/api/teams/${id}`, { method: "DELETE" });
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const deptColors: Record<string, string> = {
    social_media: "bg-[#6B5B95]/10 text-[#6B5B95]",
    app_web: "bg-[#5DCCC4]/10 text-[#2BAAA0]",
  };

  return (
    <div>
      <Topbar title="Team" />
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#6B7280]">Manage your team members and their assignments</p>
          <button onClick={() => { setEditMember(null); setShowModal(true); }} className="px-4 py-2.5 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] transition-colors">
            + Add Member
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-5 h-40 animate-pulse" />)}
          </div>
        ) : members.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
            <p className="text-4xl mb-3">🤝</p>
            <p className="font-semibold text-[#2D3142]">No team members yet</p>
            <p className="text-[#9CA3AF] text-sm mt-1">Add your first team member</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <div key={member.id} className="bg-white rounded-xl border border-[#E5E7EB] p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#5DCCC4]/20 flex items-center justify-center text-[#2BAAA0] font-bold text-sm">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-[#2D3142] text-sm">{member.name}</p>
                      <p className="text-xs text-[#6B7280]">{member.role}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(member.status)}`}>
                    {getStatusLabel(member.status)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${deptColors[member.department]}`}>
                    {member.department === "social_media" ? "Social Media" : "App / Web"}
                  </span>
                </div>

                {member.skills && member.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(member.skills as string[]).slice(0, 3).map((skill, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{skill}</span>
                    ))}
                    {(member.skills as string[]).length > 3 && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">+{(member.skills as string[]).length - 3} more</span>
                    )}
                  </div>
                )}

                <p className="text-xs text-[#9CA3AF] mb-3">{member.email}</p>

                <div className="flex items-center gap-2 pt-3 border-t border-[#F3F4F6]">
                  <button onClick={() => { setEditMember(member); setShowModal(true); }} className="text-xs text-[#6B7280] hover:text-[#6B5B95] font-medium transition-colors">Edit</button>
                  <button onClick={() => deleteMember(member.id)} className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <TeamModal member={editMember} onClose={() => setShowModal(false)} onSave={fetchMembers} />}
    </div>
  );
}
