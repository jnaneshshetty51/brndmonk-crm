"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/Topbar";
import { useAuth } from "@/context/AuthContext";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function SettingsPage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setProfile(d.data);
          setProfileForm({ name: d.data.name, email: d.data.email });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    const res = await fetch("/api/auth/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: profileForm.name, email: profileForm.email }),
    });
    const data = await res.json();
    if (data.success) {
      setProfile(data.data);
      setProfileMsg({ type: "success", text: "Profile updated successfully." });
    } else {
      setProfileMsg({ type: "error", text: data.error || "Failed to update profile." });
    }
    setProfileSaving(false);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    if (passForm.newPassword !== passForm.confirm) {
      return setPassMsg({ type: "error", text: "New passwords do not match." });
    }
    if (passForm.newPassword.length < 6) {
      return setPassMsg({ type: "error", text: "Password must be at least 6 characters." });
    }
    setPassSaving(true);
    const res = await fetch("/api/auth/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword }),
    });
    const data = await res.json();
    if (data.success) {
      setPassForm({ currentPassword: "", newPassword: "", confirm: "" });
      setPassMsg({ type: "success", text: "Password changed successfully." });
    } else {
      setPassMsg({ type: "error", text: data.error || "Failed to change password." });
    }
    setPassSaving(false);
  };

  const inputClass = "w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95]";
  const labelClass = "block text-sm font-medium text-[#2D3142] mb-1.5";

  const roleLabels: Record<string, string> = {
    admin: "Admin",
    social_team: "Social Media Team",
    dev_team: "Dev Team",
  };

  if (loading) return (
    <div><Topbar title="Settings" />
      <div className="p-6 space-y-4">{[1,2].map(i=><div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-5 h-40 animate-pulse"/>)}</div>
    </div>
  );

  return (
    <div>
      <Topbar title="Settings" />
      <div className="p-6 space-y-4 max-w-2xl">

        {/* Profile card */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#6B5B95]/15 flex items-center justify-center text-[#6B5B95] font-bold text-2xl">
              {profile?.name?.charAt(0).toUpperCase() || authUser?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2D3142]">{profile?.name || authUser?.name}</h2>
              <p className="text-sm text-[#6B7280]">{profile?.email || authUser?.email}</p>
              <span className="text-xs px-2 py-0.5 bg-[#6B5B95]/10 text-[#6B5B95] rounded-full font-medium mt-1 inline-block">
                {roleLabels[profile?.role || authUser?.role || ""] || profile?.role || authUser?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-[#E5E7EB] p-1 w-fit">
          {(["profile", "password"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? "bg-[#6B5B95] text-white" : "text-[#6B7280] hover:bg-gray-50"}`}>
              {tab === "profile" ? "Edit Profile" : "Change Password"}
            </button>
          ))}
        </div>

        {/* Profile form */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h3 className="font-semibold text-[#2D3142] mb-5">Profile Information</h3>
            {profileMsg && (
              <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${profileMsg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
                {profileMsg.text}
              </div>
            )}
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className={labelClass}>Full Name</label>
                <input required value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className={inputClass} placeholder="Your full name" />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input required type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className={inputClass} placeholder="you@agency.com" />
              </div>
              <div>
                <label className={labelClass}>Role</label>
                <input disabled value={roleLabels[profile?.role || ""] || profile?.role || ""} className={`${inputClass} bg-gray-50 text-[#9CA3AF] cursor-not-allowed`} />
                <p className="text-xs text-[#9CA3AF] mt-1">Role can only be changed by an admin.</p>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={profileSaving} className="px-6 py-2.5 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] disabled:opacity-50 transition-colors">
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Password form */}
        {activeTab === "password" && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h3 className="font-semibold text-[#2D3142] mb-5">Change Password</h3>
            {passMsg && (
              <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${passMsg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
                {passMsg.text}
              </div>
            )}
            <form onSubmit={changePassword} className="space-y-4">
              <div>
                <label className={labelClass}>Current Password</label>
                <input required type="password" value={passForm.currentPassword} onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })} className={inputClass} placeholder="Enter current password" />
              </div>
              <div>
                <label className={labelClass}>New Password</label>
                <input required type="password" value={passForm.newPassword} onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })} className={inputClass} placeholder="Min 6 characters" />
              </div>
              <div>
                <label className={labelClass}>Confirm New Password</label>
                <input required type="password" value={passForm.confirm} onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })} className={inputClass} placeholder="Repeat new password" />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={passSaving} className="px-6 py-2.5 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] disabled:opacity-50 transition-colors">
                  {passSaving ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
